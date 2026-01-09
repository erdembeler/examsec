# Python 3.10 slim
FROM python:3.10-slim

# Çalışma klasörü
WORKDIR /app

# Gerekli sistem kütüphaneleri (OpenCV ve dlib için)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Önce dosyaları kopyala
COPY . .

# pip güncelle
RUN pip install --upgrade pip

# 1. dlib-bin kur (Hazır derlenmiş - RAM tüketmez, derleme yapmaz)
RUN pip install dlib-bin

# 2. face_recognition'ı dlib bağımlılığı olmadan kur
RUN pip install --no-deps face_recognition

# 3. face_recognition'ın diğer bağımlılıklarını kur
RUN pip install numpy==1.26.4 Pillow click face_recognition_models

# 4. Diğer proje gereksinimlerini kur
RUN pip install --no-cache-dir -r requirements.txt

# Render'ın atayacağı PORT üzerinden çalıştırıyoruz
# run:app -> run.py dosyasındaki app nesnesini çalıştırır
CMD gunicorn --bind 0.0.0.0:$PORT run:app