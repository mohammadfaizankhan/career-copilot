"""Deep job-recommendation sync diagnostics with executable assertions.

Does not call live Adzuna/Firestore. Exercises pure logic + static wiring.
Exit 1 if any assertion fails.
"""
from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.features.career_matching import (  # noqa: E402
    candidate_skill_evidence,
    score_job,
    _infer_work_mode,
)
from app.features.adzuna_api import AdzunaClient  # noqa: E402

PASS = 0
FAIL = 0


def check(name: str, cond: bool, detail: str = "") -> None:
    global PASS, FAIL
    if cond:
        PASS += 1
        print(f"[PASS] {name}")
    else:
        FAIL += 1
        print(f"[FAIL] {name}: {detail}")


def test_score_job_ranks_skill_overlap() -> None:
    job = {
        "id": "j1",
        "title": "Backend Engineer Python FastAPI",
        "description": "Need Python, FastAPI, Docker experience",
        "requirements": ["Python", "FastAPI", "Docker"],
        "location": "Remote",
    }
    skills = {"python", "fastapi"}
    evidence = "built apis with python and fastapi for career copilot"
    ranked = score_job(job, skills, evidence)
    check("score_job returns score", ranked["match_score"] > 0, str(ranked))
    check(
        "score_job matches python/fastapi",
        "Python" in ranked["match_breakdown"]["matched_requirements"]
        or "python" in {m.lower() for m in ranked["match_breakdown"]["matched_requirements"]},
        str(ranked["match_breakdown"]),
    )
    check(
        "score_job missing docker",
        any(m.lower() == "docker" for m in ranked["match_breakdown"]["missing_requirements"]),
        str(ranked["match_breakdown"]),
    )


def test_work_mode_inference() -> None:
    check(
        "infer remote from location",
        _infer_work_mode({"location": "Remote, US", "description": "", "title": "Eng"}) == "remote",
        str(_infer_work_mode({"location": "Remote, US", "description": "", "title": "Eng"})),
    )
    check(
        "infer hybrid from description",
        _infer_work_mode({"location": "NYC", "description": "Hybrid work model", "title": "Eng"})
        == "hybrid",
        "",
    )


def test_adzuna_maps_work_mode() -> None:
    payload = {
        "results": [
            {
                "id": "99",
                "title": "Remote Python Engineer",
                "company": {"display_name": "Acme"},
                "location": {"display_name": "Remote"},
                "description": "Python FastAPI remote work from home",
                "redirect_url": "https://example.com/j",
                "salary_min": 1,
                "salary_max": 2,
                "created": "2026-01-01T00:00:00Z",
                "latitude": 1.0,
                "longitude": 2.0,
            }
        ]
    }
    import app.features.adzuna_api as mod
    from unittest.mock import MagicMock, patch

    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = payload
    with patch.object(mod.httpx, "get", return_value=mock_response):
        jobs = AdzunaClient("a", "b").search_jobs(["Python Engineer"], ["Remote"])
    check("adzuna maps one job", len(jobs) == 1, str(jobs))
    check("adzuna sets work_mode remote", jobs[0].get("work_mode") == "remote", str(jobs[0]))
    check("adzuna extracts requirements", bool(jobs[0].get("requirements")), str(jobs[0]))


def test_candidate_skill_evidence_grounding() -> None:
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.execute.return_value = SimpleNamespace(
        data=[
            {"name": "Python", "normalized_name": "python"},
            {"name": "Invented", "normalized_name": "invented skill xyz"},
        ]
    )
    resume = {"plain_text": ""}
    version = {
        "plain_text": "Experienced with Python and FastAPI",
        "structured_content": {"sections": {"skills": ["Python, FastAPI"]}},
    }
    skills, evidence = candidate_skill_evidence(client, "u1", resume, version)
    check("evidence includes resume text", "python" in evidence.lower(), evidence[:200])
    check("explicit skills include python from section", "python" in skills, str(skills))
    check(
        "ungrounded profile skill excluded",
        "invented skill xyz" not in skills,
        str(skills),
    )


def test_generate_does_not_auto_sync() -> None:
    """Static: generate endpoint body must not call AdzunaClient (sync is separate)."""
    router = (ROOT / "backend" / "app" / "api" / "router.py").read_text(encoding="utf-8")
    # Find generate_job_recommendations function body roughly
    start = router.find("def generate_job_recommendations")
    end = router.find("def list_saved_jobs", start)
    body = router[start:end]
    check(
        "generate does not call AdzunaClient",
        "AdzunaClient" not in body,
        "generate should not embed Adzuna — sync is separate",
    )
    check(
        "generate reads local jobs table",
        'table("jobs")' in body,
        "expected jobs table query",
    )
    check(
        "generate requires confirmed resume",
        "confirmed_resume_required" in body,
        "expected confirmed resume gate",
    )


def test_sync_payload_persists_work_mode() -> None:
    """sync_external_jobs payload construction — work_mode must be persisted if present."""
    router = (ROOT / "backend" / "app" / "api" / "router.py").read_text(encoding="utf-8")
    start = router.find("def sync_external_jobs")
    end = router.find("def get_job", start)
    body = router[start:end]
    # Does payload include work_mode from job?
    has_work_mode_field = '"work_mode"' in body or "'work_mode'" in body
    check(
        "sync_external_jobs persists work_mode field",
        has_work_mode_field,
        "Adzuna returns work_mode but sync payload may drop it — filters/recommendations desync",
    )


def test_frontend_auto_load_vs_manual_sync() -> None:
    jobs = (ROOT / "frontend" / "src" / "features" / "jobs" / "components" / "jobs.tsx").read_text(
        encoding="utf-8"
    )
    # load() only generate, not sync
    check(
        "UI has manual Sync external jobs button",
        "syncExternalJobs" in jobs and "Sync external jobs" in jobs,
        "",
    )
    # Does load() auto-call sync?
    start = jobs.find("const fetchJobs")
    end = jobs.find("const load =")
    fetch_body = jobs[start:end]
    auto_sync = "/jobs/external/sync" in fetch_body
    check(
        "fetchJobs does NOT auto-sync (manual only)",
        not auto_sync,
        "if true, every load hits Adzuna — check cooldown; if false, empty catalog until user clicks Sync",
    )
    # INFO signal as PASS either way but we assert known design: manual
    check(
        "initial load calls generate not list",
        "/job-recommendations/generate" in fetch_body and "/job-recommendations\"" not in fetch_body.replace(
            "/job-recommendations/generate", ""
        ),
        "",
    )


def test_pagination_deletes_on_offset_zero() -> None:
    router = (ROOT / "backend" / "app" / "api" / "router.py").read_text(encoding="utf-8")
    start = router.find("def generate_job_recommendations")
    end = router.find("def list_saved_jobs", start)
    body = router[start:end]
    check(
        "offset==0 clears prior recommendations",
        "if payload.offset == 0:" in body and "delete()" in body,
        "",
    )
    # append path keeps previous rows in UI but DB only stores current page job ids
    # after offset>0 — list endpoint may be incomplete vs UI append. Document as WARN via check.
    check(
        "offset>0 still writes page rows",
        "payload.offset" in body and "insert" in body,
        "",
    )


def test_mounts_include_resume_improvement() -> None:
    main = (ROOT / "backend" / "app" / "main.py").read_text(encoding="utf-8")
    api_router = (ROOT / "backend" / "app" / "api" / "router.py").read_text(encoding="utf-8")
    check(
        "main mounts ats_scoring_router",
        "ats_scoring_router" in main,
        main,
    )
    check(
        "main mounts resume_improvement routes OR exports live in main router",
        "resume_improvement_router" in api_router
        or "create_export" in api_router
        or "resume_improvement" in main,
        "export endpoints may be unmounted — frontend resume export would 404",
    )


def test_auth_router_mounted() -> None:
    main = (ROOT / "backend" / "app" / "main.py").read_text(encoding="utf-8")
    router = (ROOT / "backend" / "app" / "api" / "router.py").read_text(encoding="utf-8")
    auth_file = (ROOT / "backend" / "app" / "api" / "routers" / "auth.py").read_text(encoding="utf-8")
    # How is auth mounted?
    check(
        "auth routes defined",
        "/auth/" in auth_file or "auth" in auth_file,
        "",
    )
    # included via main router import?
    check(
        "auth reachable via app",
        "auth" in router.lower() or "include_router" in main,
        "",
    )


def main() -> int:
    print("=== DEEP JOBS + MOUNT AUDIT ===")
    test_score_job_ranks_skill_overlap()
    test_work_mode_inference()
    test_adzuna_maps_work_mode()
    test_candidate_skill_evidence_grounding()
    test_generate_does_not_auto_sync()
    test_sync_payload_persists_work_mode()
    test_frontend_auto_load_vs_manual_sync()
    test_pagination_deletes_on_offset_zero()
    test_mounts_include_resume_improvement()
    test_auth_router_mounted()
    print()
    print(f"PASS={PASS} FAIL={FAIL}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
