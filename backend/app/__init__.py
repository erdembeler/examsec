from flask import Flask
from flask_cors import CORS
import os
import psycopg2
from dotenv import load_dotenv

def create_app():
    app = Flask(__name__)
    
    # React (localhost:3000) ile Backend (localhost:5000) konuşabilsin diye izin veriyoruz
    CORS(app) 
    
    # .env dosyasını yükle
    load_dotenv()

    # Route'ları (Adresleri) sisteme tanıtıyoruz
    from .routes import main
    app.register_blueprint(main)

    return app

# Basit bir veritabanı bağlantı fonksiyonu
def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ.get('DB_HOST'),
        database=os.environ.get('DB_NAME'),
        user=os.environ.get('DB_USER'),
        password=os.environ.get('DB_PASSWORD'),
        port=os.environ.get('DB_PORT')
    )
    return conn