# backend/run.py
import os
from app import create_app

# Gunicorn'un bulması gereken nesne tam olarak bu 'app' değişkenidir.
app = create_app()

if __name__ == '__main__':
    # Lokal testler için port ayarı
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)