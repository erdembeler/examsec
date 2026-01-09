import face_recognition
import os
from . import get_db_connection

# Dosya yollarını yönetmek için temel klasör
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

def verify_student_face(student_id, live_image_path):

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. Veritabanından öğrencinin kayıtlı fotoğraf yolunu al
        cur.execute("SELECT registered_photo_path FROM students WHERE student_number = %s", (student_id,))
        result = cur.fetchone()

        if not result:
            return False, 0.0, "Öğrenci bulunamadı."

        # Veritabanındaki yol: /assets/photos/220706011.jpg
        # Bunu gerçek dosya yoluna çevirmemiz lazım
        db_path = result[0]
        registered_img_full_path = os.path.join(BASE_DIR, db_path.lstrip('/'))

        # 2. Dosyalar var mı kontrol et
        if not os.path.exists(registered_img_full_path):
            return False, 0.0, f"Kayıtlı fotoğraf sunucuda bulunamadı: {db_path}"
        
        if not os.path.exists(live_image_path):
            return False, 0.0, "Canlı fotoğraf işlenemedi."

        # 3. Yüz Tanıma İşlemi (Face Recognition)
        # Kayıtlı fotoğrafı yükle ve encode et
        registered_image = face_recognition.load_image_file(registered_img_full_path)
        registered_encodings = face_recognition.face_encodings(registered_image)

        if not registered_encodings:
            return False, 0.0, "Kayıtlı fotoğrafta yüz bulunamadı."
        
        registered_encoding = registered_encodings[0]

        # Canlı fotoğrafı yükle ve encode et
        live_image = face_recognition.load_image_file(live_image_path)
        live_encodings = face_recognition.face_encodings(live_image)

        if not live_encodings:
            return False, 0.0, "Gönderilen fotoğrafta yüz tespit edilemedi."
        
        live_encoding = live_encodings[0]

        # 4. Karşılaştırma (Compare)
        # tolerance=0.6 standarttır. Daha düşük değer daha katı güvenlik demektir.
        results = face_recognition.compare_faces([registered_encoding], live_encoding, tolerance=0.6)
        face_distance = face_recognition.face_distance([registered_encoding], live_encoding)
        
        # Distance ne kadar düşükse benzerlik o kadar yüksektir.
        # Skoru 0-100 arasına çevirelim (Ters orantı)
        match_score = (1 - face_distance[0]) * 100 
        is_match = bool(results[0])

        return is_match, match_score, "Eşleşme başarılı" if is_match else "Yüzler eşleşmedi"

    except Exception as e:
        print(f"HATA: {e}")
        return False, 0.0, f"Sistem hatası: {str(e)}"
    finally:
        cur.close()
        conn.close()