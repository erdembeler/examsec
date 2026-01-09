from dotenv import load_dotenv
import os
import random
from app import get_db_connection

load_dotenv()

def seed_database():
    print("🔌 Veritabanına bağlanılıyor...")
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. TEMİZLİK
        print("🧹 Eski tablolar temizleniyor...")
        cur.execute("DROP TABLE IF EXISTS enrollments CASCADE;")
        cur.execute("DROP TABLE IF EXISTS exams CASCADE;")
        cur.execute("DROP TABLE IF EXISTS students CASCADE;")
        cur.execute("DROP TABLE IF EXISTS users CASCADE;")

        # 2. TABLOLARI OLUŞTUR
        print("🛠 Yeni tablolar oluşturuluyor...")
        
        cur.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL
            );
        """)

        # YENİ: reference_photo sütunu eklendi
        cur.execute("""
            CREATE TABLE students (
                user_id INTEGER PRIMARY KEY REFERENCES users(id),
                full_name VARCHAR(100) NOT NULL,
                department VARCHAR(50) NOT NULL,
                reference_photo VARCHAR(255) 
            );
        """)

        cur.execute("""
            CREATE TABLE exams (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20),
                title VARCHAR(100),
                room_code VARCHAR(50),
                date TIMESTAMP
            );
        """)

        # YENİ: violation_note sütunu eklendi
        cur.execute("""
            CREATE TABLE enrollments (
                exam_id INTEGER REFERENCES exams(id),
                student_id INTEGER REFERENCES students(user_id),
                status VARCHAR(20) DEFAULT 'pending',
                photo_url VARCHAR(255),
                violation_note TEXT,
                PRIMARY KEY (exam_id, student_id)
            );
        """)

        # 3. VERİLERİ EKLE
        print("👤 Kullanıcılar ekleniyor...")
        
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('admin_erdem', 'pass123', 'admin')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('proctor_ali', 'pass123', 'proctor')")

        # Öğrenciler (Referans fotoları ile)
        # Demo için randomuser.me kullanıyoruz
        student_data = [
            ('220706010', '123', 'Emre Olca', '0706', 'https://randomuser.me/api/portraits/men/32.jpg'),
            ('220706011', '123', 'Ayşe Demir', '0706', 'https://randomuser.me/api/portraits/women/44.jpg'),
            ('220704001', '123', 'Barış Öz', '0704', 'https://randomuser.me/api/portraits/men/85.jpg')
        ]

        for s in student_data:
            cur.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'student') RETURNING id", (s[0], s[1]))
            user_id = cur.fetchone()[0]
            # Referans fotoyu ekliyoruz
            cur.execute("INSERT INTO students (user_id, full_name, department, reference_photo) VALUES (%s, %s, %s, %s)", (user_id, s[2], s[3], s[4]))

        # Sınavlar
        cur.execute("INSERT INTO exams (code, title, room_code, date) VALUES ('SENG 405', 'Yazılım Test ve Doğrulama', 'Lab-203', NOW()) RETURNING id")
        exam_id = cur.fetchone()[0]

        # Kayıtlar
        print("🔗 Öğrenciler derse atanıyor...")
        cur.execute("SELECT user_id FROM students")
        students = cur.fetchall()
        for s in students:
            cur.execute("INSERT INTO enrollments (exam_id, student_id) VALUES (%s, %s)", (exam_id, s[0]))

        conn.commit()
        print("✅ Veritabanı başarıyla güncellendi!")

    except Exception as e:
        print(f"❌ HATA: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()