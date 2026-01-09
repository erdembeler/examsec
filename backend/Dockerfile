# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Sistem kütüphanelerini en baştan sağlam kuralım
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    libopenblas-dev \
    liblapack-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Dosyaları kopyala
COPY . .

# pip güncelle
RUN pip install --upgrade pip setuptools wheel

# --- KRİTİK SIRALAMA ---
# 1. dlib-bin (Hazır derlenmiş)
RUN pip install dlib-bin

# 2. face_recognition_models (Bu olmazsa face_recognition çalışmaz)
RUN pip install face_recognition_models

# 3. face_recognition (Bağımlılıkları kontrol ederek kur)
RUN pip install face-recognition

# 4. Geri kalan her şeyi kur (requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Render Port Ayarı
CMD gunicorn --bind 0.0.0.0:$PORT run:app