"""Static + runtime contract audit: backend routes vs frontend callers.

Emits machine-readable findings. Exit code 1 if any FAIL is found.
Secrets are never printed (env presence only).
"""
from __future__ import annotations

import ast
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend" / "src"

FINDINGS: list[dict] = []


def find(level: str, area: str, message: str, **extra) -> None:
    FINDINGS.append({"level": level, "area": area, "message": message, **extra})


def extract_backend_routes() -> list[tuple[str, str, str]]:
    routes: list[tuple[str, str, str]] = []
    api_dir = BACKEND / "app"
    pattern = re.compile(
        r"""@router\.(get|post|put|patch|delete)\(\s*['\"]([^'\"]+)['\"]""",
        re.I,
    )
    for path in api_dir.rglob("*.py"):
        text = path.read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            routes.append((match.group(1).upper(), match.group(2), str(path.relative_to(ROOT))))
    return routes


def extract_main_prefix() -> str:
    main = (BACKEND / "app" / "main.py").read_text(encoding="utf-8")
    # Look for include_router(..., prefix=...)
    m = re.search(r'include_router\([^)]*prefix\s*=\s*["\']([^"\']+)["\']', main)
    if m:
        return m.group(1)
    # fallback common
    if "/api/v1" in main:
        return "/api/v1"
    return ""


def extract_frontend_calls() -> list[dict]:
    calls: list[dict] = []
    # apiRequest("path") or apiRequest(`path`)
    re_api = re.compile(
        r"""apiRequest\s*(?:<[^>]*>)?\s*\(\s*(['"`])([^'"`]+)\1""",
        re.M,
    )
    re_api_tpl = re.compile(
        r"""apiRequest\s*(?:<[^>]*>)?\s*\(\s*`([^`]+)`""",
        re.M,
    )
    re_fetch_base = re.compile(
        r"""fetch\s*\(\s*`\$\{base\}([^`]+)`""",
        re.M,
    )
    re_auth_request = re.compile(
        r"""(?:^|[^\w])request\s*\(\s*(['"])(/auth/[^'"]+)\1""",
        re.M,
    )
    re_method = re.compile(r"""method\s*:\s*['\"](\w+)['\"]""")

    for path in FRONTEND.rglob("*"):
        if path.suffix not in {".ts", ".tsx", ".js", ".mjs"}:
            continue
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        rel = str(path.relative_to(ROOT))

        for m in re_api.finditer(text):
            window = text[m.start() : m.start() + 280]
            mm = re_method.search(window)
            method = mm.group(1).upper() if mm else "GET"
            calls.append({"method": method, "path": m.group(2), "file": rel, "kind": "apiRequest"})

        for m in re_api_tpl.finditer(text):
            window = text[m.start() : m.start() + 280]
            mm = re_method.search(window)
            method = mm.group(1).upper() if mm else "GET"
            calls.append({"method": method, "path": m.group(1), "file": rel, "kind": "apiRequest-tpl"})

        for m in re_fetch_base.finditer(text):
            calls.append({"method": "?", "path": m.group(1).split("?")[0], "file": rel, "kind": "fetch-base"})

        if "auth" in rel.replace("\\", "/"):
            for m in re_auth_request.finditer(text):
                calls.append({"method": "POST", "path": m.group(2), "file": rel, "kind": "auth-request"})

    return calls


def normalize_path(path: str) -> str:
    # strip query, collapse template segments to {param}
    path = path.split("?")[0]
    path = re.sub(r"\$\{[^}]+\}", "{param}", path)
    path = re.sub(r"\{[^}]+\}", "{param}", path)
    if not path.startswith("/"):
        path = "/" + path
    return path.rstrip("/") or "/"


def path_matches(frontend_path: str, backend_path: str) -> bool:
    fp = normalize_path(frontend_path)
    bp = normalize_path(backend_path)
    if fp == bp:
        return True
    # segment-wise match with {param} wildcards
    fseg = fp.strip("/").split("/")
    bseg = bp.strip("/").split("/")
    if len(fseg) != len(bseg):
        return False
    for a, b in zip(fseg, bseg):
        if a == "{param}" or b == "{param}":
            continue
        if a != b:
            return False
    return True


def audit_env() -> None:
    env_path = ROOT / ".env"
    example = ROOT / ".env.example"
    keys_needed = [
        "FIREBASE_PROJECT_ID",
        "VITE_FIREBASE_API_KEY",
        "VITE_FIREBASE_PROJECT_ID",
        "ADZUNA_APP_ID",
        "ADZUNA_APP_KEY",
        "GROQ_API_KEY",
        "BACKEND_PORT",
        "FRONTEND_PORT",
        "VITE_API_BASE_URL",
        "PUBLIC_API_BASE_URL",
    ]
    present: dict[str, bool] = {}
    values: dict[str, str] = {}
    if env_path.exists():
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            values[k] = v
            present[k] = bool(v)
    else:
        find("WARN", "env", ".env file missing at repo root")

    for key in keys_needed:
        ok = present.get(key, False)
        find(
            "OK" if ok else "WARN",
            "env",
            f"{key}={'set' if ok else 'missing/empty'}",
            key=key,
            set=ok,
        )

    # Proxy consistency
    backend_port = values.get("BACKEND_PORT", "8000")
    public = values.get("PUBLIC_API_BASE_URL", "")
    vite_base = values.get("VITE_API_BASE_URL", "")
    if public and backend_port not in public and "8000" not in public:
        find(
            "WARN",
            "proxy",
            "PUBLIC_API_BASE_URL may not match BACKEND_PORT (used by Vite proxy target)",
            public_api_base_url="set",
            backend_port=backend_port,
        )
    if vite_base:
        find(
            "INFO",
            "proxy",
            "VITE_API_BASE_URL is set — browser bypasses /api/backend proxy and hits absolute origin + /api/v1",
        )
    else:
        find(
            "OK",
            "proxy",
            "VITE_API_BASE_URL unset — browser uses /api/backend → Vite rewrite → /api/v1 (dev default)",
        )


def audit_auth_wiring() -> None:
    auth_client = (FRONTEND / "features" / "auth" / "api" / "client.ts").read_text(encoding="utf-8")
    backend_auth = list((BACKEND / "app" / "features" / "auth").rglob("*.py"))
    main = (BACKEND / "app" / "main.py").read_text(encoding="utf-8")
    router = (BACKEND / "app" / "api" / "router.py").read_text(encoding="utf-8")

    for endpoint in ["/auth/firebase", "/auth/supabase", "/auth/sign-in", "/auth/session", "/auth/sign-out"]:
        fe = endpoint in auth_client
        be = endpoint in router or any(endpoint in p.read_text(encoding="utf-8") for p in backend_auth)
        # also check main for auth router
        be = be or endpoint.strip("/") in main
        # search all api files
        be = False
        for f in (BACKEND / "app").rglob("*.py"):
            if endpoint in f.read_text(encoding="utf-8", errors="ignore"):
                be = True
                break
        find(
            "OK" if fe and be else "FAIL",
            "auth",
            f"endpoint {endpoint}: frontend={'yes' if fe else 'no'} backend={'yes' if be else 'no'}",
            endpoint=endpoint,
        )

    # Bearer dependency
    if "get_current_user" in router or "get_current_user" in main:
        find("OK", "auth", "Backend uses get_current_user dependency")
    else:
        find("FAIL", "auth", "get_current_user not found in API layer")

    if "Authorization" in (FRONTEND / "shared" / "api" / "client.ts").read_text(encoding="utf-8"):
        find("OK", "auth", "Frontend apiRequest attaches Authorization Bearer header")
    else:
        find("FAIL", "auth", "Frontend apiRequest missing Authorization header")


def audit_job_recommendation_sync() -> None:
    jobs_tsx = (FRONTEND / "features" / "jobs" / "components" / "jobs.tsx").read_text(encoding="utf-8")
    router = (BACKEND / "app" / "api" / "router.py").read_text(encoding="utf-8")
    career = (BACKEND / "app" / "features" / "career_matching.py").read_text(encoding="utf-8")

    # Frontend generate path
    fe_generate = "/job-recommendations/generate" in jobs_tsx
    be_generate = 'post("/job-recommendations/generate")' in router or "/job-recommendations/generate" in router
    find(
        "OK" if fe_generate and be_generate else "FAIL",
        "jobs",
        f"generate path wired: frontend={fe_generate} backend={be_generate}",
    )

    # External sync
    fe_sync = "/jobs/external/sync" in jobs_tsx
    be_sync = "/jobs/external/sync" in router
    find(
        "OK" if be_sync else "FAIL",
        "jobs",
        f"external sync endpoint exists on backend={be_sync}",
    )
    find(
        "WARN" if be_sync and not fe_sync else ("OK" if fe_sync and be_sync else "INFO"),
        "jobs",
        f"frontend calls external sync: {fe_sync} (if false, Adzuna jobs never enter DB from UI)",
        frontend_calls_sync=fe_sync,
        backend_has_sync=be_sync,
    )

    # GET list vs always generate
    fe_list = re.search(r'apiRequest[^)]*["\']/job-recommendations["\']', jobs_tsx) is not None
    be_list = "/job-recommendations" in router
    find(
        "INFO",
        "jobs",
        f"list endpoint backend={be_list}; frontend uses list={fe_list} (UI primarily POSTs generate)",
        frontend_uses_list=fe_list,
    )

    # Pagination delete-all-on-offset-0 risk
    if "if payload.offset == 0:" in router and "job_recommendations" in router:
        find(
            "INFO",
            "jobs",
            "generate clears prior recommendations for resume_version when offset==0",
        )

    # Race: generation token
    if "_recommendation_generation_by_user" in router:
        find("OK", "jobs", "generate has in-process generation token to drop stale concurrent results")
    else:
        find("WARN", "jobs", "no generation-token guard for concurrent recommendation requests")

    # work_mode field on jobs
    if "work_mode" in career or "_infer_work_mode" in career:
        find("OK", "jobs", "career_matching can infer work_mode for filtering")
    if 'job.get("work_mode")' in router:
        find(
            "INFO",
            "jobs",
            "generate filters work_mode via job.work_mode or _infer_work_mode — Adzuna sync must populate enough description/location signal",
        )

    # Does Adzuna sync set work_mode?
    adzuna = (BACKEND / "app" / "features" / "adzuna_api.py").read_text(encoding="utf-8")
    if "work_mode" in adzuna:
        find("OK", "jobs", "adzuna_api mentions work_mode")
    else:
        find(
            "WARN",
            "jobs",
            "adzuna_api does not set work_mode field — work_mode filter relies on _infer_work_mode(job) only",
        )

    # Cache stale risk
    cache = FRONTEND / "features" / "jobs" / "job-recs-cache.ts"
    if cache.exists():
        find("INFO", "jobs", "frontend session cache for recommendations exists (stale-while-revalidate)")

    # Demo path
    if "isDemoSession" in jobs_tsx:
        find("INFO", "jobs", "jobs UI has demo session branch")


def audit_agents() -> None:
    agents_dir = BACKEND / "app" / "agents"
    registry = agents_dir / "registry.py"
    if registry.exists():
        text = registry.read_text(encoding="utf-8")
        find("OK", "agents", f"agent registry present ({len(text)} bytes)")
    providers = list((agents_dir / "providers").glob("*.py")) if (agents_dir / "providers").exists() else []
    find("OK" if providers else "WARN", "agents", f"LLM providers modules: {len(providers)}")

    # Routes that call AI-ish features
    for name, needle in [
        ("profile fill", "build_profile_draft_enriched"),
        ("ATS", "score_resume"),
        ("interview", "generate_interview"),
        ("learning", "generate_learning"),
    ]:
        found = False
        for f in (BACKEND / "app").rglob("*.py"):
            if needle in f.read_text(encoding="utf-8", errors="ignore"):
                found = True
                break
        find("OK" if found else "WARN", "agents", f"pipeline hook '{name}' ({needle}): {'found' if found else 'missing'}")


def try_live_health() -> None:
    try:
        import urllib.request

        for url in (
            "http://127.0.0.1:8000/health",
            "http://127.0.0.1:8000/api/v1/health",
            "http://127.0.0.1:8000/docs",
        ):
            try:
                with urllib.request.urlopen(url, timeout=1.5) as resp:
                    find("OK", "live", f"{url} → HTTP {resp.status}")
                    return
            except Exception as exc:  # noqa: BLE001
                find("INFO", "live", f"{url} unreachable: {type(exc).__name__}")
    except Exception as exc:  # noqa: BLE001
        find("INFO", "live", f"live probe skipped: {type(exc).__name__}")


def main() -> int:
    prefix = extract_main_prefix()
    routes = extract_backend_routes()
    calls = extract_frontend_calls()

    find("INFO", "meta", f"backend_route_prefix={prefix or '(none detected)'}")
    find("INFO", "meta", f"backend_routes={len(routes)} frontend_calls={len(calls)}")

    backend_paths = {(m, p) for m, p, _ in routes}
    backend_path_only = {p for _, p, _ in routes}

    # Match frontend → backend
    unmatched_fe: list[dict] = []
    matched = 0
    for call in calls:
        path = call["path"]
        method = call["method"]
        # auth paths may be on different router without /api/v1 in decorator path
        ok = any(path_matches(path, bp) for bp in backend_path_only)
        # template paths with querystrings already stripped in normalize
        if ok:
            matched += 1
        else:
            unmatched_fe.append(call)

    find("OK" if not unmatched_fe else "FAIL", "contract", f"frontend→backend path match: {matched}/{len(calls)}")
    for call in unmatched_fe:
        find(
            "FAIL",
            "contract",
            f"frontend path has no backend route: {call['method']} {call['path']}",
            file=call["file"],
            kind=call["kind"],
        )

    # Backend routes never called from frontend (informational)
    fe_paths = {normalize_path(c["path"]) for c in calls}
    orphan_be = []
    for method, path, src in routes:
        # skip health-ish
        if path in {"/health", "/"}:
            continue
        if not any(path_matches(fp, path) for fp in fe_paths):
            orphan_be.append((method, path, src))
    find("INFO", "contract", f"backend routes with no frontend caller (static): {len(orphan_be)}")
    for method, path, src in orphan_be[:40]:
        find("INFO", "orphan-backend", f"{method} {path}", file=src)

    audit_env()
    audit_auth_wiring()
    audit_job_recommendation_sync()
    audit_agents()
    try_live_health()

    # Job-specific deep static assertions (red-capable)
    jobs_tsx = (FRONTEND / "features" / "jobs" / "components" / "jobs.tsx").read_text(encoding="utf-8")
    if "/jobs/external/sync" not in jobs_tsx and "/job-recommendations/generate" in jobs_tsx:
        find(
            "FAIL",
            "jobs-sync",
            "Jobs UI generates recommendations from local jobs table but never calls POST /jobs/external/sync — external Adzuna catalog will not refresh from this screen",
        )

    # Print report
    counts = defaultdict(int)
    for f in FINDINGS:
        counts[f["level"]] += 1

    print("=== API / AUTH / JOBS SYNC AUDIT ===")
    print(f"prefix={prefix} routes={len(routes)} fe_calls={len(calls)}")
    print(f"counts: {dict(counts)}")
    print()
    for f in FINDINGS:
        if f["level"] in {"FAIL", "WARN", "OK"} or f["area"] in {"jobs", "jobs-sync", "auth", "contract", "live"}:
            extra = {k: v for k, v in f.items() if k not in {"level", "area", "message"}}
            suffix = f" | {extra}" if extra else ""
            print(f"[{f['level']}] {f['area']}: {f['message']}{suffix}")

    out = ROOT / "scripts" / "_audit_api_sync_report.json"
    out.write_text(json.dumps(FINDINGS, indent=2), encoding="utf-8")
    print()
    print(f"full report: {out}")

    fails = sum(1 for f in FINDINGS if f["level"] == "FAIL")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
