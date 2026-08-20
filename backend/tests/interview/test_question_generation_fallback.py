import asyncio
from types import SimpleNamespace

import pytest

from app.core.errors import ApiError
from app.features.interview.agent import question_generator


def test_interview_questions_fail_explicitly_when_all_llms_are_unavailable(monkeypatch):
    async def unavailable(*_args, **_kwargs):
        raise ApiError(503, "groq_unavailable", "Groq is temporarily unavailable.")

    monkeypatch.setattr("app.agents.providers.reliable.GroqClient.generate_structured", unavailable)
    monkeypatch.setattr("app.agents.providers.reliable.NvidiaClient.generate_structured", unavailable)

    with pytest.raises(ApiError) as caught:
        asyncio.run(
        question_generator.generate_interview_questions(
            SimpleNamespace(
                llm_provider="groq",
                groq_configured=True,
                groq_model="test-model",
                nvidia_configured=True,
                nvidia_model="nvidia-test",
            ),
            mode="technical",
            count=3,
            target_role="Backend Engineer",
        )
        )
    assert caught.value.code == "llm_generation_failed"


def test_interview_questions_fail_explicitly_on_unexpected_provider_errors(monkeypatch):

    async def boom(*_args, **_kwargs):
        raise RuntimeError("unexpected provider crash")

    monkeypatch.setattr("app.agents.providers.reliable.GroqClient.generate_structured", boom)
    monkeypatch.setattr("app.agents.providers.reliable.NvidiaClient.generate_structured", boom)

    with pytest.raises(ApiError) as caught:
        asyncio.run(
        question_generator.generate_interview_questions(
            SimpleNamespace(
                llm_provider="groq",
                groq_configured=True,
                groq_model="test-model",
                nvidia_configured=True,
                nvidia_model="nvidia-test",
            ),
            mode="technical",
            count=2,
            target_role="Backend Engineer",
        )
        )
    assert caught.value.code == "llm_generation_failed"
