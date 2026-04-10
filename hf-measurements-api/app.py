import os
import tempfile
import numpy as np
import cv2
import mediapipe as mp
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Youngin Measurements API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Initialise MediaPipe Pose once at startup ─────────────────────────────────
mp_pose = mp.solutions.pose

logger.info("MediaPipe Pose initialised ✓")


# ─── Landmark indices (MediaPipe 33-point skeleton) ────────────────────────────
LM = mp_pose.PoseLandmark


def _get_dist(lms, a: int, b: int) -> float:
    """Euclidean pixel distance between two landmarks."""
    la, lb = lms[a], lms[b]
    return float(np.hypot(la.x - lb.x, la.y - lb.y))


def _get_midpoint(lms, a: int, b: int):
    la, lb = lms[a], lms[b]
    return ((la.x + lb.x) / 2, (la.y + lb.y) / 2)


def _pixel_height(lms) -> float:
    """Rough skeleton height in normalised units (head→ankle)."""
    head_y = min(lms[LM.LEFT_EAR].y, lms[LM.RIGHT_EAR].y)
    ankle_y = max(lms[LM.LEFT_ANKLE].y, lms[LM.RIGHT_ANKLE].y)
    return max(ankle_y - head_y, 1e-6)


def run_mediapipe(img_bgr: np.ndarray) -> dict:
    """Run MediaPipe Pose on an RGB image and return normalised landmarks + scale."""
    # Enhance contrast for dim photos
    lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
    l, a, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    img_bgr = cv2.cvtColor(cv2.merge((clahe.apply(l), a, b_ch)), cv2.COLOR_LAB2BGR)
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    with mp_pose.Pose(
        static_image_mode=True,
        model_complexity=2,          # most accurate model
        enable_segmentation=False,
        min_detection_confidence=0.4,
    ) as pose:
        result = pose.process(img_rgb)

    if not result.pose_landmarks:
        raise ValueError(
            "No person detected. Please use a bright, full-body photo "
            "against a plain background."
        )

    lms = result.pose_landmarks.landmark
    skeleton_h = _pixel_height(lms)
    return {"lms": lms, "skeleton_h": skeleton_h}


def _normalised_width(lms, a: int, b: int, skeleton_h: float) -> float:
    """Width between two landmarks expressed as proportion of skeleton height."""
    return _get_dist(lms, a, b) / skeleton_h


def compute_measurements_from_poses(
    front: dict,
    side: dict | None,
    height_cm: float,
    gender: str = "neutral",
) -> dict:
    """
    Fuse front + side pose data into final body measurements.

    Strategy
    --------
    - Use CAESAR/ANSUR-II anthropometric ratio tables as a strong prior
    - Adjust ratios using the skeleton width observations (proportional to height)
    - Side view corrects depth-related measurements (chest front-to-back, belly)
    """
    h = float(height_cm)

    # ── Baseline ratio tables (CAESAR / ANSUR II) ──────────────────────────────
    if gender == "female":
        base = dict(
            chest=0.530, waist=0.428, hip=0.555,
            shoulder_width=0.237, neck=0.204, thigh=0.330,
            knee=0.215, calf=0.207, ankle=0.128, inseam=0.455,
        )
    else:
        base = dict(
            chest=0.527, waist=0.435, hip=0.530,
            shoulder_width=0.246, neck=0.218, thigh=0.320,
            knee=0.212, calf=0.200, ankle=0.123, inseam=0.462,
        )

    f_lms = front["lms"]
    f_sh  = front["skeleton_h"]

    # ── Front-view skeletal proportions ────────────────────────────────────────
    shoulder_ratio = _normalised_width(f_lms, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, f_sh)
    hip_ratio      = _normalised_width(f_lms, LM.LEFT_HIP,      LM.RIGHT_HIP,      f_sh)
    # Chest approximated from shoulder width (shoulder ≈ 0.75× chest biacromial)
    chest_ratio    = shoulder_ratio / 0.75
    waist_ratio    = (hip_ratio + shoulder_ratio) * 0.45  # anatomical estimate
    thigh_ratio    = _normalised_width(f_lms, LM.LEFT_HIP,   LM.LEFT_KNEE,  f_sh) * 0.62
    knee_ratio     = _normalised_width(f_lms, LM.LEFT_KNEE,  LM.LEFT_ANKLE, f_sh) * 0.68
    calf_ratio     = _normalised_width(f_lms, LM.LEFT_KNEE,  LM.LEFT_ANKLE, f_sh) * 0.58

    # Map observed ratios → circumferences using statistical girth factor (π * d ≈ 3.0 for limbs)
    GIRTH = 3.0
    CHEST_GIRTH = 2.85  # slightly flatter cross-section

    obs = dict(
        chest          = chest_ratio      * h * CHEST_GIRTH,
        waist          = waist_ratio      * h * GIRTH,
        hip            = hip_ratio        * h * GIRTH,
        shoulder_width = shoulder_ratio   * h,           # linear width, not girth
        thigh          = thigh_ratio      * h * GIRTH,
        knee           = knee_ratio       * h * GIRTH,
        calf           = calf_ratio       * h * GIRTH,
    )

    # Inseam from hip → ankle along leg
    left_hip_y   = f_lms[LM.LEFT_HIP].y
    left_ankle_y = f_lms[LM.LEFT_ANKLE].y
    inseam_ratio = (left_ankle_y - left_hip_y) / f_sh
    obs["inseam"] = inseam_ratio * h

    # Neck — front view: distance between ear-bottom points scaled
    obs["neck"] = _normalised_width(f_lms, LM.LEFT_EAR, LM.RIGHT_EAR, f_sh) * h * 2.4

    # ── Side-view depth correction (optional) ──────────────────────────────────
    side_depth_factor = 1.0  # neutral: no correction
    if side is not None:
        try:
            s_lms = side["lms"]
            s_sh  = side["skeleton_h"]
            # Front-to-back torso depth from side view (shoulder → hip depth)
            torso_depth = _normalised_width(s_lms, LM.LEFT_SHOULDER, LM.LEFT_HIP, s_sh) * 0.45
            expected_depth = base["chest"] * 0.32  # typical depth/girth ratio
            side_depth_factor = min(max(torso_depth / expected_depth, 0.85), 1.20)
            logger.info(f"Side depth correction factor: {side_depth_factor:.3f}")
        except Exception as ex:
            logger.warning(f"Side view processing failed, ignoring: {ex}")

    # ── Blend observed with baseline (weighted average) ─────────────────────────
    alpha = 0.60   # 60% observed skeleton, 40% anthropometric prior
    final_m: dict[str, float] = {"height": round(h, 1)}

    for key, prior_val in base.items():
        prior_cm = prior_val * h
        obs_cm   = obs.get(key, prior_cm)

        # Apply side depth correction to girth measurements
        depth_adj = side_depth_factor if key in ("chest", "waist") else 1.0

        blended = (alpha * obs_cm + (1 - alpha) * prior_cm) * depth_adj
        final_m[key] = round(blended, 1)

    # ── Sanity constraints (anatomy can't flip) ────────────────────────────────
    if final_m["waist"] > final_m["chest"]:
        final_m["waist"] = final_m["chest"] - 4.0
    if final_m["knee"] > final_m["thigh"]:
        final_m["knee"] = final_m["thigh"] - 8.0
    if final_m["ankle"] > final_m["calf"]:
        final_m["ankle"] = final_m["calf"] - 6.0
    if final_m["shoulder_width"] > final_m["chest"] * 0.55:
        final_m["shoulder_width"] = round(final_m["chest"] * 0.50, 1)

    return {k: round(v, 1) for k, v in final_m.items()}


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "model": "mediapipe-pose-v2", "version": "2.0.0"}


@app.post("/api/scan")
async def scan(
    front_image: UploadFile = File(...),
    side_image:  UploadFile = File(None),
    height_cm:   float      = Form(170.0),
    gender:      str        = Form("neutral"),
):
    if not front_image:
        raise HTTPException(status_code=400, detail="front_image is required")

    with tempfile.TemporaryDirectory() as tmp:
        # Save uploaded images
        front_path = os.path.join(tmp, "front.jpg")
        front_bytes = await front_image.read()
        with open(front_path, "wb") as f:
            f.write(front_bytes)

        side_path = None
        if side_image and side_image.filename:
            side_path = os.path.join(tmp, "side.jpg")
            side_bytes = await side_image.read()
            with open(side_path, "wb") as f:
                f.write(side_bytes)

        try:
            # Load images
            front_bgr = cv2.imread(front_path)
            if front_bgr is None:
                raise ValueError("Could not decode front image. Please upload a valid JPG or PNG.")

            side_bgr = cv2.imread(side_path) if side_path else None

            # Run pose estimation
            logger.info("Running MediaPipe on front image...")
            front_pose = run_mediapipe(front_bgr)

            side_pose = None
            if side_bgr is not None:
                try:
                    logger.info("Running MediaPipe on side image...")
                    side_pose = run_mediapipe(side_bgr)
                except Exception as ex:
                    logger.warning(f"Side image pose failed, using front only: {ex}")

            # Compute measurements
            measurements = compute_measurements_from_poses(
                front=front_pose,
                side=side_pose,
                height_cm=height_cm,
                gender=gender.lower(),
            )

            logger.info(f"Scan complete: {measurements}")
            return JSONResponse(content={"success": True, "measurements": measurements})

        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e))
        except Exception as e:
            logger.exception("Unexpected scan error")
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=7860, reload=False, log_level="info")
