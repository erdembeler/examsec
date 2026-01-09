# backend/seed_users.py

from dotenv import load_dotenv
load_dotenv()

import os
from app import get_db_connection

def seed_database():
    print("🔌 Veritabanına bağlanılıyor...")
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        # 1. TEMİZLİK (Her şeyi sil)
        print("🧹 Eski tablolar temizleniyor...")
        cur.execute("DROP TABLE IF EXISTS enrollments CASCADE;")
        cur.execute("DROP TABLE IF EXISTS exams CASCADE;")
        cur.execute("DROP TABLE IF EXISTS students CASCADE;")
        cur.execute("DROP TABLE IF EXISTS users CASCADE;")

        # 2. TABLOLARI OLUŞTUR
        print("🛠 Yeni tablolar oluşturuluyor...")
        
        # A. Kullanıcılar (Giriş Bilgileri)
        cur.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(100) NOT NULL,
                role VARCHAR(20) NOT NULL
            );
        """)

        # B. Öğrenciler (Detaylar - User ID ile bağlı)
        cur.execute("""
            CREATE TABLE students (
                user_id INTEGER PRIMARY KEY REFERENCES users(id),
                full_name VARCHAR(100) NOT NULL,
                department VARCHAR(50) NOT NULL -- '0706' veya '0704'
            );
        """)

        # C. Sınavlar
        cur.execute("""
            CREATE TABLE exams (
                id SERIAL PRIMARY KEY,
                code VARCHAR(20),
                title VARCHAR(100),
                room_code VARCHAR(50),
                date TIMESTAMP
            );
        """)

        # D. Kayıtlar (Hangi öğrenci hangi sınava giriyor?)
        cur.execute("""
            CREATE TABLE enrollments (
                exam_id INTEGER REFERENCES exams(id),
                student_id INTEGER REFERENCES students(user_id),
                status VARCHAR(20) DEFAULT 'pending', -- pending, present, absent
                PRIMARY KEY (exam_id, student_id)
            );
        """)

        # 3. VERİLERİ EKLE
        print("👤 Kullanıcılar ve Öğrenciler ekleniyor...")

        # --- ADMIN & GÖZETMEN ---
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('admin_erdem', 'pass123', 'admin')")
        cur.execute("INSERT INTO users (username, password_hash, role) VALUES ('proctor_ali', 'pass123', 'proctor')")

        # --- ÖĞRENCİLER ---
        # Format: (OkulNo, Şifre, Ad Soyad, BölümKodu)
        student_data = [
            # Yazılım Müh. (0706)
            ('220706011', '123', 'Emre Olca', '0706'),
            ('220706001', '123', 'Mehmet Yılmaz', '0706'),
            ('220706002', '123', 'Ayşe Demir', '0706'),
            ('220706003', '123', 'Can Yıldız', '0706'),
            ('220706004', '123', 'Zeynep Kara', '0706'),
            # Bilgisayar Müh. (0704)
            ('220704001', '123', 'Barış Öz', '0704'),
            ('220704002', '123', 'Elif Su', '0704'),
            ('220704003', '123', 'Hakan Çelik', '0704')
        ]

        for s in student_data:
            # 1. User tablosuna ekle ve ID'yi al
            cur.execute("INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'student') RETURNING id", (s[0], s[1]))
            user_id = cur.fetchone()[0]
            
            # 2. Student tablosuna detayları ekle
            cur.execute("INSERT INTO students (user_id, full_name, department) VALUES (%s, %s, %s)", (user_id, s[2], s[3]))

        # 4. SINAVLARI EKLE
        print("📝 Sınavlar oluşturuluyor...")
        
        # Sınav 1: Veritabanı (Sadece Yazılımcılar için)
        cur.execute("INSERT INTO exams (code, title, room_code, date) VALUES ('CENG 302', 'Veritabanı Yönetim Sistemleri', 'Lab-203', NOW()) RETURNING id")
        exam_db_id = cur.fetchone()[0]

        # Sınav 2: Algoritma (Ortak Ders)
        cur.execute("INSERT INTO exams (code, title, room_code, date) VALUES ('CENG 201', 'Algoritma Analizi', 'Amfi-1', NOW()) RETURNING id")
        exam_algo_id = cur.fetchone()[0]

        # 5. DERS KAYITLARINI YAP (ENROLLMENT)
        print("🔗 Öğrenciler derslere atanıyor...")

        # Tüm öğrencileri çek
        cur.execute("SELECT user_id, department FROM students")
        all_students = cur.fetchall()

        for s_id, dept in all_students:
            # KURAL: Veritabanı sınavına SADECE '0706' (Yazılım) girsin
            if dept == '0706':
                cur.execute("INSERT INTO enrollments (exam_id, student_id) VALUES (%s, %s)", (exam_db_id, s_id))
            
            # KURAL: Algoritma sınavına HERKES girsin
            cur.execute("INSERT INTO enrollments (exam_id, student_id) VALUES (%s, %s)", (exam_algo_id, s_id))

        conn.commit()
        print("✅ İŞLEM TAMAM! Tablolar ayrıldı ve ders atamaları yapıldı.")

    except Exception as e:
        print(f"❌ HATA: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    seed_database()