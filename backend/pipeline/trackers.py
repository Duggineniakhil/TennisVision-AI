"""
pipeline/trackers.py

Post-processing after raw detection:
  - Filter to two active players using court keypoints
  - Interpolate missing ball positions
  - Convert bounding boxes to mini-court coordinates
  - Detect ball shot frames
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from court_line_detector import CourtLineDetector
from mini_court import MiniCourt


def detect_court_keypoints(
    first_frame,
    model_path: str = "models/keypoints_model.pth",
) -> list:
    """
    Predict 14 court keypoints (28 values: x0,y0,x1,y1,...) from the first frame.
    """
    detector = CourtLineDetector(model_path)
    keypoints = detector.predict(first_frame)
    return keypoints, detector


def filter_players(
    player_tracker,
    court_keypoints: list,
    player_detections: list,
) -> list[dict]:
    """
    Keep only the two players closest to the court keypoints.
    """
    return player_tracker.choose_and_filter_players(court_keypoints, player_detections)


def interpolate_ball(
    ball_tracker,
    ball_detections: list,
) -> list[dict]:
    """
    Fill in missing ball positions using Pandas interpolation + backfill.
    """
    return ball_tracker.interpolate_ball_positions(ball_detections)


def get_shot_frames(
    ball_tracker,
    ball_detections: list,
) -> list[int]:
    """
    Detect frames where a ball shot occurred based on y-direction changes.
    """
    return ball_tracker.get_ball_shot_frames(ball_detections)


def build_mini_court(first_frame) -> MiniCourt:
    """
    Create the MiniCourt object from the first video frame.
    """
    return MiniCourt(first_frame)


def convert_to_mini_court_coordinates(
    mini_court: MiniCourt,
    player_detections: list,
    ball_detections: list,
    court_keypoints: list,
) -> tuple[list, list]:
    """
    Project player and ball bounding boxes onto the 2D mini-court coordinate system.

    Returns:
        (player_mini_court_positions, ball_mini_court_positions)
    """
    return mini_court.convert_bounding_boxes_to_mini_court_coordinates(
        player_detections,
        ball_detections,
        court_keypoints,
    )
