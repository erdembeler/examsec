import os
import time
import traceback
from flask import Blueprint, jsonify, request, current_app as app
from app import get_db_connection

main = Blueprint('main', __name__)

# --- 1. GİRİŞ YAP (LOGIN) ---
@main.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        conn = get_db_connection()
        cur = conn.cursor()
        
        # Kullanıcıyı bul
        cur.execute("SELECT id, role, password_hash, full_name FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        
        if user:
            db_role = user[1]
            db_pass = user[2]
            
            # Şifre kontrolü
            if str(db_pass).strip() == str(password).strip():
                return jsonify({
                    "success": True, 
                    "role": db_role, 
                    "userId": username,
                    "message": "Giriş başarılı"
                }), 200
            else:
                return jsonify({"success": False, "message": "Hatalı şifre"}), 401
        else:
            return jsonify({"success": False, "message": "Kullanıcı bulunamadı"}), 401
    
    except Exception as e:
        # HATA OLURSA TERMİNALE YAZ (Böylece sebebini görürüz)
        print("\n🚨 LOGIN HATASI:")
        print(f"Hata Mesajı: {str(e)}")
        traceback.print_exc()
        print("------------------------------------------------\n")
        return jsonify({"error": str(e)}), 500
        
    finally:
        # Bağlantıyı güvenli kapat
        if 'cur' in locals() and cur: cur.close()
        if 'conn' in locals() and conn: conn.close()

# --- 2. SINAVLARI LİSTELE ---
@main.route('/api/exams', methods=['GET'])
def get_exams():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, room_code, date, code FROM exams ORDER BY date DESC")
        rows = cur.fetchall()
        
        exams_list = []
        for row in rows:
            exams_list.append({
                "id": row[0],
                "title": row[1],
                "room_code": row[2],
                "date": row[3],
                "code": row[4]
            })
            
        return jsonify(exams_list), 200
    except Exception as e:
        print(f"EXAMS ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals() and cur: cur.close()
        if 'conn' in locals() and conn: conn.close()

# --- 3. SINAVIN ÖĞRENCİLERİNİ GETİR ---
@main.route('/api/exam/<int:exam_id>/students', methods=['GET'])
def get_exam_students(exam_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = """
            SELECT s.user_id, u.username, s.full_name, s.department, e.status
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
                "violation": None
            })

        return jsonify(students), 200
    except Exception as e:
        print(f"STUDENTS ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if 'cur' in locals() and cur: cur.close()
        if 'conn' in locals() and conn: conn.close()

# --- 4. CHECK-IN (FOTOĞRAF GÖNDERME) ---
@main.route('/api/check-in', methods=['POST'])
def check_in():
    try:
        exam_id = request.form.get('exam_id')
        student_id_str = request.form.get('student_id')
        
        if 'image' not in request.files:
            return jsonify({"success": False, "message": "No image uploaded"}), 400
            
        file = request.files['image']
        
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])

        filename = f"{exam_id}_{student_id_str}_{int(time.time())}.jpg"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("SELECT id FROM users WHERE username = %s", (student_id_str,))
        user_row = cur.fetchone()
        
        if not user_row:
             return jsonify({"success": False, "message": "Student not found"}), 404
             
        db_student_id = user_row[0]

        query = """
            UPDATE enrollments 
            SET status = 'pending' 
            WHERE exam_id = %s AND student_id = %s
        """
        cur.execute(query, (exam_id, db_student_id))
        conn.commit()
        
        return jsonify({
            "success": True, 
            "message": "Photo sent to proctor.",
            "seat": "Waiting for Approval"
        }), 200

    except Exception as e:
        print(f"Check-in Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        if 'cur' in locals() and cur: cur.close()
        if 'conn' in locals() and conn: conn.close()