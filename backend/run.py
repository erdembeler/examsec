import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Render'ın verdiği portu al, yoksa 5001 kullan
    port = int(os.environ.get("PORT", 5001))
    # Host 0.0.0.0 olmalı ki dışarıdan erişilebilsin
    app.run(host='0.0.0.0', port=port)