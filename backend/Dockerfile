FROM python:3.10-slim

WORKDIR /app

# Minimal sistem kütüphaneleri
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libjpeg-dev \
    zlib1g-dev \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ÖNEMLİ: Pre-compiled dlib wheel'i ÖNCE kur
RUN wget https://github.com/sachadee/dlib/releases/download/v19.24.99/dlib-19.24.99-cp310-cp310-linux_x86_64.whl \
    && pip install --no-cache-dir dlib-19.24.99-cp310-cp310-linux_x86_64.whl \
    && rm dlib-19.24.99-cp310-cp310-linux_x86_64.whl

# face_recognition_models'ı kur
RUN pip install --no-cache-dir face_recognition_models==0.3.0

# face_recognition'ı --no-deps ile kur (dlib'i tekrar indirmesin!)
RUN pip install --no-cache-dir --no-deps face_recognition==1.3.0

COPY . .

EXPOSE 5000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "1", "--timeout", "180", "--max-requests", "20", "--worker-tmp-dir", "/dev/shm", "--preload", "run:app"]
