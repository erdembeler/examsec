FROM python:3.10-slim

# Çalışma dizini
WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libopenblas-dev \
    liblapack-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Pip güncelle
RUN pip install --upgrade pip setuptools wheel

# dlib-bin ve face-recognition kurulumu
RUN pip install dlib-bin
RUN pip install face-recognition-models
RUN pip install face-recognition

# Proje dosyalarını kopyala
COPY . .

# Diğer gereksinimler (Requirements içinde face-recognition OLMAMALI)
RUN pip install --no-cache-dir -r requirements.txt

# Port ve Başlatma
ENV PORT=5000
CMD gunicorn --bind 0.0.0.0:$PORT run:app