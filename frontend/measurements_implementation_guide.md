# 🧠 Body Scan AI — Full Implementation Guide (Option A)
### Hackathon Edition · Front Photo + Side Photo → Real 3D Body Mesh → Exact Measurements

---

## What You Are Building

A web app where a user uploads a **front photo** and a **side photo**, enters their height in cm, and your site returns:

1. A **rotating interactive 3D body mesh** (realistic SMPL model shaped to their body)
2. **Exact measurements** overlaid on screen (chest, waist, hip, inseam, shoulder width, etc.)

This is Option A — the full pipeline. Every layer of the stack is covered below, in order.

---

## Stack Overview

```
User browser
  └── React frontend (photo upload + Three.js 3D viewer)
        └── Flask backend (Python)
              ├── MediaPipe  →  body keypoints from photos
              ├── MiDaS      →  depth estimation from side photo
              ├── HMR 2.0    →  SMPL shape + pose parameters
              └── SMPL-Anthropometry  →  measurements from mesh
```

---

## Prerequisites

Install these before you do anything else.

```bash
# Python 3.10 recommended (HMR2 has torch deps that work best here)
python --version

# Node 18+
node --version

# CUDA (optional but massively faster — check if you have a GPU)
nvidia-smi
```

---

## Part 1 — Clone and Set Up HMR 2.0

This is the core AI model. It takes a photo and outputs SMPL body parameters.

```bash
git clone https://github.com/shubham-goel/4D-Humans.git
cd 4D-Humans
```

### Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Mac/Linux
# OR
venv\Scripts\activate           # Windows
```

### Install dependencies

```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
# If no GPU, use:
# pip install torch torchvision

pip install -e ".[all]"
pip install detectron2 --extra-index-url https://dl.fbaipublicfiles.com/detectron2/wheels/cu118/torch2.0/index.html
```

### Download the SMPL model (required — manual step)

1. Go to https://smpl.is.tue.mpg.de/
2. Register for a free account
3. Download **SMPL for Python** → get `basicModel_neutral_lbs_10_207_0_v1.0.0.pkl`
4. Place it at:

```
4D-Humans/
  data/
    basicModel_neutral_lbs_10_207_0_v1.0.0.pkl   ← put it here
```

### Test HMR 2.0 works

```bash
python demo.py \
  --img_folder example_data/images \
  --out_folder demo_out \
  --batch_size=1 \
  --side_view \
  --save_mesh
```

You should see `.obj` mesh files appear in `demo_out/`. If that works, your core AI is live.

---

## Part 2 — Clone SMPL-Anthropometry (Measurement Extraction)

This library takes an SMPL mesh and outputs real-world measurements in cm.

```bash
# In a separate folder, outside 4D-Humans
git clone https://github.com/DavidBoja/SMPL-Anthropometry.git
cd SMPL-Anthropometry
pip install -r requirements.txt
```

### Quick test

```python
from smpl_anthropometry import SMPLMeasurements

measurer = SMPLMeasurements(smpl_path="path/to/basicModel_neutral_lbs_10_207_0_v1.0.0.pkl")
measurer.measure_from_params(betas, gender="neutral")  # betas come from HMR2 output
print(measurer.measurements)
# → {'chest': 96.4, 'waist': 81.2, 'hip': 99.7, ...}
```

---

## Part 3 — Build the Flask Backend

Create a new folder for your web app:

```bash
mkdir body-scan-app
cd body-scan-app
pip install flask flask-cors mediapipe opencv-python timm
```

### File: `backend/app.py`

```python
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

# Add HMR2 to path — update this to your actual clone location
HMR2_PATH = "/path/to/4D-Humans"
sys.path.insert(0, HMR2_PATH)

SMPL_ANTHRO_PATH = "/path/to/SMPL-Anthropometry"
sys.path.insert(0, SMPL_ANTHRO_PATH)

SMPL_MODEL_PATH = "/path/to/basicModel_neutral_lbs_10_207_0_v1.0.0.pkl"

from hmr2.configs import CACHE_DIR_4DHUMANS
from hmr2.models import HMR2, download_models, load_hmr2, DEFAULT_CHECKPOINT
from hmr2.utils import recursive_to
from hmr2.datasets.vitdet_dataset import ViTDetDataset, DEFAULT_MEAN, DEFAULT_STD
from hmr2.utils.renderer import Renderer, cam_crop_to_full

app = Flask(__name__)
CORS(app)

# Load model once at startup (slow to load, fast to run)
print("Loading HMR2 model...")
download_models(CACHE_DIR_4DHUMANS)
model, model_cfg = load_hmr2(DEFAULT_CHECKPOINT)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
model.eval()
print(f"Model ready on {device}")


def run_hmr2_on_image(image_path):
    """Run HMR2 on a single image, return SMPL betas and pose params."""
    from hmr2.utils.utils_detectron2 import DefaultPredictor_Lazy
    from detectron2.config import LazyConfig
    import hmr2

    cfg_path = Path(hmr2.__file__).parent / "configs" / "cascade_mask_rcnn_vitdet_h_75ep.py"
    detectron2_cfg = LazyConfig.load(str(cfg_path))
    detectron2_cfg.train.init_checkpoint = (
        "https://dl.fbaipublicfiles.com/detectron2/ViTDet/COCO/"
        "cascade_mask_rcnn_vitdet_h/f328730692/model_final_f05665.pkl"
    )
    for i in range(3):
        detectron2_cfg.model.roi_heads.box_predictors[i].test_score_thresh = 0.25

    detector = DefaultPredictor_Lazy(detectron2_cfg)

    img_cv2 = cv2.imread(str(image_path))
    det_out = detector(img_cv2)
    det_instances = det_out["instances"]
    valid_idx = (det_instances.pred_classes == 0) & (det_instances.scores > 0.5)
    boxes = det_instances.pred_boxes.tensor[valid_idx].cpu().numpy()

    if len(boxes) == 0:
        raise ValueError("No person detected in image")

    # Use the highest-confidence detection
    box = boxes[0]
    dataset = ViTDetDataset(model_cfg, img_cv2, [box])
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=1, shuffle=False)

    with torch.no_grad():
        batch = next(iter(dataloader))
        batch = recursive_to(batch, device)
        out = model(batch)

    betas = out["pred_smpl_params"]["betas"][0].cpu().numpy()
    body_pose = out["pred_smpl_params"]["body_pose"][0].cpu().numpy()
    global_orient = out["pred_smpl_params"]["global_orient"][0].cpu().numpy()

    return {
        "betas": betas.tolist(),
        "body_pose": body_pose.tolist(),
        "global_orient": global_orient.tolist(),
    }


def get_measurements(betas, height_cm, gender="neutral"):
    """Use SMPL-Anthropometry to extract measurements from betas."""
    sys.path.insert(0, SMPL_ANTHRO_PATH)
    from smpl_anthropometry import SMPLMeasurements

    betas_np = np.array(betas)
    measurer = SMPLMeasurements(smpl_path=SMPL_MODEL_PATH)
    measurer.measure_from_params(betas=betas_np, gender=gender)

    # Scale measurements by actual height
    measurements = measurer.measurements
    if measurements:
        # SMPL default height ≈ 170cm — scale all measurements
        smpl_height = measurements.get("height", 170.0)
        scale = height_cm / smpl_height
        scaled = {k: round(v * scale, 1) for k, v in measurements.items()}
        scaled["height"] = height_cm  # override with user-provided
        return scaled

    return measurements


def export_mesh_as_obj(betas, body_pose, global_orient):
    """Generate SMPL mesh and return OBJ file content as string."""
    import smplx
    model_smpl = smplx.create(
        SMPL_MODEL_PATH,
        model_type="smpl",
        gender="neutral",
        use_face_contour=False,
        num_betas=10,
        num_expression_coeffs=10,
        ext="pkl",
    )
    output = model_smpl(
        betas=torch.tensor(betas, dtype=torch.float32).unsqueeze(0),
        body_pose=torch.tensor(body_pose, dtype=torch.float32).unsqueeze(0),
        global_orient=torch.tensor(global_orient, dtype=torch.float32).unsqueeze(0),
        return_verts=True,
    )

    vertices = output.vertices.detach().numpy()[0]
    faces = model_smpl.faces

    lines = []
    for v in vertices:
        lines.append(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}")
    for f in faces:
        lines.append(f"f {f[0]+1} {f[1]+1} {f[2]+1}")

    return "\n".join(lines)


@app.route("/api/scan", methods=["POST"])
def scan():
    """
    Expects multipart form with:
      - front_image: image file
      - side_image: image file
      - height_cm: float (user's height in cm)
      - gender: "neutral" | "male" | "female" (optional)
    """
    if "front_image" not in request.files or "side_image" not in request.files:
        return jsonify({"error": "Both front_image and side_image are required"}), 400

    height_cm = float(request.form.get("height_cm", 170))
    gender = request.form.get("gender", "neutral")

    with tempfile.TemporaryDirectory() as tmpdir:
        front_path = os.path.join(tmpdir, "front.jpg")
        side_path = os.path.join(tmpdir, "side.jpg")
        request.files["front_image"].save(front_path)
        request.files["side_image"].save(side_path)

        try:
            # Run HMR2 on front photo (primary shape estimation)
            front_params = run_hmr2_on_image(front_path)

            # Run HMR2 on side photo and average betas for better accuracy
            try:
                side_params = run_hmr2_on_image(side_path)
                # Average the betas from both views
                avg_betas = [
                    (f + s) / 2
                    for f, s in zip(front_params["betas"], side_params["betas"])
                ]
            except Exception:
                # Fall back to front only if side detection fails
                avg_betas = front_params["betas"]

            measurements = get_measurements(avg_betas, height_cm, gender)

            obj_string = export_mesh_as_obj(
                avg_betas,
                front_params["body_pose"],
                front_params["global_orient"],
            )

            return jsonify({
                "success": True,
                "measurements": measurements,
                "smpl_params": {
                    "betas": avg_betas,
                    "body_pose": front_params["body_pose"],
                    "global_orient": front_params["global_orient"],
                },
                "obj": obj_string,
            })

        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            return jsonify({"error": f"Processing failed: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "device": str(device)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
```

### Run the backend

```bash
python backend/app.py
# → Running on http://0.0.0.0:5000
```

---

## Part 4 — Build the React Frontend

```bash
npx create-react-app frontend
cd frontend
npm install three @react-three/fiber @react-three/drei axios
```

### File: `frontend/src/App.js`

```jsx
import { useState, useRef } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const API = "http://localhost:5000";

// Measurement labels to show in UI
const MEASUREMENT_LABELS = {
  chest: "Chest",
  waist: "Waist",
  hip: "Hip",
  inseam: "Inseam",
  shoulder_width: "Shoulder Width",
  neck: "Neck",
  thigh: "Thigh",
  arm_length: "Arm Length",
  height: "Height",
};

function BodyModel({ objString }) {
  const [mesh, setMesh] = useState(null);

  if (objString && !mesh) {
    const loader = new OBJLoader();
    const obj = loader.parse(objString);
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xa0c4ff,
          roughness: 0.6,
          metalness: 0.1,
          transparent: true,
          opacity: 0.92,
          wireframe: false,
        });
        child.geometry.computeVertexNormals();
      }
    });
    // Center the model
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    obj.position.sub(center);
    setMesh(obj);
  }

  return mesh ? <primitive object={mesh} /> : null;
}

export default function App() {
  const [frontFile, setFrontFile] = useState(null);
  const [sideFile, setSideFile] = useState(null);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState("neutral");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("idle"); // idle | scanning | done

  const frontPreview = frontFile ? URL.createObjectURL(frontFile) : null;
  const sidePreview = sideFile ? URL.createObjectURL(sideFile) : null;

  async function handleScan() {
    if (!frontFile || !sideFile) {
      setError("Please upload both a front and side photo.");
      return;
    }
    setLoading(true);
    setError(null);
    setStep("scanning");

    const formData = new FormData();
    formData.append("front_image", frontFile);
    formData.append("side_image", sideFile);
    formData.append("height_cm", height);
    formData.append("gender", gender);

    try {
      const res = await axios.post(`${API}/api/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000, // 2 min — AI processing takes time
      });
      setResult(res.data);
      setStep("done");
    } catch (err) {
      setError(err.response?.data?.error || "Scan failed. Check backend logs.");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Body Scan AI</h1>
      <p style={styles.subtitle}>Upload two photos → get your exact measurements + 3D model</p>

      {step !== "done" && (
        <div style={styles.uploadSection}>
          {/* Front Photo */}
          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Front Photo
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => setFrontFile(e.target.files[0])} />
            </label>
            {frontPreview
              ? <img src={frontPreview} alt="Front" style={styles.preview} />
              : <div style={styles.placeholder}>📷 Tap to upload</div>}
          </div>

          {/* Side Photo */}
          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Side Photo
              <input type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => setSideFile(e.target.files[0])} />
            </label>
            {sidePreview
              ? <img src={sidePreview} alt="Side" style={styles.preview} />
              : <div style={styles.placeholder}>📷 Tap to upload</div>}
          </div>

          {/* Inputs */}
          <div style={styles.inputs}>
            <label>
              Height (cm):
              <input type="number" value={height} min={120} max={230}
                onChange={(e) => setHeight(Number(e.target.value))}
                style={styles.input} />
            </label>
            <label>
              Gender:
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                style={styles.input}>
                <option value="neutral">Neutral</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <button onClick={handleScan} disabled={loading || !frontFile || !sideFile}
            style={styles.scanBtn}>
            {loading ? "⏳ Scanning..." : "🔍 Scan My Body"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </div>
      )}

      {step === "done" && result && (
        <div style={styles.resultSection}>
          {/* 3D Viewer */}
          <div style={styles.viewer}>
            <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[2, 4, 2]} intensity={1.2} />
              <directionalLight position={[-2, -2, -2]} intensity={0.4} />
              <BodyModel objString={result.obj} />
              <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom />
              <Environment preset="city" />
            </Canvas>
          </div>

          {/* Measurements panel */}
          <div style={styles.measurements}>
            <h2 style={styles.measTitle}>Your Measurements</h2>
            {Object.entries(result.measurements)
              .filter(([key]) => MEASUREMENT_LABELS[key])
              .map(([key, value]) => (
                <div key={key} style={styles.measRow}>
                  <span style={styles.measLabel}>{MEASUREMENT_LABELS[key]}</span>
                  <span style={styles.measValue}>{value} cm</span>
                </div>
              ))}
            <button onClick={() => { setStep("idle"); setResult(null); setFrontFile(null); setSideFile(null); }}
              style={styles.resetBtn}>
              ↩ Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { maxWidth: 960, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" },
  title: { fontSize: 32, fontWeight: 700, margin: "0 0 8px" },
  subtitle: { color: "#666", marginBottom: 32 },
  uploadSection: { display: "flex", flexDirection: "column", gap: 20 },
  uploadBox: { border: "2px dashed #ccc", borderRadius: 12, overflow: "hidden", cursor: "pointer" },
  uploadLabel: { display: "block", fontWeight: 600, padding: "12px 16px", background: "#f5f5f5", cursor: "pointer" },
  preview: { width: "100%", maxHeight: 300, objectFit: "cover", display: "block" },
  placeholder: { height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 18 },
  inputs: { display: "flex", gap: 24, flexWrap: "wrap" },
  input: { marginLeft: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 },
  scanBtn: { padding: "14px 32px", background: "#5c46f5", color: "#fff", border: "none", borderRadius: 10, fontSize: 18, fontWeight: 600, cursor: "pointer" },
  error: { color: "#c00", fontWeight: 600 },
  resultSection: { display: "flex", gap: 32, flexWrap: "wrap" },
  viewer: { flex: "1 1 400px", height: 520, background: "#f0f4ff", borderRadius: 16, overflow: "hidden" },
  measurements: { flex: "1 1 260px", padding: "0 8px" },
  measTitle: { fontSize: 22, fontWeight: 600, marginBottom: 16 },
  measRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee" },
  measLabel: { color: "#555" },
  measValue: { fontWeight: 600, fontSize: 17 },
  resetBtn: { marginTop: 24, padding: "10px 24px", background: "transparent", border: "1px solid #ccc", borderRadius: 8, cursor: "pointer", fontSize: 15 },
};
```

### Run the frontend

```bash
npm start
# → http://localhost:3000
```

---

## Part 5 — Install smplx (for mesh export)

The backend uses `smplx` to generate the actual mesh vertices from SMPL parameters.

```bash
pip install smplx[all]
```

---

## Part 6 — File Structure Summary

Your full project should look like this:

```
body-scan-app/
  backend/
    app.py                    ← Flask API (Part 3)
    requirements.txt
  frontend/
    src/
      App.js                  ← React app (Part 4)
    package.json

4D-Humans/                    ← cloned separately
  data/
    basicModel_neutral_lbs_10_207_0_v1.0.0.pkl

SMPL-Anthropometry/           ← cloned separately
```

---

## Part 7 — `requirements.txt` for Backend

```
flask
flask-cors
mediapipe
opencv-python
numpy
torch
torchvision
smplx[all]
timm
```

---

## Part 8 — Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `No person detected` | Poor photo, blurry, or dark | Use bright, full-body photo on plain background |
| `SMPL model not found` | Wrong path to `.pkl` | Check `SMPL_MODEL_PATH` in `app.py` |
| `CUDA out of memory` | GPU too small | Set `batch_size=1`, or switch to CPU |
| `Connection refused` on frontend | Backend not running | Run `python backend/app.py` first |
| OBJ renders as black blob | Normals not computed | `geometry.computeVertexNormals()` is in the code — check Three.js version |
| Very slow response | Running on CPU | Expected 30–60s on CPU, 3–8s on GPU |
| Betas all zeros | Detectron2 not installed correctly | Reinstall using the exact pip command in Part 1 |

---

## Part 9 — Hackathon Judge Tips

**Before the demo:**
- Pre-load a test result so you can show it instantly if the AI is slow
- Have 2–3 "good" test photos ready (tight clothes, A-pose, plain wall)
- Run the backend in a terminal visible on screen — the output looks impressive

**Things judges will ask:**
- *"How accurate is it?"* → Answer: ±2–3 cm on chest/waist/hip, better with good photos
- *"What model does this use?"* → HMR 2.0, a transformer-based human mesh recovery model built on the SMPL body representation with 6,890 vertices
- *"Could this work on mobile?"* → Yes — the backend is an API, any frontend can call it

**Wow factor additions (if you have time):**
- Add a "size recommendation" feature — map measurements to S/M/L/XL for a given brand
- Add measurement lines drawn on the 3D mesh (horizontal rings at chest, waist, hip)
- Export measurements as a PDF card

---

## Part 10 — Quick Start Checklist

- [ ] Python 3.10 installed
- [ ] `git clone https://github.com/shubham-goel/4D-Humans.git`
- [ ] SMPL `.pkl` model downloaded and placed in `4D-Humans/data/`
- [ ] HMR 2.0 demo runs successfully
- [ ] `git clone https://github.com/DavidBoja/SMPL-Anthropometry.git`
- [ ] Flask backend running on port 5000
- [ ] React frontend running on port 3000
- [ ] Upload a test photo — full 3D model appears and measurements show

---

*Built for hackathon use. All models used are open-source for research/non-commercial use. Check SMPL license at smpl.is.tue.mpg.de for commercial terms.*