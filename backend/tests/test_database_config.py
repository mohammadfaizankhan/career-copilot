from pathlib import Path
from uuid import uuid4

import pytest

from app.core.errors import ApiError
from app.database.client import database_client


def test_empty_firebase_credentials_return_safe_database_error() -> None:
    credentials = Path.cwd() / f"firebase-admin-{uuid4()}.json"
    credentials.write_bytes(b"")
    settings = type("TestSettings", (), {
        "firebase_configured": True,
        "firebase_project_id": "career-copilot-test",
        "firebase_credentials_path": str(credentials),
        "firebase_database_id": "(default)",
    })()

    try:
        with pytest.raises(ApiError) as exc_info:
            database_client(settings)

        assert exc_info.value.status_code == 503
        assert exc_info.value.code == "database_unavailable"
    finally:
        credentials.unlink(missing_ok=True)
