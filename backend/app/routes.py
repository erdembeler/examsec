# backend/app/routes.py

import os
import time
from flask import Blueprint, jsonify, request, send_from_directory
from app import get_db_connection
from .services import verify_student_face

main = Blueprint('main', __name__)

# --- YARDIMCI: Resim Klasörünü Kesin Olarak Bul ---
def get_upload_folder():
    # Bu dosyanın (routes.py) olduğu yerden 2 yukarı çık -> backend/assets
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, 'assets')
    if not os.path.exists(path):
        os.makedirs(path)
    return path

# --- 1. LOGIN ---
@main.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, role, password_hash FROM users WHERE username = %s", (data.get('username'),))
        user = cur.fetchone()
        
        if user and str(user[2]).strip() == str(data.get('password')).strip():
            return jsonify({"success": True, "role": user[1], "userId": data.get('username')}), 200
        return jsonify({"success": False, "message": "Hatalı şifre"}), 401
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: 
        if 'conn' in locals() and conn: conn.close()

# --- 2. GET EXAMS ---
@main.route('/api/exams', methods=['GET'])
def get_exams():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, room_code, date, code FROM exams ORDER BY date DESC")
        rows = cur.fetchall()
        return jsonify([{"id": r[0], "title": r[1], "room_code": r[2], "date": r[3], "code": r[4]} for r in rows]), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: 
        if 'conn' in locals() and conn: conn.close()

# --- 3. GET STUDENTS ---
@main.route('/api/exam/<int:exam_id>/students', methods=['GET'])
def get_exam_students(exam_id):
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
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: 
        if 'conn' in locals() and conn: conn.close()

# --- 4. CHECK-IN (FOTOĞRAF KAYDETME) ---
@main.route('/api/check-in', methods=['POST'])
def check_in():
    try:
        exam_id = request.form.get('exam_id')
        student_id_str = request.form.get('student_id')
        file = request.files.get('image')
        
        if not file: return jsonify({"success": False, "message": "Dosya yok!"}), 400
        
        # Klasör yolunu garantili fonksiyonla al
        upload_folder = get_upload_folder()
        filename = f"{exam_id}_{student_id_str}_{int(time.time())}.jpg"
        save_path = os.path.join(upload_folder, filename)
        
        # Dosyayı kaydet
        file.save(save_path)
        
        # Kontrol: Dosya gerçekten oluştu mu ve boyutu ne?
        file_size = os.path.getsize(save_path)
        print(f"📸 KAYDEDİLDİ: {save_path} (Boyut: {file_size} bytes)")
        
        if file_size < 100:
            print("⚠️ UYARI: Dosya çok küçük (boş olabilir)!")

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = %s", (student_id_str,))
        user_row = cur.fetchone()
        
        if user_row:
            cur.execute("UPDATE enrollments SET status = 'pending', photo_url = %s WHERE exam_id = %s AND student_id = %s", 
                        (filename, exam_id, user_row[0]))
            conn.commit()
            return jsonify({"success": True, "seat": "Onay Bekliyor"}), 200
        return jsonify({"success": False}), 404
    except Exception as e: 
        print(f"Hata: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally: 
        if 'conn' in locals() and conn: conn.close()

# --- 5. RESİM GÖSTERME (KRİTİK DÜZELTME) ---
@main.route('/api/images/<filename>')
def serve_image(filename):
    try:
        folder = get_upload_folder()
        print(f"👀 Resim İsteniyor: {filename} -> Klasör: {folder}")
        return send_from_directory(folder, filename)
    except FileNotFoundError:
        print(f"❌ Resim Bulunamadı: {filename}")
        return jsonify({"error": "File not found"}), 404

# --- 6. AI CHECK ---
@main.route('/api/run-face-check', methods=['POST'])
def run_face_check():
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
        for student in pending_students:
            s_db_id = student[0]
            s_username = student[1]
            live_photo = student[2]
            
            if live_photo:
                is_match, score, msg = verify_student_face(s_username, live_photo)
                new_status = 'present' if is_match else 'violation'
                note = f"AI Score: %{score}" if is_match else f"AI Mismatch (%{score})"
                cur.execute("UPDATE enrollments SET status = %s, violation_note = %s WHERE exam_id = %s AND student_id = %s", 
                            (new_status, note, exam_id, s_db_id))
                processed_count += 1
            
        conn.commit()
        return jsonify({"success": True, "processed": processed_count}), 200
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally: 
        if 'conn' in locals() and conn: conn.close()

# --- 7. VIOLATION ---
@main.route('/api/violation', methods=['POST'])
def add_violation():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = %s", (data.get('studentId'),))
        user = cur.fetchone()
        if user:
            cur.execute("UPDATE enrollments SET status='violation', violation_note=%s WHERE exam_id=%s AND student_id=%s", 
                        (data.get('note'), data.get('examId'), user[0]))
            conn.commit()
            return jsonify({"success": True}), 200
        return jsonify({"success": False}), 404
    except Exception as e: return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn: conn.close()