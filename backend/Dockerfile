FROM python:3.10-slim

WORKDIR /app

# Minimal sistem bağımlılıkları
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libopenblas-dev \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Pip güncelle
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Önce requirements.txt (face-recognition HARİÇ)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Face-recognition'ı ayrı kur (cache sorunu olmasın)
RUN pip install --no-cache-dir dlib-bin face-recognition-models face-recognition

# Proje dosyalarını kopyala
COPY . .

# Çevre değişkenleri
ENV PORT=5000
ENV WEB_CONCURRENCY=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Gunicorn başlatma (RAM optimizasyonlu)
CMD gunicorn --bind 0.0.0.0:$PORT \
    --workers=1 \
    --threads=2 \
    --timeout=180 \
    --max-requests=50 \
    --max-requests-jitter=10 \
    --worker-tmp-dir=/dev/shm \
    --preload \
    run:app