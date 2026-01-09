# Python 3.10 slim
FROM python:3.10-slim

WORKDIR /app

# Sistem kütüphaneleri
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

# pip güncelle
RUN pip install --upgrade pip

# ÖNCE requirements.txt (face_recognition olmadan)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# KRİTİK: Pre-compiled dlib wheel'ini direkt indir
RUN wget https://github.com/sachadee/dlib/releases/download/v19.24.99/dlib-19.24.99-cp310-cp310-linux_x86_64.whl \
    && pip install --no-cache-dir dlib-19.24.99-cp310-cp310-linux_x86_64.whl \
    && rm dlib-19.24.99-cp310-cp310-linux_x86_64.whl

# face_recognition bağımlılıkları
RUN pip install --no-cache-dir face_recognition_models==0.3.0

# face_recognition'ı no-deps ile kur
RUN pip install --no-cache-dir --no-deps face_recognition==1.3.0

# Proje dosyaları
COPY . .

EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "2", "--timeout", "180", "--max-requests", "50", "--worker-tmp-dir", "/dev/shm", "run:app"]