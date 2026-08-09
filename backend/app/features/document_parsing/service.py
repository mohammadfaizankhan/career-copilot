
from __future__ import annotations

import hashlib
import io
import re
import zipfile
from pathlib import Path

from app.core.errors import ApiError
from app.features.document_parsing.parsing.llm_sections import extract_sections_enriched
from app.features.document_parsing.parsing.sections import (
    HEADING_ALIASES,
    canonicalize_sections,
    canonical_section_key,
    extract_sections,
    match_section_heading,
)
from app.features.document_parsing.parsing.text_extract import DOCX_MIME, PDF_MIME, extract_text

ALLOWED_SUFFIXES = {".pdf": PDF_MIME, ".docx": DOCX_MIME}
__all__ = [
    "PDF_MIME",
    "DOCX_MIME",
    "ALLOWED_SUFFIXES",
    "HEADING_ALIASES",
    "safe_filename",
    "sha256_bytes",
    "validate_document",
    "extract_text",
    "extract_sections",
    "extract_sections_enriched",
    "match_section_heading",
    "canonicalize_sections",
    "canonical_section_key",
    "infer_resume_title",
    "infer_job_metadata",
    "extract_skill_candidates",
    "skill_source_text",
    "is_skillish_section_key",
]
def safe_filename(filename: str) -> str:
    name = Path(filename).name
    return re.sub(r"[^A-Za-z0-9._-]", "_", name)[:180] or "document"
def sha256_bytes(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()
def validate_document(filename: str, declared_mime: str | None, content: bytes, max_bytes: int) -> str:
    if not content:
        raise ApiError(400, "empty_document", "The selected document is empty.")
    if len(content) > max_bytes:
        max_mb = max(1, int(max_bytes / (1024 * 1024)))
        raise ApiError(
            413,
            "document_too_large",
            f"The selected document exceeds the {max_mb} MB limit.",
        )
    suffix = Path(filename).suffix.lower()
    expected = ALLOWED_SUFFIXES.get(suffix)
    if not expected:
        raise ApiError(415, "unsupported_document_type", "Only PDF and DOCX documents are supported.")
    if declared_mime and declared_mime not in {expected, "application/octet-stream"}:
        raise ApiError(415, "document_mime_mismatch", "The file extension and MIME type do not match.")
    if suffix == ".pdf" and not content.startswith(b"%PDF-"):
        raise ApiError(415, "invalid_pdf_signature", "The selected file is not a valid PDF.")
    if suffix == ".docx":
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                if "word/document.xml" not in archive.namelist():
                    raise ApiError(
                        415, "invalid_docx_structure", "The selected file is not a valid DOCX document."
                    )
        except zipfile.BadZipFile as exc:
            raise ApiError(415, "invalid_docx_archive", "The selected DOCX file is corrupted.") from exc
    return expected
def infer_resume_title(filename: str | None) -> str:
    stem = Path(filename or "Resume").stem
    cleaned = re.sub(r"[_\-]+", " ", stem).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return (cleaned or "Resume")[:200]
_ROLE_HINT = re.compile(
    r"\b(engineer|developer|analyst|manager|designer|scientist|architect|specialist|"
    r"lead|intern|consultant|administrator|officer|coordinator|executive|director)\b",
    re.I,
)
def infer_job_metadata(text: str) -> dict[str, str | None]:
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    role: str | None = None
    company: str | None = None
    confidence = "low"
    for line in lines[:60]:
        for label in (
            "job title",
            "position title",
            "role title",
            "designation",
            "opening for",
            "hiring for",
            "title",
            "position",
            "role",
        ):
            match = re.match(rf"^{re.escape(label)}\s*[:\-–]\s*(.+)$", line, re.I)
            if match and not role:
                role = match.group(1).strip()[:200]
                confidence = "high"
        for label in ("company", "organization", "organisation", "employer", "about the company"):
            match = re.match(rf"^{re.escape(label)}\s*[:\-–]\s*(.+)$", line, re.I)
            if match and not company:
                company = match.group(1).strip()[:200]
        looking = re.search(
            r"(?:we are (?:hiring|looking for|seeking)|hiring a[n]?|looking for a[n]?)\s+(.+)$",
            line,
            re.I,
        )
        if looking and not role:
            role = looking.group(1).strip(" .,:;-")[:200]
            confidence = "medium"
    if not role:
        for line in lines[:12]:
            if len(line) > 90 or re.search(r"https?://|www\.|@", line, re.I):
                continue
            if _ROLE_HINT.search(line):
                role = line[:200]
                confidence = "medium"
                break
    if not role and lines:
        first = lines[0]
        if len(first) <= 100 and not re.search(r"https?://|www\.|@", first, re.I):
            role = first[:200]
            confidence = "low"
    if role and company:
        title = f"{role} · {company}"[:200]
    elif role:
        title = role[:200]
    elif company:
        title = f"{company} role"[:200]
    else:
        title = "Job description"
    return {
        "title": title,
        "role_title": role,
        "company": company,
        "confidence": confidence,
    }
# Structure-based skill labels only — not a technology allowlist.
_SKILL_LABEL_RE = re.compile(
    r"^(?:skills?|technical\s+skills?|core\s+competencies|technologies(?:\s+used)?"
    r"|tech(?:nology)?\s*stack|tools?|frameworks?|libraries|platforms?|stack"
    r"|languages?|software|proficient\s+in|expertise\s+in)\s*[:\-–—|]\s*(.+)$",
    re.I,
)
_SKILLISH_SECTION_HINTS = ("skill", "technolog", "competenc", "tool", "stack")
_SKILL_JUNK_SHAPE = re.compile(
    r"^(?:"
    r"[\w.+-]+@[\w.-]+\.\w+"  # email
    r"|\d+"  # pure number
    r"|(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}"  # year range
    r"|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*'?\d{2,4}"  # month+year
    r"|duration\b.*"
    r")$",
    re.I,
)


def is_skillish_section_key(key: str) -> bool:
    key_l = str(key or "").casefold()
    return any(hint in key_l for hint in _SKILLISH_SECTION_HINTS)


def skill_source_text(
    plain_text: str | None = None,
    sections: dict[str, object] | None = None,
) -> tuple[str, bool]:
    """Collect text that is actually skill-like.

    Returns (source_text, from_skills_section).
    Prefer skill-ish sections; fall back to labeled skill lines in free text.
    Never returns the whole document for blind short-line sweeping.
    """
    parts: list[str] = []
    from_section = False
    if isinstance(sections, dict):
        for key, values in sections.items():
            if not is_skillish_section_key(str(key)):
                continue
            from_section = True
            if isinstance(values, list):
                parts.extend(str(item).strip() for item in values if str(item).strip())
            elif values is not None and str(values).strip():
                parts.append(str(values).strip())
    labeled: list[str] = []
    for raw_line in (plain_text or "").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if _SKILL_LABEL_RE.match(line):
            labeled.append(line)
    if labeled:
        parts.extend(labeled)
    # Deduplicate while preserving order
    seen: set[str] = set()
    ordered: list[str] = []
    for part in parts:
        key = part.casefold()
        if key in seen:
            continue
        seen.add(key)
        ordered.append(part)
    return "\n".join(ordered), from_section


def _looks_like_skill_token(cleaned: str) -> bool:
    if len(cleaned) < 2 or len(cleaned) > 48:
        return False
    if cleaned.count(" ") > 4:
        return False
    if _SKILL_JUNK_SHAPE.match(cleaned):
        return False
    if cleaned.endswith(":"):
        return False
    # Section headings and pure prose are not skills.
    if re.fullmatch(
        r"(?:skills?|experience|education|projects?|certifications?|languages?|"
        r"summary|profile|contact|academic\s+projects?|technical\s+certifications?)",
        cleaned,
        re.I,
    ):
        return False
    return True


def extract_skill_candidates(
    text: str,
    limit: int = 20,
    *,
    allow_bare_short_lines: bool = False,
) -> list[str]:
    """Extract skill-like tokens from text without a technology allowlist.

    By default only list-style lines (comma/pipe/bullet) and skill-labeled lines
    are accepted. Bare short lines are allowed only when the caller has already
    scoped the text to a skills section (allow_bare_short_lines=True).
    """
    found: list[str] = []
    seen: set[str] = set()
    for raw_line in (text or "").splitlines():
        line = raw_line.strip()
        if not line:
            continue
        label_match = _SKILL_LABEL_RE.match(line)
        payload = line
        labeled = bool(label_match)
        if label_match:
            payload = label_match.group(1).strip()
        elif ":" in line:
            left, right = line.split(":", 1)
            # Only peel generic short labels inside an already-scoped skills blob.
            if allow_bare_short_lines and len(left.strip()) <= 48 and not re.search(r"\d", left):
                payload = right.strip()
        parts = [p.strip() for p in re.split(r"[,;|/]|·|•", payload) if p.strip()]
        if len(parts) < 2:
            if labeled and payload:
                parts = [payload]
            elif allow_bare_short_lines and len(line.split()) <= 4 and len(line) <= 48 and not line.endswith("."):
                parts = [payload or line]
            else:
                continue
        for part in parts:
            cleaned = re.sub(r"\s+", " ", part).strip(" -–—•*")
            if not _looks_like_skill_token(cleaned):
                continue
            key = cleaned.casefold()
            if key in seen:
                continue
            seen.add(key)
            found.append(cleaned)
            if len(found) >= limit:
                return found
    return found
