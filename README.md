# TennisVision-AI

An AI-powered tennis match video analysis tool that automatically processes uploaded match videos through a computer vision pipeline — detecting players and the ball, mapping court geometry, calculating match statistics, and generating heatmaps, shot maps, and highlight clips. Results are delivered through both an interactive web dashboard and a fully annotated output video.

---

## What It Does

Upload a tennis match video. The pipeline:

1. **Detects and tracks both players** frame-by-frame using YOLOv8x, filtering out non-player people (ball boys, umpires, etc.), and assigns them fixed labels of **Player 1** and **Player 2**.
2. **Detects the tennis ball** using a custom-trained YOLO model, with Pandas-based interpolation to fill in frames where the ball is occluded or motion-blurred.
3. **Detects 14 court keypoints** using a fine-tuned ResNet50 model, defining the court boundaries and service boxes.
4. **Projects player and ball positions** onto a live **2D mini-court overlay** rendered in the top-right corner of every video frame.
5. **Detects ball shots** by finding direction changes in the ball's vertical position across frames, producing a list of shot timestamps.
6. **Calculates per-player match statistics** including: total shots, shot speed (km/h), max shot speed, player movement speed, and distance covered.
7. **Renders a real-time stats HUD** at the bottom of every video frame.
8. **Generates court coverage heatmaps** (one per player) using Gaussian kernel density estimation.
9. **Generates a ball shot map** showing where each shot was struck, colour-coded by speed.
10. **Detects highlights** by grouping shots into rallies and flagging long rallies as highlight moments, each with a timestamp.

The processed output video, heatmaps, shot map, and JSON stats file are all saved and served back through the web dashboard.

---

## Key Features

| Feature | Details |
|---|---|
| Player Tracking | YOLOv8x + persistent tracking, filtered to 2 players, remapped to Player 1 / Player 2 |
| Ball Tracking | Custom YOLO `best.pt`, confidence threshold 0.15, Pandas interpolation for missing frames |
| Court Detection | ResNet50 with a custom FC head outputting 14 keypoints (28 coordinates) |
| 2D Mini-Court | Real-time perspective projection of players & ball onto a top-down court diagram |
| Shot Detection | Rolling delta-Y analysis on ball trajectory to find direction changes |
| Match Stats | Shot speed, player speed, distance, shot count — per player, per rally segment |
| Stats HUD | OpenCV text overlay rendered on every video frame |
| Heatmaps | SciPy Gaussian filter applied to accumulated player positions |
| Shot Map | Scatter plot coloured by relative shot speed |
| Highlights | Rally grouping → long rallies flagged with start/end frame + timestamp |
| Web Upload | Drag-and-drop video upload → `POST /api/upload` → background pipeline |
| Live Progress | Frontend polls `GET /api/status/{job_id}` every 2 seconds, shows stage + % |
| Dashboard | Video player, head-to-head stats, heatmaps, shot map, clickable highlight timeline |

---

## Technology Stack

- **Player Detection:** YOLOv8x (`yolov8x.pt` via Ultralytics)
- **Ball Detection:** Custom fine-tuned YOLO (`models/best.pt`)
- **Court Keypoints:** ResNet50 (`models/keypoints_model.pth`, PyTorch)
- **Image Processing:** OpenCV, NumPy
- **Data / Interpolation:** Pandas, SciPy
- **Backend API:** FastAPI + SQLite job store
- **Background Processing:** FastAPI `BackgroundTasks`
- **Frontend:** Next.js (React), Vanilla CSS

---

## Repository Structure

```text
TennisVision-AI/
├── docs/
│   └── overview.md                    # Detailed breakdown of what the project does
├── backend/
│   ├── main.py                        # CLI entrypoint (runs the full pipeline on a local video)
│   ├── requirements.txt               # Python dependencies
│   ├── app/
│   │   ├── main.py                    # FastAPI application + CORS + static file serving
│   │   └── schemas.py                 # Pydantic request/response models
│   ├── routes/
│   │   ├── upload.py                  # POST /api/upload — receives video, starts pipeline
│   │   ├── analysis.py                # GET /api/status/{id}, GET /api/analysis/{id}
│   │   └── video.py                   # Health check endpoint
│   ├── pipeline/
│   │   ├── processor.py               # Orchestrates the full pipeline end-to-end
│   │   ├── detectors.py               # Calls player tracker and ball tracker
│   │   ├── analytics.py               # Calculates match stats from tracking data
│   │   ├── heatmap.py                 # Generates Gaussian heatmaps per player
│   │   └── shot_map.py                # Generates ball shot scatter map
│   ├── trackers/
│   │   ├── player_tracker.py          # YOLOv8 player detection, track ID filtering + remapping
│   │   └── ball_tracker.py            # Custom YOLO ball detection + interpolation + shot detection
│   ├── court_line_detector/
│   │   └── court_line_detector.py     # ResNet50 inference → 14 keypoints
│   ├── mini_court/
│   │   └── mini_court.py              # 2D mini-court projection and rendering
│   ├── jobs/
│   │   └── store.py                   # SQLite-backed job status store
│   ├── constants/                     # Court dimension constants (metres)
│   ├── utils/                         # Distance, bbox, coordinate, drawing helpers
│   ├── models/                        # Model weights (not in git — download separately)
│   ├── uploads/                       # Incoming uploaded videos
│   └── outputs/                       # Pipeline outputs per job_id (video, heatmaps, JSON)
└── frontend/
    ├── app/
    │   ├── page.tsx                   # Home page — upload UI + feature cards
    │   ├── layout.tsx                 # Root layout with Navbar
    │   └── analysis/[id]/page.tsx     # Analysis dashboard page
    ├── components/
    │   ├── Navbar.tsx                 # Top navigation bar
    │   ├── Sidebar.tsx                # Left tab navigation (Home, Shot Explorer, Heatmaps, Highlights)
    │   ├── Uploader.tsx               # Drag-and-drop video uploader
    │   ├── StatusPoller.tsx           # Polls /api/status/{id} and triggers data fetch on completion
    │   ├── VideoPlayer.tsx            # Custom HTML5 video player with controls
    │   ├── StatsPanel.tsx             # Head-to-head player stats comparison
    │   ├── HeatmapView.tsx            # Renders heatmap images for each player
    │   ├── ShotMap.tsx                # Renders the ball shot map image
    │   ├── HighlightTimeline.tsx      # Clickable list of highlight events (seeks video on click)
    │   └── BreadcrumbHeader.tsx       # Breadcrumb navigation header on dashboard
    └── lib/
        └── api.ts                     # API base URL + uploadVideo() helper function
```

---

## Installation & Setup

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+

### 1. Create Python Virtual Environment

```bash
# From the project root:
python -m venv venv

# Activate on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Activate on macOS/Linux:
source venv/bin/activate
```

### 2. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

> **Note:** If you are on Python 3.11 and `scipy` freezes on import, upgrade it: `pip install scipy==1.13.1`

### 3. Place Model Weights

Download and place the following model files:

| File | Location |
|---|---|
| `yolov8x.pt` | `backend/yolov8x.pt` |
| `best.pt` (custom ball detector) | `backend/models/best.pt` |
| `keypoints_model.pth` (court keypoints) | `backend/models/keypoints_model.pth` |

**Download links for the custom models:**
- `best.pt` → [Google Drive](https://drive.google.com/file/d/1GNuhEyX-Akpb9UwbCrFBMS3EI-VQx0lx/view?usp=sharing)
- `keypoints_model.pth` → [Google Drive](https://drive.google.com/file/d/1aXIFR855U27v2QAKy07q0HFOd7KCRlYu/view?usp=sharing)

---

## Running the Web Application

### Start the Backend

```bash
cd backend
..\venv\Scripts\Activate.ps1      # Windows
uvicorn app.main:app --reload --port 8000
```

### Start the Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Running the CLI Pipeline (No Web UI)

If you want to run the analysis directly without the web interface, place your video at `backend/input_videos/input_video1.mp4` and run:

```bash
cd backend
python main.py
```

Output files will be saved to `backend/outputs/cli_run_{id}/`.

---

## Running on Google Colab (Free GPU)

Use this to avoid using your own CPU/GPU. Paste this into a single cell in a Colab notebook with a **T4 GPU runtime**:

```python
# 1. Clone repo
!rm -rf TennisVision-AI
!git clone https://github.com/Duggineniakhil/TennisVision-AI.git
%cd TennisVision-AI/backend

# 2. Install dependencies (pin ultralytics to avoid a known YOLO bug)
!sed -i 's/torchvision==0.17.1/torchvision/' requirements.txt
!sed -i 's/torch==2.2.1/torch/' requirements.txt
!pip install -r requirements.txt
!pip install ultralytics==8.1.29 supervision gdown

# 3. Download model weights from Google Drive
import os
os.makedirs('models', exist_ok=True)
!gdown "1GNuhEyX-Akpb9UwbCrFBMS3EI-VQx0lx" -O models/best.pt
!gdown "1aXIFR855U27v2QAKy07q0HFOd7KCRlYu" -O models/keypoints_model.pth

# 4. Upload your video
from google.colab import files
uploaded = files.upload()
video_filename = list(uploaded.keys())[0]

# 5. Run the pipeline
import sys
sys.path.append('.')
from pipeline.processor import process_video
result = process_video(input_path=video_filename, job_id="colab_run", use_stubs=False)

# 6. Download outputs
files.download(result['video_path'])
files.download(result['analysis_path'])
files.download(result['heatmap_paths']['p1'])
files.download(result['heatmap_paths']['p2'])
files.download(result['shot_map_path'])
```

---

## Video Requirements

- **Camera angle:** Must be a high-angle, behind-the-baseline or broadcast-style view. The court must be fully visible including all 4 corners.
- **Net-level or side-on footage:** Will not work. The court keypoint model was trained on high-angle frames and the homography transform requires all court corners to be visible.
- **Recommended resolution:** 720p or higher.
- **Supported formats:** `.mp4`, `.avi`, `.mov`, `.mkv` (up to 500MB via web upload).

---

## Acknowledgment

This project extends an open-source tennis analysis pipeline into a full-stack AI analytics platform with a FastAPI backend, Next.js frontend, asynchronous background processing, a SQLite job store, and an interactive analytics dashboard.
