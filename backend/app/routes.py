# backend/app/routes.py

import os
import gc
import time
from flask import Blueprint, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
from app import get_db_connection
from .services import verify_student_face

main = Blueprint('main', __name__)

# Yardımcı fonksiyon
def get_upload_folder():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, 'assets')
    if not os.path.exists(path):
        os.makedirs(path)
    return path

# İzin verilen dosya tipleri
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- 1. LOGIN ---
# --- 1. LOGIN ---
@main.route('/api/login', methods=['POST'])
def login():
    conn = None
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id, role, password_hash FROM users WHERE username = %s", (data.get('username'),))
        user = cur.fetchone()
        
        if user and str(user[2]).strip() == str(data.get('password')).strip():
            response_data = {
                "success": True, 
                "role": user[1], 
                "userId": data.get('username')
            }
            
            # ✅ YENİ: Öğrenci ise ek bilgileri getir
            if user[1] == 'student':
                cur.execute("SELECT full_name, reference_photo FROM students WHERE user_id = %s", (user[0],))
                student_info = cur.fetchone()
                if student_info:
                    response_data["fullName"] = student_info[0]
                    response_data["referencePhoto"] = student_info[1]
            
            return jsonify(response_data), 200
            
        return jsonify({"success": False, "message": "Hatalı şifre"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()
        gc.collect()


# --- 2. GET EXAMS ---
@main.route('/api/exams', methods=['GET'])
def get_exams():
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, room_code, date, code FROM exams ORDER BY date DESC")
        rows = cur.fetchall()
        return jsonify([{"id": r[0], "title": r[1], "room_code": r[2], "date": r[3], "code": r[4]} for r in rows]), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    finally: 
        if conn: 
            conn.close()
        gc.collect()

# --- 3. GET STUDENTS ---
@main.route('/api/exam/<int:exam_id>/students', methods=['GET'])
def get_exam_students(exam_id):
    conn = None
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        query = """
            SELECT s.user_id, u.username, s.full_name, s.department, e.status, e.photo_url, s.reference_photo, e.violation_note
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN enrollments e ON s.user_id = e.student_id
            WHERE e.exam_id = %s
            ORDER BY s.full_name ASC;
        """
        cur.execute(query, (exam_id,))
        rows = cur.fetchall()
        
        students = []
        for row in rows:
            students.append({
                "id": str(row[1]),
                "name": row[2],
                "dept": row[3],
                "status": row[4],
                "photo_url": row[5],
                "reference_photo": row[6],
                "violation_note": row[7]
            })
        return jsonify(students), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    finally: 
        if conn: 
            conn.close()
        gc.collect()

# --- 4. CHECK-IN (FOTOĞRAF KAYDETME) ---
@main.route('/api/check-in', methods=['POST'])
def check_in():
    conn = None
    try:
        exam_id = request.form.get('exam_id')
        student_id_str = request.form.get('student_id')
        file = request.files.get('image')
        
        if not file: 
            return jsonify({"success": False, "message": "Dosya yok!"}), 400
        
        if not allowed_file(file.filename):
            return jsonify({"success": False, "message": "Geçersiz dosya tipi!"}), 400
        
        upload_folder = get_upload_folder()
        filename = secure_filename(f"{exam_id}_{student_id_str}_{int(time.time())}.jpg")
        save_path = os.path.join(upload_folder, filename)
        
        # Dosyayı kaydet
        file.save(save_path)
        
        # Boyut kontrolü
        file_size = os.path.getsize(save_path)
        print(f"📸 KAYDEDİLDİ: {save_path} (Boyut: {file_size} bytes)")
        
        if file_size < 100:
            print("⚠️ UYARI: Dosya çok küçük!")
            os.remove(save_path)
            return jsonify({"success": False, "message": "Dosya bozuk!"}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = %s", (student_id_str,))
        user_row = cur.fetchone()
        
        if user_row:
            cur.execute(
                "UPDATE enrollments SET status = 'pending', photo_url = %s WHERE exam_id = %s AND student_id = %s", 
                (filename, exam_id, user_row[0])
            )
            conn.commit()
            return jsonify({"success": True, "seat": "Onay Bekliyor"}), 200
        
        return jsonify({"success": False, "message": "Öğrenci bulunamadı"}), 404
    except Exception as e: 
        print(f"Hata: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()
        gc.collect()

# --- 5. RESİM GÖSTERME ---
@main.route('/api/images/<filename>')
def serve_image(filename):
    try:
        folder = get_upload_folder()
        return send_from_directory(folder, filename)
    except FileNotFoundError:
        print(f"❌ Resim Bulunamadı: {filename}")
        return jsonify({"error": "Dosya bulunamadı"}), 404

# --- 6. AI CHECK (BATCH İŞLEME) ---
@main.route('/api/run-face-check', methods=['POST'])
def run_face_check():
    conn = None
    try:
        data = request.get_json()
        exam_id = data.get('examId')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT s.user_id, u.username, e.photo_url 
            FROM enrollments e
            JOIN students s ON e.student_id = s.user_id
            JOIN users u ON s.user_id = u.id
            WHERE e.exam_id = %s AND e.status = 'pending'
        """
        cur.execute(query, (exam_id,))
        pending_students = cur.fetchall()
        
        processed_count = 0
        
        # Her öğrenciyi tek tek işle (RAM tasarrufu)
        for student in pending_students:
            s_db_id = student[0]
            s_username = student[1]
            live_photo = student[2]
            
            if live_photo:
                # AI kontrolü yap
                is_match, score, msg = verify_student_face(s_username, live_photo)
                
                new_status = 'present' if is_match else 'violation'
                note = f"AI Score: %{score}" if is_match else f"AI Mismatch (%{score})"
                
                cur.execute(
                    "UPDATE enrollments SET status = %s, violation_note = %s WHERE exam_id = %s AND student_id = %s", 
                    (new_status, note, exam_id, s_db_id)
                )
                processed_count += 1
                
                # Her öğrenci sonrası memory temizle
                gc.collect()
            
        conn.commit()
        return jsonify({"success": True, "processed": processed_count}), 200
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    finally: 
        if conn: 
            conn.close()
        gc.collect()
        

# --- 7. VIOLATION ---
@main.route('/api/violation', methods=['POST'])
def add_violation():
    conn = None
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = %s", (data.get('studentId'),))
        user = cur.fetchone()
        
        if user:
            cur.execute(
                "UPDATE enrollments SET status='violation', violation_note=%s WHERE exam_id=%s AND student_id=%s", 
                (data.get('note'), data.get('examId'), user[0])
            )
            conn.commit()
            return jsonify({"success": True}), 200
        
        return jsonify({"success": False, "message": "Öğrenci bulunamadı"}), 404
    except Exception as e: 
        return jsonify({"error": str(e)}), 500
    finally:
        if conn: 
            conn.close()
        gc.collect()