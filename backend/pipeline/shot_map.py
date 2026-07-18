"""
pipeline/shot_map.py

Generates a ball trajectory / shot map PNG, plotting all ball positions
across the match and color-coding them by relative speed.
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.collections import LineCollection
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils import measure_distance


COURT_W = 10.97
COURT_H = 23.77


def _draw_court_outline(ax):
    ax.set_facecolor("#1a1a2e")
    court = patches.Rectangle(
        (0, 0), COURT_W, COURT_H,
        linewidth=2, edgecolor="white", facecolor="#0d2137"
    )
    ax.add_patch(court)
    single_offset = (COURT_W - 8.23) / 2
    ax.plot([single_offset, single_offset], [0, COURT_H], "white", lw=1, alpha=0.7)
    ax.plot([COURT_W - single_offset, COURT_W - single_offset], [0, COURT_H], "white", lw=1, alpha=0.7)
    mid_y = COURT_H / 2
    ax.plot([0, COURT_W], [mid_y, mid_y], "white", lw=2)
    service_from_net = 6.4
    ax.plot([single_offset, COURT_W - single_offset], [mid_y - service_from_net, mid_y - service_from_net], "white", lw=1, alpha=0.6)
    ax.plot([single_offset, COURT_W - single_offset], [mid_y + service_from_net, mid_y + service_from_net], "white", lw=1, alpha=0.6)
    ax.plot([COURT_W / 2, COURT_W / 2], [mid_y - service_from_net, mid_y + service_from_net], "white", lw=1, alpha=0.6)
    ax.plot([0, COURT_W], [0, 0], "white", lw=2)
    ax.plot([0, COURT_W], [COURT_H, COURT_H], "white", lw=2)


def generate_shot_map(
    ball_mini_court_positions: list[dict],
    mini_court,
    output_dir: str,
) -> str:
    """
    Plot all ball positions as a trajectory map, color-coded by speed.

    Args:
        ball_mini_court_positions: list of per-frame { 1: (x, y) }
        mini_court: MiniCourt instance for coordinate normalization
        output_dir: directory to save shot_map.png

    Returns:
        Path to the saved shot_map.png
    """
    os.makedirs(output_dir, exist_ok=True)

    court_w = mini_court.get_width_of_mini_court()
    court_start_x = mini_court.court_start_x
    court_start_y = mini_court.court_start_y
    court_end_y = mini_court.court_end_y
    court_h_pixels = court_end_y - court_start_y

    # Extract and normalize positions
    positions = []
    for frame in ball_mini_court_positions:
        if 1 in frame:
            px, py = frame[1]
            norm_x = (px - court_start_x) / max(court_w, 1)
            norm_y = (py - court_start_y) / max(court_h_pixels, 1)
            positions.append((
                np.clip(norm_x, 0, 1) * COURT_W,
                np.clip(norm_y, 0, 1) * COURT_H,
            ))

    fig, ax = plt.subplots(figsize=(5, 9))
    _draw_court_outline(ax)

    if len(positions) >= 2:
        xs = [p[0] for p in positions]
        ys = [p[1] for p in positions]

        # Compute per-segment speed (Euclidean distance between consecutive points)
        speeds = [0.0]
        for i in range(1, len(positions)):
            d = measure_distance(positions[i - 1], positions[i])
            speeds.append(d)
        speeds = np.array(speeds)
        max_speed = speeds.max() or 1.0
        norm_speeds = speeds / max_speed

        # Draw trajectory as colored line segments
        points = np.array([xs, ys]).T.reshape(-1, 1, 2)
        segments = np.concatenate([points[:-1], points[1:]], axis=1)
        lc = LineCollection(segments, cmap="plasma", linewidth=1.5, alpha=0.7)
        lc.set_array(norm_speeds[1:])
        lc.set_clim(0, 1)
        ax.add_collection(lc)

        # Scatter dots at each position
        sc = ax.scatter(xs, ys, c=norm_speeds, cmap="plasma", s=8, alpha=0.6, zorder=5)
        plt.colorbar(sc, ax=ax, label="Relative speed", fraction=0.03, pad=0.04)

    ax.set_xlim(0, COURT_W)
    ax.set_ylim(0, COURT_H)
    ax.axis("off")
    ax.set_title("Ball Trajectory Map", color="white", fontsize=12, pad=8)
    fig.patch.set_facecolor("#1a1a2e")

    out_path = os.path.join(output_dir, "shot_map.png")
    plt.savefig(out_path, bbox_inches="tight", dpi=120, facecolor=fig.get_facecolor())
    plt.close(fig)

    return out_path
