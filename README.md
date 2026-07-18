# TennisVision-AI

An AI-powered tennis analytics platform designed to automatically analyze tennis match videos and provide detailed performance insights for players, coaches, and analysts.

## Project Overview

Instead of manually reviewing hours of match footage, **TennisVision-AI** enables users to upload a tennis video and receive visual analytics, player tracking, ball tracking, court analysis, and match statistics generated through computer vision and deep learning models.

The project combines modern AI models with an interactive web dashboard to make tennis analysis faster, more accurate, and easier to understand.

For a detailed breakdown of the project goals, objectives, and vision, see the [Project Overview Document](file:///E:/TennisVision-AI/docs/overview.md).

---

## Key Features

* **Player Detection & Tracking:** Uses YOLOv8 for player detection and multi-object tracking, maintaining persistent player IDs across rallies.
* **Ball Detection & Path Interpolation:** Leverages a custom fine-tuned YOLO model to detect tennis balls moving at high speeds. Missing detections are filled using advanced Pandas-based interpolation.
* **Court Line & Keypoint Detection:** Fine-tunes ResNet50 on a custom court dataset to detect 14 spatial keypoints, facilitating key coordinate translations.
* **Speed & Distance Analytics:** Measures real-time player moving speed, distance covered, ball shot velocity (in km/h), and total shot counts.
* **2D Mini-Court Representation:** Maps the 3D perspective of players and the ball onto a top-down 2D miniature representation of the court in real time.
* **Stats Overlay:** Renders real-time dashboards showing player performance statistics directly on the output video frames.

---

## Technology Stack

* **AI & Computer Vision:** [YOLOv8](https://github.com/ultralytics/ultralytics), [PyTorch](https://pytorch.org/), [OpenCV](https://opencv.org/)
* **Data Processing:** [Pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/)
* **Backend Framework:** FastAPI (Planned / Future Scope)
* **Frontend Web App:** Next.js, React, Tailwind CSS (Planned / Future Scope)

---

## Repository Structure

Below is the layout of the project, including links to primary files and modules:

```text
TennisVision-AI/
├── docs/
│   └── overview.md                  # Comprehensive project goals and specs
├── backend/
│   ├── main.py                      # Main entrypoint script for running the pipeline
│   ├── requirements.txt             # Backend dependencies (PyTorch, Ultralytics, etc.)
│   ├── trackers/                    # YOLOv8 Player and Ball tracking logic
│   │   ├── __init__.py
│   │   ├── player_tracker.py        # PlayerTracker class (YOLOv8 + Bounding Box drawing)
│   │   └── ball_tracker.py          # BallTracker class (Custom YOLO + Interpolation)
│   ├── court_line_detector/         # ResNet50 keypoints extraction
│   │   ├── __init__.py
│   │   └── court_line_detector.py   # CourtLineDetector class (inference & keypoints drawing)
│   ├── mini_court/                  # Perspective projection to 2D mini-court
│   │   └── mini_court.py            # MiniCourt class (conversions & 2D rendering)
│   ├── utils/                       # Conversion, bbox, and draw helpers
│   │   ├── __init__.py
│   │   ├── bbox_utils.py            # Foot positions, distances, and centers
│   │   ├── conversions.py           # Pixel-to-meter translation ratios
│   │   └── player_stats_drawer.py   # HUD drawing of player statistics
│   ├── models/                      # Deep learning model weight artifacts
│   ├── input_videos/                # Put source match videos (.mp4) here
│   └── output_videos/               # Destination of processed analysis videos (.avi)
└── frontend/                        # Frontend dashboard application (Future Scope)
```

### Code Navigation Links:
* Main Execution Script: [backend/main.py](file:///E:/TennisVision-AI/backend/main.py)
* Dependencies: [backend/requirements.txt](file:///E:/TennisVision-AI/backend/requirements.txt)
* Court Line Detector: [court_line_detector.py](file:///E:/TennisVision-AI/backend/court_line_detector/court_line_detector.py)
* Mini-Court Converter: [mini_court.py](file:///E:/TennisVision-AI/backend/mini_court/mini_court.py)
* Player Tracker: [player_tracker.py](file:///E:/TennisVision-AI/backend/trackers/player_tracker.py)
* Ball Tracker: [ball_tracker.py](file:///E:/TennisVision-AI/backend/trackers/ball_tracker.py)

---

## Installation & Setup

Follow these instructions to set up the environment and run the computer vision pipeline locally.

### 1. Prerequisites
Ensure you have **Python 3.8+** and `pip` installed on your machine.

### 2. Create and Activate Virtual Environment
Initialize a local Python virtual environment to manage project-specific dependencies:

```bash
# In the project root directory:
python -m venv venv

# Activate on Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Activate on Windows (Command Prompt):
.\venv\Scripts\activate.bat

# Activate on macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
Change directory to `backend` and install the package dependencies specified in [requirements.txt](file:///E:/TennisVision-AI/backend/requirements.txt):

```bash
cd backend
pip install -r requirements.txt
```

### 4. Setup Model Weights
Ensure the required model weights exist in the correct folders:
* **YOLOv8 Object Detection Weights:** `yolov8x.pt` should be placed directly inside the `backend/` directory.
* **Custom Ball Tracker weights:** `best.pt` should be placed in `backend/models/best.pt`.
* **ResNet50 Court Line Weights:** `keypoints_model.pth` should be placed in `backend/models/keypoints_model.pth`.

### 5. Input Match Video
Place your source tennis video in the `backend/input_videos/` directory. By default, the pipeline looks for a file named `input_video1.mp4`.

---

## Running the Analysis Pipeline

With the virtual environment activated, execute the pipeline by running the main python script:

```bash
python main.py
```

The script executes the following stages:
1. **Reads** the input frames from `input_videos/input_video1.mp4`.
2. **Tracks players** using YOLOv8, narrowing down the tracks to the two primary active players.
3. **Detects the ball** using the custom ball detection weights and interpolates missing frames.
4. **Predicts court line keypoints** and maps the scene coordinate system.
5. **Simulates 2D mini-court mapping** of the active participants.
6. **Overlays analytics** including player speed, shot speed, average metrics, and frame counts onto the frames.
7. **Saves** the final processed video in AVI format at `output_videos/output_video.avi`.

---

## Future Development Scope

* **Next.js & FastAPI Web App:** Implement user authentication, interactive dashboard visuals, responsive UI charts, and drag-and-drop video upload widgets.
* **Stroke Classification:** Train classifiers to distinguish forehands, backhands, serves, and slices automatically.
* **Pose Estimation:** Integrate MediaPipe Pose for biomechanical analytics on serve/stroke kinematics.
* **Multi-Camera Re-ID:** Implement OSNet-based player re-identification to track players across camera switches.

---

## Acknowledgment

This project builds upon an open-source tennis analysis pipeline and extends it into a full-stack AI analytics platform with a FastAPI backend, Next.js frontend, enhanced visualizations, and an interactive analytics dashboard.
