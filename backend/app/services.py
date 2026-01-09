# backend/app/services.py

import face_recognition
import os
from . import get_db_connection # init.py'deki fonksiyonu kullanır

def verify_student_face(student_username, live_image_name):
    """
    student_username: Öğrenci No (Örn: 220706010)
    live_image_name: Sınav anında çekilen dosyanın adı (Örn: 1_2207...jpg)
    """
    # Resimlerin olduğu klasörü dinamik olarak bul
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_folder = os.path.join(base_dir, 'assets')

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. Veritabanından Referans Fotoğrafın yolunu/adını bul
        # Users tablosundan username ile user_id bulup students tablosuna gidiyoruz
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
            return False, 0.0, "Referans fotoğraf kaydı yok."

        # Veritabanında tam URL (http...) veya dosya yolu olabilir. Sadece dosya adını alıyoruz.
        ref_photo_name = os.path.basename(result[0]) 

        # 2. Dosya Yollarını Oluştur
        ref_path = os.path.join(upload_folder, ref_photo_name)
        live_path = os.path.join(upload_folder, os.path.basename(live_image_name))

        # Dosya var mı kontrolü
        if not os.path.exists(ref_path):
            return False, 0.0, f"Referans dosyası sunucuda yok: {ref_photo_name}"
        if not os.path.exists(live_path):
            return False, 0.0, "Canlı fotoğraf dosyası bulunamadı."

        print(f"🧠 AI Karşılaştırıyor: {ref_photo_name} vs {live_image_name}")

        # 3. Yüz Tanıma İşlemi
        # Referans Resmi
        ref_image = face_recognition.load_image_file(ref_path)
        ref_encodings = face_recognition.face_encodings(ref_image)
        if not ref_encodings:
            return False, 0.0, "Referans fotoğrafta yüz bulunamadı."
        ref_encoding = ref_encodings[0]

        # Canlı Resim
        live_image = face_recognition.load_image_file(live_path)
        live_encodings = face_recognition.face_encodings(live_image)
        if not live_encodings:
            return False, 0.0, "Canlı fotoğrafta yüz tespit edilemedi."
        live_encoding = live_encodings[0]

        # 4. Karşılaştırma (Compare)
        # Tolerance 0.6 standarttır. 
        match_results = face_recognition.compare_faces([ref_encoding], live_encoding, tolerance=0.6)
        face_distance = face_recognition.face_distance([ref_encoding], live_encoding)
        
        is_match = bool(match_results[0])
        # Benzerlik skoru (0 ile 100 arası)
        match_score = round((1 - face_distance[0]) * 100, 2)

        print(f"✅ Sonuç: {is_match} (Skor: {match_score})")
        return is_match, match_score, "Eşleşme Başarılı" if is_match else "Yüzler Eşleşmedi"

    except Exception as e:
        print(f"❌ AI Hatası: {e}")
        return False, 0.0, f"Hata: {str(e)}"
    finally:
        cur.close()
        conn.close()