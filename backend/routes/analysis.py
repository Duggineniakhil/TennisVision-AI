"""
routes/analysis.py

GET /api/status/{job_id}    — Lightweight poll (status + progress)
GET /api/analysis/{job_id}  — Full result when done
"""

import os
import sys
from fastapi import APIRouter, HTTPException

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from jobs.store import get_job
from app.schemas import StatusResponse, AnalysisResult, PlayerStats, Highlight

router = APIRouter()


def _not_found(job_id: str):
    raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")


@router.get("/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str):
    """Lightweight polling endpoint — returns status, stage, and progress."""
    job = get_job(job_id)
    if not job:
        _not_found(job_id)
    return StatusResponse(
        job_id=job_id,
        status=job["status"],
        stage=job["stage"],
        progress=job["progress"],
    )


@router.get("/analysis/{job_id}", response_model=AnalysisResult)
def get_analysis(job_id: str):
    """Full analysis result — includes stats, URLs, and highlights when done."""
    job = get_job(job_id)
    if not job:
        _not_found(job_id)

    base = AnalysisResult(
        job_id=job_id,
        status=job["status"],
        stage=job["stage"],
        progress=job["progress"],
        error=job.get("error"),
    )

    if job["status"] == "done" and job.get("result"):
        r = job["result"]
        base.video_url = r.get("video_url")
        base.heatmap_p1_url = r.get("heatmap_p1_url")
        base.heatmap_p2_url = r.get("heatmap_p2_url")
        base.shot_map_url = r.get("shot_map_url")

        p1 = r.get("player_1")
        if p1:
            base.player_1 = PlayerStats(**p1)

        p2 = r.get("player_2")
        if p2:
            base.player_2 = PlayerStats(**p2)

        highlights = r.get("highlights", [])
        base.highlights = [Highlight(**h) for h in highlights]

    return base
