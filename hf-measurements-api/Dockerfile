# ─────────────────────────────────────────────────────────────────
#  Youngin Measurements API v3 — Hugging Face Spaces Dockerfile
#  SDK: docker | Port: 7860
#  Stack: MediaPipe Pose + MiDaS Depth + Elliptical Body Model
# ─────────────────────────────────────────────────────────────────

FROM python:3.11-slim

# System libs for OpenCV + GL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user
USER user
WORKDIR /app
ENV PATH="/home/user/.local/bin:$PATH"

# Pre-download MiDaS model into cache during build (avoids cold-start delay)
# We do this as the user so the cache goes into /home/user/.cache
ENV TORCH_HOME=/home/user/.cache/torch

# Install Python deps
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Pre-warm the MiDaS model (downloads weights during build)
RUN python -c "\
import torch; \
print('Downloading MiDaS weights...'); \
m = torch.hub.load('intel-isl/MiDaS', 'MiDaS_small', trust_repo=True); \
print('MiDaS cached ✓')"

# Copy app code
COPY --chown=user app.py app.py

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
    CMD curl -sf http://localhost:7860/health || exit 1

# 2 workers: handles concurrent front + side requests without blocking
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "2"]
