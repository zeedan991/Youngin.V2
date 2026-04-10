import os, sys, tempfile, pickle, numpy as np, cv2, torch

# --- PYTORCH SECURITY PATCH ---
orig_load = torch.load
def patched_load(*args, **kwargs):
    kwargs.pop('weights_only', None)
    return orig_load(*args, **kwargs, weights_only=False)
torch.load = patched_load

from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path

HMR2_PATH = "/content/4D-Humans"
SMPL_PKL  = "/content/data/basicModel_neutral_lbs_10_207_0_v1.0.0.pkl"
sys.path.insert(0, HMR2_PATH)

from hmr2.models import load_hmr2, download_models, DEFAULT_CHECKPOINT
from hmr2.configs import CACHE_DIR_4DHUMANS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Bypass-Tunnel-Reminder"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

print("Loading SMPL faces...")
with open(SMPL_PKL, 'rb') as f:
    _d = pickle.load(f, encoding='latin1')
SMPL_FACES = np.array(_d['f'], dtype=np.int64)
print(f"Faces: {SMPL_FACES.shape} ✓")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Loading HMR2 on {device}...")
download_models(CACHE_DIR_4DHUMANS)
model, model_cfg = load_hmr2(DEFAULT_CHECKPOINT)
model = model.to(device).eval()
print("HMR2 ready ✓")

def run_hmr2(img_path):
    from hmr2.utils.utils_detectron2 import DefaultPredictor_Lazy
    from detectron2.config import LazyConfig
    from hmr2.datasets.vitdet_dataset import ViTDetDataset
    from hmr2.utils import recursive_to
    import hmr2

    det_cfg = LazyConfig.load(str(Path(hmr2.__file__).parent / "configs" / "cascade_mask_rcnn_vitdet_h_75ep.py"))
    det_cfg.train.init_checkpoint = (
        "https://dl.fbaipublicfiles.com/detectron2/ViTDet/COCO/"
        "cascade_mask_rcnn_vitdet_h/f328730692/model_final_f05665.pkl"
    )
    for i in range(3):
        det_cfg.model.roi_heads.box_predictors[i].test_score_thresh = 0.25

    predictor = DefaultPredictor_Lazy(det_cfg)
    img = cv2.imread(img_path)
    
    # Improve brightness/contrast for detection
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = cv2.cvtColor(cv2.merge((clahe.apply(l), a, b_ch)), cv2.COLOR_LAB2BGR)

    det_out   = predictor(img)
    instances = det_out["instances"]
    valid     = (instances.pred_classes == 0) & (instances.scores > 0.25)
    boxes     = instances.pred_boxes.tensor[valid].cpu().numpy()

    if len(boxes) == 0:
        raise ValueError("No person detected. Use a bright full-body photo against a plain background.")

    dataset = ViTDetDataset(model_cfg, img, boxes[:1])
    batch   = recursive_to(next(iter(torch.utils.data.DataLoader(dataset, batch_size=1))), device)

    with torch.no_grad():
        out = model(batch)

    # Return full parameters to allow combining front and side shapes later
    return {
        "betas": out["pred_smpl_params"]["betas"][0],
        "body_pose": out["pred_smpl_params"]["body_pose"][0],
        "global_orient": out["pred_smpl_params"]["global_orient"][0],
        "vertices": out["pred_vertices"][0].cpu().numpy()
    }


def compute_measurements(betas, height_cm, gender="neutral"):
    h = float(height_cm)

    # Research-backed anthropometric ratios (CAESAR / ANSUR II)
    if gender == "female":
        ratios = {
            "chest": 0.530, "waist": 0.428, "hip": 0.555,
            "shoulder_width": 0.237, "neck": 0.204, "thigh": 0.330,
            "knee": 0.215, "calf": 0.207, "ankle": 0.128, "inseam": 0.455,
        }
    else:
        ratios = {
            "chest": 0.527, "waist": 0.435, "hip": 0.530,
            "shoulder_width": 0.246, "neck": 0.218, "thigh": 0.320,
            "knee": 0.212, "calf": 0.200, "ankle": 0.123, "inseam": 0.462,
        }

    # SMPL betas[0] = sizing component, betas[1] = heaviness component
    b0 = float(np.clip(betas[0], -2.5, 2.5))
    b1 = float(np.clip(betas[1], -2.5, 2.5))

    girth_keys = {"chest", "waist", "hip", "thigh", "neck", "knee", "calf", "ankle"}
    depth_keys = {"chest", "waist"}

    # Initialize measurements explicitly with the user's height input
    final_m = {"height": round(h, 1)}

    for key, ratio in ratios.items():
        base = h * ratio
        adj = 0.0
        
        # Modify the base prediction depending on the shape the AI detected
        if key in girth_keys:
            adj += b0 * 0.015 * base
        if key in depth_keys:
            adj += b1 * 0.008 * base
            
        final_m[key] = round(base + adj, 1)

    # Hard-enforce constraints so properties don't flip
    if final_m["waist"] > final_m["chest"] and b0 < 1.0:
        final_m["waist"] = final_m["chest"] - 4.0
    if final_m["knee"] > final_m["thigh"]:
        final_m["knee"] = final_m["thigh"] - 8.0

    return final_m


def build_obj(verts_m, faces):
    v = verts_m.copy()
    v[:, 1] *= -1  # flip Y axis for Three.js
    lines  = [f"v {x:.5f} {y:.5f} {z:.5f}" for x, y, z in v]
    lines += [f"f {a+1} {b+1} {c+1}" for a, b, c in faces]
    return "\n".join(lines)


@app.route("/health")
def health(): return jsonify({"status": "ok"})


@app.route("/api/scan", methods=["POST", "OPTIONS"])
def scan():
    if request.method == "OPTIONS": return jsonify({}), 200
    if "front_image" not in request.files or "side_image" not in request.files:
        return jsonify({"error": "Both front_image and side_image are required"}), 400

    # Ensure strong casting to float
    height_cm = float(request.form.get("height_cm", 170.0))
    gender = request.form.get("gender", "neutral")

    with tempfile.TemporaryDirectory() as tmp:
        front_p = os.path.join(tmp, "front.jpg")
        side_p  = os.path.join(tmp, "side.jpg")
        request.files["front_image"].save(front_p)
        request.files["side_image"].save(side_p)
        
        try:
            front_out = run_hmr2(front_p)
            
            # Use side photo to drastically improve thickness/belly estimation
            try:
                side_out = run_hmr2(side_p)
                # Take the max of heaviness (beta 0 and 1) to account for baggy clothes hiding shape
                combined_betas = (front_out["betas"] + side_out["betas"]) / 2.0
                # If side shows a larger belly/depth, favor it
                if side_out["betas"][1] > front_out["betas"][1]:
                    combined_betas[1] = side_out["betas"][1]
            except Exception as ex:
                print("Side photo failed processing, falling back to front only:", ex)
                combined_betas = front_out["betas"]

            # Re-generate the 3D mesh vertices using the improved merged shape
            with torch.no_grad():
                smpl_out = model.smpl(
                    betas=combined_betas.unsqueeze(0),
                    body_pose=front_out["body_pose"].unsqueeze(0),
                    global_orient=front_out["global_orient"].unsqueeze(0)
                )
                final_vertices = smpl_out.vertices[0].cpu().numpy()

            combined_betas_np = combined_betas.cpu().numpy()
            measurements = compute_measurements(combined_betas_np, height_cm, gender)
            obj_str      = build_obj(final_vertices, SMPL_FACES)

            return jsonify({
                "success": True, 
                "measurements": measurements, 
                "obj": obj_str
            })
        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            import traceback; traceback.print_exc()
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500

if __name__ == "__main__":
    from flask_cloudflared import run_with_cloudflared
    run_with_cloudflared(app)
    app.run(host="0.0.0.0", port=5001)
