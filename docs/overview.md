# TennisVision-AI: Project Overview

TennisVision-AI is an AI-powered tennis video analysis tool. You upload a tennis match video, and the system automatically processes it through a computer vision pipeline to generate player tracking, ball tracking, court detection, match statistics, heatmaps, and a shot map. The results are displayed through a web dashboard and also embedded as an overlay on the processed output video.

---

## What the Project Actually Does

### 1. Video Ingestion

A match video is either submitted through the web dashboard (drag-and-drop upload) or pointed to via the CLI script (`backend/main.py`). The video is loaded frame-by-frame using OpenCV.

---

### 2. Player Detection & Tracking

- Uses a **YOLOv8x** model (`yolov8x.pt`) to detect every person visible in each frame.
- The `.track()` method from Ultralytics is used to assign persistent tracking IDs to players across frames.
- After tracking, the two players closest to the detected court keypoints are selected and remapped to fixed IDs of **Player 1** and **Player 2** — any other detected people (e.g., ball boys, chair umpires) are filtered out.
- Bounding boxes are drawn on the output video frames labelling each player.

---

### 3. Tennis Ball Detection & Interpolation

- Uses a **custom fine-tuned YOLO model** (`models/best.pt`) specifically trained to detect a tennis ball.
- The ball is detected per-frame using `model.predict()` at a confidence threshold of 0.15 (lower threshold to catch fast-moving balls).
- Because the ball is often occluded or motion-blurred, detected positions are collected into a Pandas DataFrame and **interpolated** (filling gaps between missing detections) and **backward-filled** to create a complete ball position history for every frame.

---

### 4. Court Line & Keypoint Detection

- Uses a **ResNet50** model (`models/keypoints_model.pth`) with a custom fully-connected head that outputs **14 court keypoints** (28 values — one X and Y per keypoint).
- The model runs on the first frame of the video only, since the camera is assumed to be static.
- Keypoints are scaled back from the model's `224x224` input resolution to the original video resolution.
- These keypoints define the boundaries of the court, the service boxes, and the baseline, and are used as the spatial reference for all subsequent coordinate transformations.

---

### 5. 2D Mini-Court Projection

- A `MiniCourt` object is created and drawn as a small top-down court diagram in the top-right corner of every output video frame.
- The real-world positions of Player 1, Player 2, and the ball are converted from raw pixel coordinates into **2D mini-court coordinates** using a homography-based perspective transform:
  - The player's foot position is used as their ground-plane position.
  - The closest court keypoint to each player is found.
  - Pixel distances are converted to real-world metres using known court dimensions (constants from `constants.py`), and then to mini-court pixels.
- The positions are drawn as coloured circles on the mini-court overlay in every frame.

---

### 6. Ball Shot Detection

- The ball's Y-position (vertical) rolling mean is calculated across a sliding window.
- A **direction change** in the ball's vertical trajectory (delta_y sign flip) that persists for at least 25 frames is classified as a **ball hit** (a shot).
- This produces a list of frame numbers where shots occurred.

---

### 7. Match Statistics Calculation

- For each pair of consecutive shot frames (a shot segment), the pipeline calculates:
  - **Ball shot speed** in km/h using the distance the ball travelled across the mini-court divided by the time elapsed (in seconds at the video's FPS).
  - **Opponent movement speed** in km/h (the player who did not hit the ball, measured over the same time window).
- Stats are accumulated per player across all shot segments:
  - Total shots
  - Total and average shot speed (km/h)
  - Maximum shot speed (km/h)
  - Average player movement speed (km/h)
  - Total distance covered (metres)
- A per-frame stats DataFrame is generated to drive the **stats HUD overlay** drawn on each video frame.

---

### 8. Player Stats Overlay (HUD)

- A stats table is rendered directly onto the bottom of each video frame using OpenCV.
- Displayed in real time as the match progresses, showing Player 1 and Player 2 columns with:
  - Shot speed (last shot)
  - Player speed
  - Shot count

---

### 9. Heatmap Generation

- After all frames are processed, the mini-court positions of each player are accumulated.
- A **2D Gaussian kernel density heatmap** is generated using `scipy.ndimage.gaussian_filter` separately for Player 1 and Player 2.
- The heatmaps are saved as PNG images showing court coverage intensity — where each player spent the most time during the match.

---

### 10. Shot Map Generation

- All ball positions at detected shot frames are plotted as scatter points on a court background image.
- Points are colour-coded by relative ball speed (slower shots = cooler colours, faster shots = warmer colours).
- The shot map is saved as a PNG image.

---

### 11. Highlight Detection

- Detected shot frames are grouped into **rally segments** (consecutive shots with no long gap between them).
- Rallies exceeding a minimum number of shots are flagged as **highlights**.
- Each highlight stores its start frame, end frame, timestamp in seconds, and a label (e.g., "Long Rally #1").

---

### 12. Output Artifacts

After the pipeline completes, the following files are saved under `backend/outputs/{job_id}/`:

| File | Description |
|---|---|
| `video.avi` | Fully processed video with bounding boxes, mini-court overlay, and stats HUD |
| `heatmap_p1.png` | Court coverage heatmap for Player 1 |
| `heatmap_p2.png` | Court coverage heatmap for Player 2 |
| `shot_map.png` | Shot map scatter plot coloured by ball speed |
| `analysis.json` | JSON file with full stats, highlight timestamps, and all result URLs |

---

### 13. Web Dashboard

The results are surfaced through a **Next.js** web frontend served at `http://localhost:3000`:

- **Upload page:** Drag-and-drop or click-to-browse video upload. Submits to `POST /api/upload`.
- **Processing status:** A circular progress indicator polls `GET /api/status/{job_id}` every 2 seconds and shows the current pipeline stage name and percentage.
- **Analysis dashboard:** Once processing is complete, the dashboard shows:
  - The processed output video in a video player (with play/pause, mute, seek, and fullscreen controls)
  - Player 1 vs Player 2 head-to-head stats comparison panel
  - Court coverage heatmaps for each player
  - Ball shot map
  - Highlight timeline (clicking a highlight seeks the video to that timestamp)
- **Left sidebar** navigation tabs: Home (video + stats), Shot Explorer (shot map), Heatmaps, Highlights
- A **"Share this game"** button that copies the current URL to the clipboard

---

## Technology Stack

| Layer | Technology |
|---|---|
| Player detection | YOLOv8x (Ultralytics) |
| Ball detection | Custom fine-tuned YOLO (`best.pt`) |
| Court keypoint detection | ResNet50 (PyTorch, custom head) |
| Spatial transform | OpenCV, NumPy |
| Data processing | Pandas, SciPy |
| Backend API | FastAPI (Python), SQLite (job store) |
| Background processing | FastAPI `BackgroundTasks` |
| Frontend | Next.js (React), Vanilla CSS |

---

## Video Requirements

The pipeline is calibrated for **broadcast-style, high-angle footage** (from behind the baseline or from a high overhead position). Net-level or side-on footage will not work correctly because:

- The ResNet50 court keypoint model was trained on high-angle frames.
- The homography transform for the 2D mini-court projection requires all 4 court corners to be clearly visible.
- Player occlusion at net level breaks both the tracking and coordinate transforms.
