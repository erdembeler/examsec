from dotenv import load_dotenv
import random
from datetime import datetime, timedelta
from app import get_db_connection

load_dotenv()

# ============================================
# AYARLAR
# ============================================
NUM_SOFTWARE_STUDENTS = 6    # Yazılım (0706)
NUM_COMPUTER_STUDENTS = 6    # Bilgisayar (0704)
NUM_EXAMS = 10

FIRST_NAMES_MALE = ["Ahmet", "Mehmet", "Emre", "Burak", "Can", "Kerem"]
FIRST_NAMES_FEMALE = ["Ayşe", "Zeynep", "Elif", "Merve", "Selin", "İrem"]
LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Öztürk", "Aydın", "Arslan", "Koç", "Kurt", "Polat", "Aksoy"]

COURSES = [
    ("SENG 101", "Programlamaya Giriş"),
    ("SENG 201", "Veri Yapıları"),
    ("SENG 301", "Yazılım Mühendisliği"),
    ("SENG 341", "Web Programlama"),
    ("SENG 405", "Yazılım Test ve Doğrulama"),
    ("CENG 201", "Algoritmalar"),
    ("CENG 301", "İşletim Sistemleri"),
    ("CENG 321", "Veritabanı Sistemleri"),
    ("MATH 101", "Calculus I"),
    ("PHYS 101", "Fizik I"),
]

ROOMS = ["D-101", "D-102", "D-201", "A-101", "Lab-203", "Lab-204"]

def seed_database():
    print("🔌 Neon DB'ye bağlanılıyor...")
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # ============================================
        # 1. ESKİ VERİLERİ SİL (ŞEMAYA DOKUNMA!)
        # ============================================
        print("🧹 Eski veriler siliniyor...")
        cur.execute("DELETE FROM violations;")
        cur.execute("DELETE FROM check_ins;")
        cur.execute("DELETE FROM seating_plans;")
        cur.execute("DELETE FROM enrollments;")
        cur.execute("DELETE FROM exams;")
        cur.execute("DELETE FROM students;")
        cur.execute("DELETE FROM users;")
        
        # ============================================
        # 2. INSTRUCTOR (rol='admin') ve PROCTOR
        # ============================================
        print("👤 Instructor ve Proctor ekleniyor...")
        
        # Instructors (rol = 'admin')
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('instructor1', '123456', 'admin')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('instructor2', '123456', 'admin')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('instructor3', '123456', 'admin')")
        
        # Proctors
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('proctor1', '123456', 'proctor')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('proctor2', '123456', 'proctor')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('proctor3', '123456', 'proctor')")
        
        # ============================================
        # 3. ÖĞRENCİLER (12 kişi)
        # ============================================
        print("👨‍🎓 12 öğrenci ekleniyor...")
        
        all_students = []
        
        # Yazılım Mühendisliği (0706) - 6 öğrenci
        for i in range(NUM_SOFTWARE_STUDENTS):
            student_no = f"2207060{i+1:02d}"
            if i % 2 == 0:
                first = FIRST_NAMES_MALE[i % len(FIRST_NAMES_MALE)]
                gender = "men"
            else:
                first = FIRST_NAMES_FEMALE[i % len(FIRST_NAMES_FEMALE)]
                gender = "women"
            
            last = LAST_NAMES[i % len(LAST_NAMES)]
            full_name = f"{first} {last}"
            photo_url = f"https://randomuser.me/api/portraits/{gender}/{(i+1)*5}.jpg"
            
            cur.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (%s, '123456', 'student') RETURNING id",
                (student_no,)
            )
            user_id = cur.fetchone()[0]
            
            cur.execute(
                "INSERT INTO students (user_id, full_name, department, reference_photo) VALUES (%s, %s, %s, %s)",
                (user_id, full_name, '0706', photo_url)
            )
            all_students.append({'user_id': user_id, 'dept': '0706'})
        
        # Bilgisayar Mühendisliği (0704) - 6 öğrenci
        for i in range(NUM_COMPUTER_STUDENTS):
            student_no = f"2207040{i+1:02d}"
            if i % 2 == 0:
                first = FIRST_NAMES_MALE[(i+3) % len(FIRST_NAMES_MALE)]
                gender = "men"
            else:
                first = FIRST_NAMES_FEMALE[(i+3) % len(FIRST_NAMES_FEMALE)]
                gender = "women"
            
            last = LAST_NAMES[(i+6) % len(LAST_NAMES)]
            full_name = f"{first} {last}"
            photo_url = f"https://randomuser.me/api/portraits/{gender}/{(i+1)*7}.jpg"
            
            cur.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (%s, '123456', 'student') RETURNING id",
                (student_no,)
            )
            user_id = cur.fetchone()[0]
            
            cur.execute(
                "INSERT INTO students (user_id, full_name, department, reference_photo) VALUES (%s, %s, %s, %s)",
                (user_id, full_name, '0704', photo_url)
            )
            all_students.append({'user_id': user_id, 'dept': '0704'})
        
        # ============================================
        # 4. SINAVLAR
        # ============================================
        print(f"📝 {NUM_EXAMS} sınav ekleniyor...")
        
        today = datetime.now()
        exam_ids = []
        
        for i in range(NUM_EXAMS):
            code, title = COURSES[i % len(COURSES)]
            room = ROOMS[i % len(ROOMS)]
            
            days_offset = random.randint(-15, 15)
            exam_date = today + timedelta(days=days_offset)
            exam_datetime = exam_date.replace(hour=random.choice([9, 10, 13, 14]), minute=0, second=0, microsecond=0)
            
            is_active = days_offset >= 0
            
            if i % 3 == 0:
                dept_choice = '0706,0704'  # Ortak
            elif i % 3 == 1:
                dept_choice = '0706'       # Yazılım
            else:
                dept_choice = '0704'       # Bilgisayar
            
            cur.execute(
                """INSERT INTO exams (code, title, room_code, date, departments, is_active) 
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (code, f"{title} Final", room, exam_datetime, dept_choice, is_active)
            )
            exam_id = cur.fetchone()[0]
            exam_ids.append({'id': exam_id, 'departments': dept_choice, 'is_active': is_active})
        
        # ============================================
        # 5. ENROLLMENTS
        # ============================================
        print("🔗 Öğrenciler sınavlara kaydediliyor...")
        
        for exam in exam_ids:
            dept_list = exam['departments'].split(',')
            eligible = [s for s in all_students if s['dept'] in dept_list]
            
            for student in eligible:
                if not exam['is_active']:  # Geçmiş sınav
                    status = random.choices(['present', 'absent', 'violation'], weights=[0.70, 0.25, 0.05])[0]
                    violation_note = "AI Mismatch (%42)" if status == 'violation' else None
                else:  # Aktif sınav
                    status = 'absent'
                    violation_note = None
                
                cur.execute(
                    "INSERT INTO enrollments (exam_id, student_id, status, violation_note) VALUES (%s, %s, %s, %s)",
                    (exam['id'], student['user_id'], status, violation_note)
                )
        
        # ============================================
        # 6. SEATING PLANS (Bitmiş sınavlar için)
        # ============================================
        print("🪑 Oturma planları oluşturuluyor...")
        
        finished_exams = [e for e in exam_ids if not e['is_active']]
        
        for exam in finished_exams:
            cur.execute(
                "SELECT student_id FROM enrollments WHERE exam_id = %s AND status IN ('present', 'violation')",
                (exam['id'],)
            )
            attended = cur.fetchall()
            
            seat_codes = [f"{chr(65+r)}-{c+1}" for r in range(3) for c in range(4)]
            random.shuffle(seat_codes)
            
            for i, (student_id,) in enumerate(attended):
                if i >= len(seat_codes):
                    break
                cur.execute(
                    "INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (%s, %s, %s)",
                    (exam['id'], student_id, seat_codes[i])
                )
        
        # ============================================
        # 7. CHECK_INS (Bitmiş sınavlar için)
        # ============================================
        print("📸 Check-in kayıtları oluşturuluyor...")
        
        for exam in finished_exams:
            cur.execute(
                "SELECT student_id FROM enrollments WHERE exam_id = %s AND status = 'present'",
                (exam['id'],)
            )
            present_students = cur.fetchall()
            
            for (student_id,) in present_students:
                cur.execute(
                    """INSERT INTO check_ins (exam_id, student_id, ml_verification_status, seat_compliance_status) 
                       VALUES (%s, %s, %s, %s)""",
                    (exam['id'], student_id, True, True)
                )
        
        # ============================================
        # 8. VIOLATIONS (Bazı sınavlar için)
        # ============================================
        print("⚠️ Violation kayıtları oluşturuluyor...")
        
        for exam in finished_exams:
            cur.execute(
                "SELECT student_id FROM enrollments WHERE exam_id = %s AND status = 'violation'",
                (exam['id'],)
            )
            violation_students = cur.fetchall()
            
            for (student_id,) in violation_students:
                reason = random.choice(['Face Mismatch', 'Wrong Seat', 'Suspicious Activity'])
                cur.execute(
                    """INSERT INTO violations (exam_id, student_id, reason, notes) 
                       VALUES (%s, %s, %s, %s)""",
                    (exam['id'], student_id, reason, f"AI Score: %{random.randint(20, 45)}")
                )
        
        # ============================================
        # COMMIT
        # ============================================
        conn.commit()
        
        # ============================================
        # ÖZET
        # ============================================
        print("\n" + "=" * 50)
        print("🎉 VERİLER BAŞARIYLA EKLENDİ!")
        print("=" * 50)
        print(f"""
📊 ÖZET:
   👨‍🎓 Yazılım Öğrencisi (0706): {NUM_SOFTWARE_STUDENTS}
   👨‍🎓 Bilgisayar Öğrencisi (0704): {NUM_COMPUTER_STUDENTS}
   👨‍🏫 Instructor: 3
   👁️  Proctor: 3
   📝 Sınav: {NUM_EXAMS}

🔑 GİRİŞ BİLGİLERİ:
   ┌─────────────┬──────────────┬──────────┐
   │ Rol         │ Kullanıcı    │ Şifre    │
   ├─────────────┼──────────────┼──────────┤
   │ Instructor  │ instructor1  │ 123456   │
   │ Proctor     │ proctor1     │ 123456   │
   │ Student SW  │ 220706001    │ 123456   │
   │ Student CE  │ 220704001    │ 123456   │
   └─────────────┴──────────────┴──────────┘
        """)
        
    except Exception as e:
        print(f"❌ HATA: {e}")
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()
