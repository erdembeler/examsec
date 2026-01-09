import os
import psycopg2
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path

def get_db_connection():
    # 1. Cloud (Neon/Render) kontrolü
    db_url = os.environ.get('DATABASE_URL')
    
    if db_url:
        conn = psycopg2.connect(db_url)
    else:
        # 2. Yerel ayarlar (Fallback)
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST'),
            database=os.environ.get('DB_NAME'),
            user=os.environ.get('DB_USER'),
            password=os.environ.get('DB_PASSWORD'),
            port=os.environ.get('DB_PORT')
        )
    return conn

def create_app():
    app = Flask(__name__)
    CORS(app) 

    # --- KESİN ÇÖZÜM: .env DOSYASINI BUL ---
    # Bu dosyanın (init.py) olduğu yerden 2 klasör yukarı çıkıp .env'i buluyoruz.
    # backend/app/__init__.py  ->  backend/app/  ->  backend/  -> .env
    env_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path=env_path)
    
    # KONTROL: Terminale basar (Böylece okuyup okumadığını anlarız)
    print("------------------------------------------------")
    print(f"📡 .env Dosya Yolu: {env_path}")
    print(f"🔑 Veritabanı URL Okundu mu?: {'EVET' if os.environ.get('DATABASE_URL') else 'HAYIR'}")
    print("------------------------------------------------")

    # Resim klasörü ayarı
    upload_folder = os.path.join(os.getcwd(), 'assets')
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
    app.config['UPLOAD_FOLDER'] = upload_folder

    from .routes import main
    app.register_blueprint(main)

    return app