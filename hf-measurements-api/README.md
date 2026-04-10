---
title: Youngin Measurements API
emoji: 📏
colorFrom: pink
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Youngin Measurements API

A fast, production-ready body measurement estimation API for the Youngin platform.

## Endpoint

### `POST /api/scan`

Upload front and side photos to get accurate body measurements.

**Form Data:**
- `front_image` (file) — front-facing full-body photo
- `side_image` (file) — side-facing full-body photo  
- `height_cm` (float) — user's real height in cm (e.g. `175.5`)
- `gender` (string) — `male`, `female`, or `neutral`

**Response:**
```json
{
  "success": true,
  "measurements": {
    "height": 175.0,
    "chest": 92.3,
    "waist": 76.1,
    "hip": 92.8,
    "shoulder_width": 43.1,
    "neck": 38.2,
    "thigh": 56.0,
    "knee": 37.1,
    "calf": 35.0,
    "ankle": 21.5,
    "inseam": 80.9
  }
}
```

### `GET /health`
Returns `{"status": "ok"}` when the API is ready.
