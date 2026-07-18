"""
pipeline/analytics.py

Computes all match statistics from tracking data:
  - Shot speed per rally segment
  - Player movement speed
  - Distance covered
  - Average metrics per player

Returns a clean dict suitable for saving to analysis.json.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
from copy import deepcopy
import constants
from utils import measure_distance, convert_pixel_distance_to_meters


def generate_statistics(
    player_mini_court_detections: list,
    ball_mini_court_detections: list,
    ball_shot_frames: list,
    mini_court,
    fps: int = 24,
) -> dict:
    """
    Calculate per-player shot speeds, movement speeds, distance covered,
    and aggregate averages over all detected shot segments.

    Returns:
        {
            "player_1": { total_shots, avg_shot_speed, max_shot_speed, avg_player_speed, distance_covered },
            "player_2": { ... },
            "frame_stats": [ per-frame stat rows for video overlay ],
        }
    """
    player_stats_data = [{
        'frame_num': 0,
        'player_1_number_of_shots': 0,
        'player_1_total_shot_speed': 0,
        'player_1_last_shot_speed': 0,
        'player_1_total_player_speed': 0,
        'player_1_last_player_speed': 0,
        'player_2_number_of_shots': 0,
        'player_2_total_shot_speed': 0,
        'player_2_last_shot_speed': 0,
        'player_2_total_player_speed': 0,
        'player_2_last_player_speed': 0,
    }]

    for ball_shot_ind in range(len(ball_shot_frames) - 1):
        start_frame = ball_shot_frames[ball_shot_ind]
        end_frame = ball_shot_frames[ball_shot_ind + 1]
        ball_shot_time_seconds = (end_frame - start_frame) / fps

        if ball_shot_time_seconds == 0:
            continue

        # Ball distance & speed
        distance_pixels = measure_distance(
            ball_mini_court_detections[start_frame][1],
            ball_mini_court_detections[end_frame][1],
        )
        distance_meters = convert_pixel_distance_to_meters(
            distance_pixels,
            constants.DOUBLE_LINE_WIDTH,
            mini_court.get_width_of_mini_court(),
        )
        ball_speed_kmh = distance_meters / ball_shot_time_seconds * 3.6

        # Which player hit the shot
        player_positions = player_mini_court_detections[start_frame]
        player_shot_ball = min(
            player_positions.keys(),
            key=lambda pid: measure_distance(
                player_positions[pid],
                ball_mini_court_detections[start_frame][1],
            ),
        )

        # Opponent movement speed
        opponent_id = 1 if player_shot_ball == 2 else 2
        opp_distance_pixels = measure_distance(
            player_mini_court_detections[start_frame][opponent_id],
            player_mini_court_detections[end_frame][opponent_id],
        )
        opp_distance_meters = convert_pixel_distance_to_meters(
            opp_distance_pixels,
            constants.DOUBLE_LINE_WIDTH,
            mini_court.get_width_of_mini_court(),
        )
        opponent_speed_kmh = opp_distance_meters / ball_shot_time_seconds * 3.6

        current = deepcopy(player_stats_data[-1])
        current['frame_num'] = start_frame
        current[f'player_{player_shot_ball}_number_of_shots'] += 1
        current[f'player_{player_shot_ball}_total_shot_speed'] += ball_speed_kmh
        current[f'player_{player_shot_ball}_last_shot_speed'] = ball_speed_kmh
        current[f'player_{opponent_id}_total_player_speed'] += opponent_speed_kmh
        current[f'player_{opponent_id}_last_player_speed'] = opponent_speed_kmh
        player_stats_data.append(current)

    # Build full per-frame dataframe (for video overlay)
    df = pd.DataFrame(player_stats_data)
    frames_df = pd.DataFrame({'frame_num': list(range(len(player_mini_court_detections)))})
    df = pd.merge(frames_df, df, on='frame_num', how='left').ffill()

    df['player_1_average_shot_speed'] = df['player_1_total_shot_speed'] / df['player_1_number_of_shots'].replace(0, float('nan'))
    df['player_2_average_shot_speed'] = df['player_2_total_shot_speed'] / df['player_2_number_of_shots'].replace(0, float('nan'))
    df['player_1_average_player_speed'] = df['player_1_total_player_speed'] / df['player_2_number_of_shots'].replace(0, float('nan'))
    df['player_2_average_player_speed'] = df['player_2_total_player_speed'] / df['player_1_number_of_shots'].replace(0, float('nan'))

    last = df.iloc[-1]

    def safe(val):
        try:
            return round(float(val), 2) if not pd.isna(val) else 0.0
        except Exception:
            return 0.0

    summary = {
        "player_1": {
            "total_shots": int(last.get('player_1_number_of_shots', 0)),
            "avg_shot_speed": safe(last.get('player_1_average_shot_speed')),
            "max_shot_speed": safe(df['player_1_last_shot_speed'].max()),
            "avg_player_speed": safe(last.get('player_1_average_player_speed')),
            "distance_covered": safe(last.get('player_1_total_player_speed', 0)),
        },
        "player_2": {
            "total_shots": int(last.get('player_2_number_of_shots', 0)),
            "avg_shot_speed": safe(last.get('player_2_average_shot_speed')),
            "max_shot_speed": safe(df['player_2_last_shot_speed'].max()),
            "avg_player_speed": safe(last.get('player_2_average_player_speed')),
            "distance_covered": safe(last.get('player_2_total_player_speed', 0)),
        },
        "frame_stats_df": df,   # kept for video overlay drawing
    }

    return summary
