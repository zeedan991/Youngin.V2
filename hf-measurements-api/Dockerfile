# ─────────────────────────────────────────────────────────────────
# Youngin Measurements API — Hugging Face Spaces Dockerfile
# SDK: docker | Port: 7860
# ─────────────────────────────────────────────────────────────────

# Use the official Python slim image (no CUDA needed — MediaPipe runs on CPU)
# MediaPipe's pose model is fast enough on CPU alone for this use case.
FROM python:3.11-slim

# Install system dependencies needed by OpenCV headless
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (HF Spaces requirement)
RUN useradd -m -u 1000 user
USER user

# Set working directory
WORKDIR /app

# Add local bin to PATH (for uvicorn etc.)
ENV PATH="/home/user/.local/bin:$PATH"

# Copy and install Python dependencies first (layer cache)
COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY --chown=user app.py app.py

# Expose the port HF Spaces expects
EXPOSE 7860

# Health check so HF knows the container is ready
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7860/health')"

# Start the API
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860", "--workers", "2"]
