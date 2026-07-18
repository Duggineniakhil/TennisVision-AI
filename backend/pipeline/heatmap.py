"""
pipeline/heatmap.py

Generates player position density heatmaps overlaid on a tennis court schematic.
Saves one PNG per player to the job output directory.
"""

import os
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend — safe for server use
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from scipy.ndimage import gaussian_filter


# Standard doubles court dimensions (meters)
COURT_W = 10.97
COURT_H = 23.77


def _draw_court_outline(ax):
    """Draw a simple tennis court schematic on the given axes."""
    ax.set_facecolor("#2d6a4f")

    # Outer doubles boundary
    court = patches.Rectangle((0, 0), COURT_W, COURT_H,
                               linewidth=2, edgecolor="white", facecolor="#2d6a4f")
    ax.add_patch(court)

    # Singles sidelines
    single_offset = (COURT_W - 8.23) / 2
    ax.plot([single_offset, single_offset], [0, COURT_H], "white", lw=1)
    ax.plot([COURT_W - single_offset, COURT_W - single_offset], [0, COURT_H], "white", lw=1)

    # Net
    mid_y = COURT_H / 2
    ax.plot([0, COURT_W], [mid_y, mid_y], "white", lw=2)

    # Service boxes
    service_line_from_net = 6.4
    ax.plot([single_offset, COURT_W - single_offset], [mid_y - service_line_from_net, mid_y - service_line_from_net], "white", lw=1)
    ax.plot([single_offset, COURT_W - single_offset], [mid_y + service_line_from_net, mid_y + service_line_from_net], "white", lw=1)

    # Center service line
    ax.plot([COURT_W / 2, COURT_W / 2], [mid_y - service_line_from_net, mid_y + service_line_from_net], "white", lw=1)

    # Baselines
    ax.plot([0, COURT_W], [0, 0], "white", lw=2)
    ax.plot([0, COURT_W], [COURT_H, COURT_H], "white", lw=2)


def generate_heatmap(
    player_mini_court_positions: list[dict],
    mini_court,
    output_dir: str,
) -> dict[str, str]:
    """
    Generate heatmap PNGs for player 1 and player 2.

    Args:
        player_mini_court_positions: list of per-frame dicts { player_id: (x, y) }
        mini_court: MiniCourt instance (used for coordinate normalization)
        output_dir: directory to save the PNG files

    Returns:
        { "player_1": "/path/to/heatmap_p1.png", "player_2": "/path/to/heatmap_p2.png" }
    """
    os.makedirs(output_dir, exist_ok=True)

    court_w = mini_court.get_width_of_mini_court()
    court_start_x = mini_court.court_start_x
    court_start_y = mini_court.court_start_y
    court_end_y = mini_court.court_end_y
    court_h_pixels = court_end_y - court_start_y

    paths = {}

    for player_id in [1, 2]:
        xs, ys = [], []
        for frame in player_mini_court_positions:
            if player_id in frame:
                px, py = frame[player_id]
                # Normalize to [0, 1] within the mini-court bounds
                norm_x = (px - court_start_x) / max(court_w, 1)
                norm_y = (py - court_start_y) / max(court_h_pixels, 1)
                xs.append(np.clip(norm_x, 0, 1) * COURT_W)
                ys.append(np.clip(norm_y, 0, 1) * COURT_H)

        fig, ax = plt.subplots(figsize=(5, 9))
        _draw_court_outline(ax)

        if xs:
            # Build density grid
            grid_size = 100
            heatmap_data, xedges, yedges = np.histogram2d(
                xs, ys,
                bins=grid_size,
                range=[[0, COURT_W], [0, COURT_H]],
            )
            heatmap_data = gaussian_filter(heatmap_data, sigma=3)
            heatmap_data = heatmap_data / (heatmap_data.max() + 1e-8)

            ax.imshow(
                heatmap_data.T,
                extent=[0, COURT_W, 0, COURT_H],
                origin="lower",
                cmap="YlOrRd",
                alpha=0.65,
                aspect="auto",
                vmin=0,
                vmax=1,
            )

        ax.set_xlim(0, COURT_W)
        ax.set_ylim(0, COURT_H)
        ax.axis("off")
        ax.set_title(f"Player {player_id} — Court Coverage", color="white", fontsize=12, pad=8)
        fig.patch.set_facecolor("#1a1a2e")

        out_path = os.path.join(output_dir, f"heatmap_p{player_id}.png")
        plt.savefig(out_path, bbox_inches="tight", dpi=120, facecolor=fig.get_facecolor())
        plt.close(fig)
        paths[f"player_{player_id}"] = out_path

    return paths
