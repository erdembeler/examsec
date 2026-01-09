# backend/app/__init__.py
import os
import psycopg2
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def get_db_connection():
    # Veritabanı bağlantısı
    if os.environ.get('DATABASE_URL'):
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    else:
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST'),
            database=os.environ.get('DB_NAME'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            port=os.environ.get('DB_PORT')
        )
    return conn

def create_app():
    load_dotenv()
    app = Flask(__name__)
    CORS(app) # Frontend ile iletişim izni

    # --- EN KRİTİK KISIM: RESİM KLASÖRÜ ---
    # backend/app/ klasöründen iki yukarı çık -> backend/ -> assets/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_folder = os.path.join(base_dir, 'assets')
    
    # Klasör yoksa oluştur
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Flask'a bu yolu öğretiyoruz
    app.config['UPLOAD_FOLDER'] = upload_folder
    print(f"✅ SİSTEM HAZIR: Resimler buraya kaydedilecek -> {upload_folder}")
    # --------------------------------------

    from .routes import main
    app.register_blueprint(main)

    return app