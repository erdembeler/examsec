from app import create_app

app = create_app()

if __name__ == '__main__':
    # Debug modu açık, kodda değişiklik yapınca sunucu otomatik yenilenir
    app.run(debug=True, port=5000)