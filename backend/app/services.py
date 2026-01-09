import face_recognition
import os
import requests
from . import get_db_connection

def verify_student_face(student_username, live_image_name):
    """
    student_username: Öğrenci Numarası (Örn: 220706010)
    live_image_name: Sınav anında çekilen dosyanın adı
    """
    # 1. Dosya Yollarını Dinamik Olarak Bul
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_folder = os.path.join(base_dir, 'assets')
    
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 2. Veritabanından Referans Fotoğraf Bilgisini Çek
        # Users tablosundan username ile gidip Students tablosundan reference_photo'yu alıyoruz
        query = """
            SELECT s.reference_photo 
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.username = %s
        """
        cur.execute(query, (student_username,))
        result = cur.fetchone()

        if not result or not result[0]:
            print(f"❌ {student_username} için referans fotoğraf veritabanında yok.")
            return False, 0.0, "Referans kaydı bulunamadı."

        ref_photo_db_value = result[0] # Veritabanındaki değer (URL veya dosya adı)
        
        # Dosya adını ayıkla (http://.../resim.jpg olsa bile sadece resim.jpg kısmını alır)
        ref_photo_filename = os.path.basename(ref_photo_db_value)
        
        # Yollar:
        ref_path = os.path.join(assets_folder, ref_photo_filename)
        live_path = os.path.join(assets_folder, os.path.basename(live_image_name))

        # 3. Referans Dosya Kontrolü (Yoksa İndirmeyi Dene)
        if not os.path.exists(ref_path):
            # Eğer dosya yoksa ve veritabanındaki bir URL ise, indirmeyi deneyelim (RandomUser linkleri için)
            if ref_photo_db_value.startswith('http'):
                print(f"⬇️ Dosya indiriliyor: {ref_photo_db_value}")
                try:
                    img_data = requests.get(ref_photo_db_value).content
                    with open(ref_path, 'wb') as handler:
                        handler.write(img_data)
                except:
                    return False, 0.0, "Referans fotoğraf indirilemedi."
            else:
                return False, 0.0, f"Referans dosyası sunucuda yok: {ref_photo_filename}"

        if not os.path.exists(live_path):
            return False, 0.0, "Canlı fotoğraf dosyası bulunamadı."

        print(f"🧠 AI Karşılaştırıyor: {ref_photo_filename} vs {live_image_name}")

        # 4. Yüz Tanıma (Face Recognition)
        
        # Referans Resim
        ref_image = face_recognition.load_image_file(ref_path)
        ref_encodings = face_recognition.face_encodings(ref_image)
        if not ref_encodings:
            return False, 0.0, "Referans fotoda yüz bulunamadı."
        ref_encoding = ref_encodings[0]

        # Canlı Resim
        live_image = face_recognition.load_image_file(live_path)
        live_encodings = face_recognition.face_encodings(live_image)
        if not live_encodings:
            return False, 0.0, "Canlı fotoda yüz tespit edilemedi."
        live_encoding = live_encodings[0]

        # 5. Eşleştirme Hesapla
        # tolerance: 0.6 (Standart). Daha düşük = Daha katı.
        match_results = face_recognition.compare_faces([ref_encoding], live_encoding, tolerance=0.6)
        face_distance = face_recognition.face_distance([ref_encoding], live_encoding)
        
        is_match = bool(match_results[0])
        # Benzerlik skoru (0 ile 100 arası)
        match_score = round((1 - face_distance[0]) * 100, 2)

        print(f"✅ Sonuç: {is_match} (Skor: {match_score})")
        return is_match, match_score, "Eşleşme Başarılı" if is_match else "Yüzler Eşleşmedi"

    except Exception as e:
        print(f"❌ AI Hatası: {e}")
        # Hata durumunda 0.0 dönmesi normaldir, ama artık hata sebebini terminalde göreceksin.
        return False, 0.0, f"Sistem hatası: {str(e)}"
    finally:
        if 'cur' in locals() and cur: cur.close()
        if 'conn' in locals() and conn: conn.close()