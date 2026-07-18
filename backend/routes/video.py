"""
routes/video.py

GET /api/health  — Model availability health check
"""

import os
import sys
from fastapi import APIRouter

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from app.schemas import HealthResponse

router = APIRouter()

BACKEND_DIR = os.path.join(os.path.dirname(__file__), '..', '..')

REQUIRED_MODELS = {
    "yolov8x.pt": os.path.join(BACKEND_DIR, "yolov8x.pt"),
    "ball_detector": os.path.join(BACKEND_DIR, "models", "best.pt"),
    "court_keypoints": os.path.join(BACKEND_DIR, "models", "keypoints_model.pth"),
}


@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Reports which AI model weights are present on disk.
    The frontend can use this to warn users if models are missing.
    """
    model_status = {name: os.path.isfile(path) for name, path in REQUIRED_MODELS.items()}
    all_ok = all(model_status.values())
    return HealthResponse(
        status="ok" if all_ok else "degraded",
        models=model_status,
    )
