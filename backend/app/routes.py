from flask import Blueprint, jsonify, request
import os
from .services import verify_student_face
from . import get_db_connection
from werkzeug.utils import secure_filename

main = Blueprint('main', __name__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

@main.route('/api/status', methods=['GET'])
def server_status():
    return jsonify({"status": "online", "message": "Sistem aktif"}), 200

@main.route('/api/check-in', methods=['POST'])
def check_in():
    # 1. TEMEL KONTROLLER
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "Fotoğraf yüklenmedi"}), 400
    
    student_number = request.form.get('student_id')
    exam_id = request.form.get('exam_id')
    file = request.files['image']

    if not student_number or not exam_id:
        return jsonify({"success": False, "message": "Eksik bilgi"}), 400

    # 2. DOSYA UZANTISINI ALGILA
    filename_original = secure_filename(file.filename)
    _, ext = os.path.splitext(filename_original)
    if not ext:
        ext = '.jpg'
        
    filename = f"live_exam{exam_id}_{student_number}{ext}"
    save_path = os.path.join(BASE_DIR, 'assets', 'live_captures', filename)
    web_image_path = f"/assets/live_captures/{filename}"

    file.save(save_path)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 3. ÖĞRENCİ ID BULMA
        cur.execute("SELECT id FROM students WHERE student_number = %s", (student_number,))
        student_row = cur.fetchone()
        
        if not student_row:
            return jsonify({"success": False, "message": "Öğrenci veritabanında bulunamadı"}), 404
        
        student_db_id = student_row[0]

        # 4. YÜZ TANIMA İŞLEMİ
        is_face_match, score, face_msg = verify_student_face(student_number, save_path)

        # 5. OTURMA DÜZENİ KONTROLÜ
        cur.execute("""
            SELECT seat_code FROM seating_plans 
            WHERE exam_id = %s AND student_id = %s
        """, (exam_id, student_db_id))
        seat_row = cur.fetchone()
        
        has_valid_seat = (seat_row is not None)
        seat_code = seat_row[0] if has_valid_seat else "YOK"

        # 6. MANTIK VE KARAR AĞACI (GÜNCELLENDİ)
        violation_reason = None
        final_message = ""
        check_in_success = False

        # Skor 0.0 ise teknik bir hata veya yüz bulunamama durumu vardır
        if score == 0.0:
            check_in_success = False
            final_message = f"Hata: {face_msg}" # Servisten gelen gerçek hatayı göster!
            # Bunu violation olarak kaydetmeyelim çünkü teknik bir sorun olabilir (karanlık foto vs.)
        
        elif not is_face_match:
            violation_reason = "Impersonation Risk (Face Mismatch)"
            final_message = f"Giriş Başarısız: Yüz eşleşmedi (%{round(score,1)})"
            check_in_success = False
        
        elif is_face_match and not has_valid_seat:
            violation_reason = "Unauthorized Seat (Not in List)"
            final_message = f"Kimlik Doğrulandı ama öğrenci bu sınava kayıtlı değil."
            check_in_success = False
            
        else:
            final_message = f"Giriş Onaylandı. Sıra No: {seat_code}"
            check_in_success = True

        # 7. VERİTABANI İŞLEMLERİ
        cur.execute("""
            INSERT INTO check_ins (exam_id, student_id, ml_verification_status, seat_compliance_status, live_photo_path)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (exam_id, student_id) 
            DO UPDATE SET 
                checkin_time = CURRENT_TIMESTAMP,
                ml_verification_status = EXCLUDED.ml_verification_status,
                seat_compliance_status = EXCLUDED.seat_compliance_status,
                live_photo_path = EXCLUDED.live_photo_path;
        """, (exam_id, student_db_id, is_face_match, has_valid_seat, web_image_path))

        if violation_reason:
            cur.execute("""
                INSERT INTO violations (exam_id, student_id, reason, notes, evidence_image_path)
                VALUES (%s, %s, %s, %s, %s)
            """, (exam_id, student_db_id, violation_reason, f"Score: {score}", web_image_path))

        conn.commit()

        # 8. SONUÇ
        response_data = {
            "success": check_in_success,
            "message": final_message,
            "data": {
                "student_id": student_number,
                "match_score": round(score, 2),
                "seat_code": seat_code,
                "violation_logged": (violation_reason is not None)
            }
        }
        return jsonify(response_data), (200 if check_in_success else 401)

    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": f"Sistem hatası: {str(e)}"}), 500
    finally:
        cur.close()
        conn.close()