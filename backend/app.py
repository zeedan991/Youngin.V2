"""
YOUNGIN Body Scan API
---------------------
POST /api/scan
  - front_image: image file
  - side_image:  image file
  - height_cm:   float
  - gender:      "neutral" | "male" | "female"

Returns:
  {
    success: true,
    measurements: { chest, waist, hip, ... },
    obj: "<OBJ mesh string>"
  }
"""

import os
import sys
import json
import tempfile
import numpy as np
import cv2
import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path

# ─── Paths ────────────────────────────────────────────────────────────────────
# These are resolved relative to this file so the file can live anywhere
BASE_DIR   = Path(__file__).parent

# HMR2.0 (4D-Humans) clone — sibling folder
HMR2_PATH  = os.environ.get("HMR2_PATH",  str(BASE_DIR / "4D-Humans"))

# SMPL-Anthropometry clone — sibling folder
ANTHRO_PATH = os.environ.get("ANTHRO_PATH", str(BASE_DIR / "SMPL-Anthropometry"))

# SMPL model .pkl — inside 4D-Humans/data/
SMPL_PKL   = os.environ.get(
    "SMPL_PKL",
    str(Path(HMR2_PATH) / "data" / "basicModel_neutral_lbs_10_207_0_v1.0.0.pkl"),
)

for p in [HMR2_PATH, ANTHRO_PATH]:
    if p not in sys.path:
        sys.path.insert(0, p)

# ─── Flask app ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ─── Load AI model once at startup ───────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = None
model_cfg = None

def _load_model():
    global model, model_cfg
    if model is not None:
        return
    print(f"[YOUNGIN] Loading HMR 2.0 on {device}...")
    from hmr2.configs import CACHE_DIR_4DHUMANS
    from hmr2.models import load_hmr2, download_models, DEFAULT_CHECKPOINT
    download_models(CACHE_DIR_4DHUMANS)
    model, model_cfg = load_hmr2(DEFAULT_CHECKPOINT)
    model = model.to(device)
    model.eval()
    print(f"[YOUNGIN] Model ready ✓")


# ─── Core helper: run HMR2 on one image ─────────────────────────────────────
def _run_hmr2(image_path: str) -> dict:
    from hmr2.utils.utils_detectron2 import DefaultPredictor_Lazy
    from detectron2.config import LazyConfig
    from hmr2.datasets.vitdet_dataset import ViTDetDataset
    from hmr2.utils import recursive_to
    import hmr2

    cfg_path = Path(hmr2.__file__).parent / "configs" / "cascade_mask_rcnn_vitdet_h_75ep.py"
    det_cfg  = LazyConfig.load(str(cfg_path))
    det_cfg.train.init_checkpoint = (
        "https://dl.fbaipublicfiles.com/detectron2/ViTDet/COCO/"
        "cascade_mask_rcnn_vitdet_h/f328730692/model_final_f05665.pkl"
    )
    for i in range(3):
        det_cfg.model.roi_heads.box_predictors[i].test_score_thresh = 0.25

    detector = DefaultPredictor_Lazy(det_cfg)
    img      = cv2.imread(str(image_path))

    if img is None:
        raise ValueError(f"Could not read image: {image_path}")

    det_out   = detector(img)
    instances = det_out["instances"]
    valid_idx = (instances.pred_classes == 0) & (instances.scores > 0.5)
    boxes     = instances.pred_boxes.tensor[valid_idx].cpu().numpy()

    if len(boxes) == 0:
        raise ValueError(
            "No person detected. Make sure the full body is visible "
            "on a plain background in bright light."
        )

    # Use the highest-confidence detection
    dataset    = ViTDetDataset(model_cfg, img, boxes[:1])
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=1, shuffle=False)

    with torch.no_grad():
        batch = next(iter(dataloader))
        batch = recursive_to(batch, device)
        out   = model(batch)

    betas         = out["pred_smpl_params"]["betas"][0].cpu().numpy()
    body_pose     = out["pred_smpl_params"]["body_pose"][0].cpu().numpy()
    global_orient = out["pred_smpl_params"]["global_orient"][0].cpu().numpy()

    return {
        "betas":         betas.tolist(),
        "body_pose":     body_pose.tolist(),
        "global_orient": global_orient.tolist(),
    }


# ─── Measurements using SMPL-Anthropometry ───────────────────────────────────
def _get_measurements(betas: list, height_cm: float, gender: str = "neutral") -> dict:
    from smpl_anthropometry import SMPLMeasurements

    betas_np = np.array(betas, dtype=np.float32)
    measurer = SMPLMeasurements(smpl_path=SMPL_PKL)
    measurer.measure_from_params(betas=betas_np, gender=gender)

    raw = measurer.measurements  # dict of measurements in cm
    if not raw:
        return {"height": height_cm}

    # SMPL canonical height ~170 cm — scale all to actual height
    smpl_height = raw.get("height", 170.0)
    scale       = height_cm / smpl_height if smpl_height else 1.0

    scaled = {k: round(float(v) * scale, 1) for k, v in raw.items()}
    scaled["height"] = round(height_cm, 1)  # use exact user-provided height
    return scaled


# ─── Generate OBJ mesh from SMPL parameters ──────────────────────────────────
def _export_obj(betas: list, body_pose: list, global_orient: list) -> str:
    import smplx

    smpl_model = smplx.create(
        SMPL_PKL,
        model_type="smpl",
        gender="neutral",
        num_betas=10,
        ext="pkl",
    )

    with torch.no_grad():
        output = smpl_model(
            betas=torch.tensor(betas, dtype=torch.float32).unsqueeze(0),
            body_pose=torch.tensor(body_pose, dtype=torch.float32).unsqueeze(0),
            global_orient=torch.tensor(global_orient, dtype=torch.float32).unsqueeze(0),
            return_verts=True,
        )

    verts = output.vertices.detach().numpy()[0]   # (6890, 3)
    faces = smpl_model.faces                       # (N, 3)

    lines = []
    for v in verts:
        lines.append(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}")
    for f in faces:
        lines.append(f"f {f[0]+1} {f[1]+1} {f[2]+1}")

    return "\n".join(lines)


# ─── Routes ──────────────────────────────────────────────────────────────────
@app.before_first_request
def startup():
    _load_model()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "device": str(device),
        "model_loaded": model is not None,
        "smpl_pkl_exists": Path(SMPL_PKL).exists(),
    })


@app.route("/api/scan", methods=["POST"])
def scan():
    """
    Multipart form POST:
      front_image  (file)
      side_image   (file)
      height_cm    (number, cm)
      gender       (optional: neutral/male/female)
    """
    if "front_image" not in request.files or "side_image" not in request.files:
        return jsonify({"error": "Both front_image and side_image are required"}), 400

    height_cm = float(request.form.get("height_cm", 170))
    gender    = request.form.get("gender", "neutral")

    if height_cm < 100 or height_cm > 250:
        return jsonify({"error": "height_cm must be between 100 and 250"}), 400

    with tempfile.TemporaryDirectory() as tmp:
        front_path = os.path.join(tmp, "front.jpg")
        side_path  = os.path.join(tmp, "side.jpg")
        request.files["front_image"].save(front_path)
        request.files["side_image"].save(side_path)

        try:
            # Primary shape estimation from front photo
            front_params = _run_hmr2(front_path)

            # Average betas from side photo for better depth accuracy
            try:
                side_params = _run_hmr2(side_path)
                avg_betas   = [
                    (f + s) / 2
                    for f, s in zip(front_params["betas"], side_params["betas"])
                ]
            except Exception as ex:
                print(f"[YOUNGIN] Side photo failed ({ex}), using front only")
                avg_betas = front_params["betas"]

            measurements = _get_measurements(avg_betas, height_cm, gender)

            obj_string = _export_obj(
                avg_betas,
                front_params["body_pose"],
                front_params["global_orient"],
            )

            return jsonify({
                "success":      True,
                "measurements": measurements,
                "obj":          obj_string,
                "smpl_params":  {
                    "betas":         avg_betas,
                    "body_pose":     front_params["body_pose"],
                    "global_orient": front_params["global_orient"],
                },
            })

        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500


if __name__ == "__main__":
    _load_model()
    app.run(host="0.0.0.0", port=5001, debug=False)
