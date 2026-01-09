# backend/app/__init__.py
import os
import gc
import psycopg2
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def get_db_connection():
    """Veritabanı bağlantısı"""
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
    
    # Garbage collector optimizasyonu
    gc.set_threshold(700, 10, 10)
    
    app = Flask(__name__)
    CORS(app)
    
    # Flask config - Memory optimizasyonları
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max upload
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 300  # Cache 5 dakika
    
    # Resim klasörü
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_folder = os.path.join(base_dir, 'assets')
    
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    app.config['UPLOAD_FOLDER'] = upload_folder
    print(f"✅ SİSTEM HAZIR: Resimler buraya kaydedilecek -> {upload_folder}")
    
    # Her request sonrası memory temizliği
    @app.after_request
    def cleanup_memory(response):
        gc.collect()
        return response
    
    # Routes'u kaydet
    from .routes import main
    app.register_blueprint(main)

    return app