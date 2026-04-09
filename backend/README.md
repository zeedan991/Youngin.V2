# YOUNGIN Body Scan Backend

## Setup (one-time)

```bash
# 1. Create virtualenv
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate

# 2. Install Python deps
pip install -r requirements.txt

# 3. Install PyTorch (GPU version recommended)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
# CPU only:
# pip install torch torchvision

# 4. Clone and install HMR 2.0
git clone https://github.com/shubham-goel/4D-Humans.git
cd 4D-Humans
pip install -e ".[all]"
pip install detectron2 --extra-index-url https://dl.fbaipublicfiles.com/detectron2/wheels/cu118/torch2.0/index.html
cd ..

# 5. Clone SMPL-Anthropometry
git clone https://github.com/DavidBoja/SMPL-Anthropometry.git
cd SMPL-Anthropometry
pip install -r requirements.txt
cd ..

# 6. Download SMPL model (manual step — requires free registration)
#    Go to https://smpl.is.tue.mpg.de/
#    Download "SMPL for Python" → basicModel_neutral_lbs_10_207_0_v1.0.0.pkl
#    Place it at: 4D-Humans/data/basicModel_neutral_lbs_10_207_0_v1.0.0.pkl
```

## Run

```bash
python app.py
# → http://localhost:5001
```

## Environment variables (optional overrides)

| Variable     | Default                                             |
|--------------|-----------------------------------------------------|
| HMR2_PATH    | `./4D-Humans`                                       |
| ANTHRO_PATH  | `./SMPL-Anthropometry`                              |
| SMPL_PKL     | `./4D-Humans/data/basicModel_neutral_...v1.0.0.pkl` |

## Health check

```
GET http://localhost:5001/health
```

## Scan endpoint

```
POST http://localhost:5001/api/scan
Content-Type: multipart/form-data

front_image  (file)
side_image   (file)
height_cm    (number)
gender       neutral | male | female
```
