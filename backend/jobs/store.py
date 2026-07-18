"""
jobs/store.py — SQLite-backed job store

Persists job state across server restarts.
Schema:
  job_id   TEXT PRIMARY KEY
  status   TEXT  (queued | processing | done | error)
  stage    TEXT  (current progress stage label)
  progress INTEGER (0-100)
  result   TEXT  (JSON blob when done)
  error    TEXT  (error message if failed)
  created_at TEXT
  updated_at TEXT
"""

import sqlite3
import json
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "jobs.db")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create the jobs table if it doesn't exist."""
    with _connect() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id      TEXT PRIMARY KEY,
                status      TEXT NOT NULL DEFAULT 'queued',
                stage       TEXT NOT NULL DEFAULT 'Queued',
                progress    INTEGER NOT NULL DEFAULT 0,
                result      TEXT,
                error       TEXT,
                created_at  TEXT NOT NULL,
                updated_at  TEXT NOT NULL
            )
        """)
        conn.commit()


def create_job(job_id: str) -> dict:
    """Insert a new job in 'queued' state."""
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "INSERT INTO jobs (job_id, status, stage, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (job_id, "queued", "Queued", 0, now, now),
        )
        conn.commit()
    return get_job(job_id)


def update_job(job_id: str, status: str, stage: str = "", progress: int = 0):
    """Update the status, stage label, and progress percentage of a job."""
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "UPDATE jobs SET status=?, stage=?, progress=?, updated_at=? WHERE job_id=?",
            (status, stage, progress, now, job_id),
        )
        conn.commit()


def complete_job(job_id: str, result: dict):
    """Mark a job as done and store its result JSON."""
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "UPDATE jobs SET status='done', stage='Done', progress=100, result=?, updated_at=? WHERE job_id=?",
            (json.dumps(result), now, job_id),
        )
        conn.commit()


def fail_job(job_id: str, error: str):
    """Mark a job as errored and store the error message."""
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            "UPDATE jobs SET status='error', stage='Error', error=?, updated_at=? WHERE job_id=?",
            (error, now, job_id),
        )
        conn.commit()


def get_job(job_id: str) -> dict | None:
    """Fetch a job row by ID. Returns None if not found."""
    with _connect() as conn:
        row = conn.execute("SELECT * FROM jobs WHERE job_id=?", (job_id,)).fetchone()
    if row is None:
        return None
    d = dict(row)
    if d.get("result"):
        try:
            d["result"] = json.loads(d["result"])
        except Exception:
            pass
    return d
