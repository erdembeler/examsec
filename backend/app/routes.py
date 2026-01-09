from flask import Blueprint, jsonify, request
import os
from werkzeug.utils import secure_filename
from .services import verify_student_face
from . import get_db_connection

main = Blueprint('main', __name__)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# --- 1. SİSTEM DURUMU ---
@main.route('/api/status', methods=['GET'])
def server_status():
    return jsonify({"status": "online", "message": "Sistem aktif"}), 200

# --- 2. LOGIN (YENİ EKLENDİ) ---
@main.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        # Şifreyi basit kontrol ediyoruz (Hash mekanizması eklenebilir)
        cur.execute("SELECT id, role, password_hash FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        
        if user and user[2] == password:
             return jsonify({
                 "success": True, 
                 "role": user[1], 
                 "message": "Giriş başarılı"
             }), 200
        else:
            return jsonify({"success": False, "message": "Hatalı kullanıcı veya şifre"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# --- 3. EXAMS (YENİ EKLENDİ) ---
@main.route('/api/exams', methods=['GET'])
def get_exams():
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, title, room_code, exam_date FROM exams ORDER BY exam_date DESC")
        rows = cur.fetchall()
        exams = [{"id": r[0], "title": r[1], "room_code": r[2], "date": r[3]} for r in rows]
        return jsonify(exams), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# --- 4. CHECK-IN (NEON TESTİ İÇİN GÜNCELLENDİ) ---
@main.route('/api/check-in', methods=['POST'])
def check_in():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "Fotoğraf yüklenmedi"}), 400
    
    student_number = request.form.get('student_id')
    exam_id = request.form.get('exam_id')
    file = request.files['image']

    if not student_number or not exam_id:
        return jsonify({"success": False, "message": "Eksik bilgi"}), 400

    # Dosya ismini güvenli hale getir
    filename_original = secure_filename(file.filename)
    _, ext = os.path.splitext(filename_original)
    if not ext: ext = '.jpg'
        
    filename = f"live_exam{exam_id}_{student_number}{ext}"
    save_path = os.path.join(BASE_DIR, 'assets', 'live_captures', filename)
    web_image_path = f"/assets/live_captures/{filename}"

    file.save(save_path)

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # BURASI ÖNEMLİ: Neon bağlantısını kanıtlamak için İSMİ çekiyoruz
        cur.execute("SELECT id, full_name FROM students WHERE student_number = %s", (student_number,))
        student_row = cur.fetchone()
        
        if not student_row:
            return jsonify({"success": False, "message": "Öğrenci veritabanında bulunamadı"}), 404
        
        student_db_id = student_row[0]
        full_name = student_row[1] # Veritabanından gelen isim

        # Yüz Tanıma
        is_face_match, score, face_msg = verify_student_face(student_number, save_path)

        # Oturma Düzeni
        cur.execute("SELECT seat_code FROM seating_plans WHERE exam_id = %s AND student_id = %s", (exam_id, student_db_id))
        seat_row = cur.fetchone()
        
        has_valid_seat = (seat_row is not None)
        seat_code = seat_row[0] if has_valid_seat else "YOK"

        # Mantık
        success = False
        if score == 0.0:
            msg = f"Hata: {face_msg}"
        elif not is_face_match:
            msg = f"Giriş Başarısız: Yüz eşleşmedi ({full_name})" # İsim mesajda görünecek
        elif is_face_match and not has_valid_seat:
            msg = f"Kimlik Doğrulandı ({full_name}) ama bu sınava kaydı yok."
        else:
            success = True
            msg = f"Hoşgeldin {full_name}. Sıra No: {seat_code}"

        # Kayıt (Check-ins)
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

        # İhlal Kaydı (Violations)
        if not success and score > 0.0:
            reason = "Impersonation" if not is_face_match else "Unauthorized Seat"
            cur.execute("""
                INSERT INTO violations (exam_id, student_id, reason, notes, evidence_image_path)
                VALUES (%s, %s, %s, %s, %s)
            """, (exam_id, student_db_id, reason, f"Score: {score}", web_image_path))

        conn.commit()

        return jsonify({
            "success": success,
            "message": msg,
            "data": {
                "student_id": student_number,
                "full_name": full_name, # React için ismi dönüyoruz
                "seat_code": seat_code,
                "match_score": round(score, 2)
            }
        }), 200 if success else 401

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# --- 5. DASHBOARD ENDPOINTLERİ ---

@main.route('/api/dashboard/stats/<int:exam_id>', methods=['GET'])
def get_exam_stats(exam_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM seating_plans WHERE exam_id = %s", (exam_id,))
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM check_ins WHERE exam_id = %s", (exam_id,))
        present = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM violations WHERE exam_id = %s", (exam_id,))
        violations = cur.fetchone()[0]
        
        return jsonify({
            "exam_id": exam_id,
            "total_students": total,
            "present_count": present,
            "violation_count": violations,
            "attendance_rate": round((present/total*100), 1) if total > 0 else 0
        }), 200
    finally:
        cur.close()
        conn.close()

@main.route('/api/dashboard/violations/<int:exam_id>', methods=['GET'])
def get_exam_violations(exam_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT v.id, s.student_number, s.full_name, v.reason, v.evidence_image_path, v.created_at
            FROM violations v
            JOIN students s ON v.student_id = s.id
            WHERE v.exam_id = %s
            ORDER BY v.created_at DESC
        """, (exam_id,))
        
        data = []
        for r in cur.fetchall():
            data.append({
                "id": r[0], "student_number": r[1], "full_name": r[2],
                "reason": r[3], "evidence_image": r[4], "timestamp": r[5]
            })
        return jsonify(data), 200
    finally:
        cur.close()
        conn.close()

@main.route('/api/dashboard/live-feed/<int:exam_id>', methods=['GET'])
def get_live_feed(exam_id):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT s.full_name, c.checkin_time, c.ml_verification_status, c.seat_compliance_status
            FROM check_ins c
            JOIN students s ON c.student_id = s.id
            WHERE c.exam_id = %s
            ORDER BY c.checkin_time DESC LIMIT 10
        """, (exam_id,))
        
        data = []
        for r in cur.fetchall():
            status = "CLEAN"
            if not r[2]: status = "FACE_MISMATCH"
            elif not r[3]: status = "WRONG_SEAT"
            data.append({"full_name": r[0], "time": r[1], "status": status})
        return jsonify(data), 200
    finally:
        cur.close()
        conn.close()