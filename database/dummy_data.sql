-- ==========================================
-- DUMMY DATA GENERATION
-- Tüm tablolar için örnek veriler içerir.
-- Sıralama önemlidir (Önce ana tablolar, sonra ilişkili tablolar).
-- ==========================================

-- 1. USERS (Kullanıcılar)
-- Admin ve Gözetmen (Proctor) rolleri ekleniyor.
INSERT INTO users (username, password_hash, role) VALUES 
('admin_erdem', 'hashed_secret_pass_123', 'Admin'),
('gozetmen_ali', 'hashed_secret_pass_456', 'Proctor');

-- 2. STUDENTS (Öğrenciler)
-- 3 farklı öğrenci ekleyelim.
INSERT INTO students (student_number, full_name, registered_photo_path) VALUES 
('220706011', 'Erdem Beler', '/assets/photos/220706011.jpg'),
('20240002', 'Ayşe Yılmaz', '/assets/photos/20240002.jpg'),
('20240003', 'Mehmet Demir', '/assets/photos/20240003.jpg');

-- 3. EXAMS (Sınavlar)
-- Bir adet aktif sınav tanımlayalım.
INSERT INTO exams (title, room_code, exam_date) VALUES 
('Veritabanı Yönetim Sistemleri Finali', 'LAB-302', '2026-01-15 14:00:00');

-- 4. SEATING PLANS (Oturma Düzeni)
-- Yukarıdaki 3 öğrenciyi, 1 nolu sınava (Exam ID: 1) yerleştirelim.
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES 
(1, 1, 'A-01'), -- Erdem A-01'e oturmalı
(1, 2, 'A-02'), -- Ayşe A-02'ye oturmalı
(1, 3, 'A-03'); -- Mehmet A-03'e oturmalı

-- 5. CHECK-INS (Yoklama / Giriş Logları)
-- Senaryo:
-- 1. Öğrenci (Erdem): Yüzü tuttu, doğru sıraya oturdu (Sorunsuz).
-- 2. Öğrenci (Ayşe): Yüzü tuttu, ama YANLIŞ sıraya oturdu (Seat Violation).
-- 3. Öğrenci (Mehmet): Hiç gelmedi (Check-in kaydı yok).
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status, live_photo_path) VALUES 
(1, 1, '2026-01-15 13:55:00', TRUE, TRUE, '/assets/live/exam1_std1_ok.jpg'),
(1, 2, '2026-01-15 13:58:00', TRUE, FALSE, '/assets/live/exam1_std2_wrong_seat.jpg');

-- 6. VIOLATIONS (İhlal Kayıtları)
-- Senaryo:
-- Ayşe (ID: 2) yanlış sıraya oturduğu için sistem veya gözetmen bir ihlal kaydı oluşturdu.
INSERT INTO violations (exam_id, student_id, reason, notes, evidence_image_path) VALUES 
(1, 2, 'Wrong Seat', 'Öğrenci A-02 yerine B-05 numaralı sırada tespit edildi.', '/assets/evidence/exam1_viol_std2.jpg');