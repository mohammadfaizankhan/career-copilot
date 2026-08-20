from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest

from app.agents.providers.reliable import generate_structured_with_failover
from app.core.errors import ApiError
from app.features.interview.agent import question_generator


class _Result:
    def __init__(self, question: str = "Explain one project you delivered."):
        self.questions = [SimpleNamespace(question=question, question_type="technical")]


def _settings(**overrides):
    values = {
        "llm_provider": "groq",
        "groq_configured": True,
        "groq_model": "groq-test",
        "nvidia_configured": True,
        "nvidia_model": "nvidia-test",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_structured_generation_retries_then_fails_without_static_output(monkeypatch):
    calls = []

    async def always_fails(*_args, **_kwargs):
        calls.append(True)
        raise ApiError(503, "provider_down", "down")

    monkeypatch.setattr("app.agents.providers.reliable.GroqClient.generate_structured", always_fails)
    monkeypatch.setattr("app.agents.providers.reliable.NvidiaClient.generate_structured", always_fails)

    with pytest.raises(ApiError) as caught:
        asyncio.run(
            generate_structured_with_failover(
                _settings(),
                system_prompt="Return JSON.",
                user_payload={"input": "x"},
                schema_model=SimpleNamespace,
                attempts_per_provider=2,
            )
        )

    assert caught.value.code == "llm_generation_failed"
    assert len(calls) == 4


def test_interview_question_generation_does_not_return_templates(monkeypatch):
    async def unavailable(*_args, **_kwargs):
        raise ApiError(503, "groq_unavailable", "down")

    monkeypatch.setattr(
        "app.agents.providers.reliable.GroqClient.generate_structured", unavailable
    )
    monkeypatch.setattr(
        "app.agents.providers.reliable.NvidiaClient.generate_structured", unavailable
    )

    with pytest.raises(ApiError) as caught:
        asyncio.run(
            question_generator.generate_interview_questions(
                _settings(), mode="technical", count=2, target_role="Engineer"
            )
        )

    assert caught.value.code == "llm_generation_failed"


def test_structured_generation_fails_over_to_second_llm(monkeypatch):
    async def groq_down(*_args, **_kwargs):
        raise ApiError(503, "groq_unavailable", "down")

    async def nvidia_answer(*_args, **_kwargs):
        return {"answer": "Only the configured LLM supplied this answer."}

    class Result:
        @classmethod
        def model_json_schema(cls):
            return {"type": "object"}

        @classmethod
        def model_validate(cls, value):
            return value

    monkeypatch.setattr("app.agents.providers.reliable.GroqClient.generate_structured", groq_down)
    monkeypatch.setattr(
        "app.agents.providers.reliable.NvidiaClient.generate_structured", nvidia_answer
    )

    result, provider = asyncio.run(
        generate_structured_with_failover(
            _settings(),
            system_prompt="Return JSON.",
            user_payload={"input": "x"},
            schema_model=Result,
            attempts_per_provider=1,
        )
    )

    assert provider == "nvidia"
    assert result["answer"].startswith("Only the configured LLM")
