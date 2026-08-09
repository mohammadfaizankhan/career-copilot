"""Regression: job matching evidence must use skill-ish sections, not only *skill* keys."""
from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock

from app.features.career_matching import candidate_skill_evidence, score_job


def test_candidate_skill_evidence_reads_technologies_section() -> None:
    client = MagicMock()
    client.table.return_value.select.return_value.eq.return_value.execute.return_value = SimpleNamespace(
        data=[]
    )
    resume = {}
    version = {
        "plain_text": "Built services with FastAPI",
        "structured_content": {
            "sections": {
                "technologies": ["Python, FastAPI, Docker"],
                "experience": ["Backend Engineer at Acme"],
            }
        },
    }
    skills, _evidence = candidate_skill_evidence(client, "u1", resume, version)
    assert "python" in skills
    assert "fastapi" in skills
    assert "docker" in skills


def test_score_job_uses_resume_evidence_without_explicit_skills() -> None:
    job = {
        "id": "j1",
        "title": "Python Engineer",
        "description": "Python required",
        "requirements": ["Python", "Kubernetes"],
    }
    ranked = score_job(job, set(), "Senior engineer using Python daily")
    matched = {m.lower() for m in ranked["match_breakdown"]["matched_requirements"]}
    assert "python" in matched
    assert ranked["match_score"] > 0
