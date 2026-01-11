-- ============================================
-- DUMMY DATA FOR EXAM SECURITY SYSTEM
-- ============================================
-- Run after schema.sql
-- Usage: psql $DATABASE_URL -f dummy_data.sql
-- ============================================

-- Clear existing data (optional)
DELETE FROM violations;
DELETE FROM check_ins;
DELETE FROM seating_plans;
DELETE FROM enrollments;
DELETE FROM exams;
DELETE FROM students;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE exams_id_seq RESTART WITH 1;
ALTER SEQUENCE seating_plans_id_seq RESTART WITH 1;
ALTER SEQUENCE check_ins_id_seq RESTART WITH 1;
ALTER SEQUENCE violations_id_seq RESTART WITH 1;

-- ============================================
-- 1. USERS (Instructors, Proctors, Students)
-- ============================================

-- Instructors (role = 'admin')
INSERT INTO users (username, password_hash, role) VALUES ('instructor1', '123456', 'admin');
INSERT INTO users (username, password_hash, role) VALUES ('instructor2', '123456', 'admin');

-- Proctors
INSERT INTO users (username, password_hash, role) VALUES ('proctor1', '123456', 'proctor');
INSERT INTO users (username, password_hash, role) VALUES ('proctor2', '123456', 'proctor');

-- Students - Software Engineering (0706) - 6 students
INSERT INTO users (username, password_hash, role) VALUES ('220706001', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220706002', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220706003', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220706004', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220706005', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220706006', '123456', 'student');

-- Students - Computer Engineering (0704) - 6 students
INSERT INTO users (username, password_hash, role) VALUES ('220704001', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220704002', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220704003', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220704004', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220704005', '123456', 'student');
INSERT INTO users (username, password_hash, role) VALUES ('220704006', '123456', 'student');

-- ============================================
-- 2. STUDENTS (Profile Info)
-- ============================================

-- Software Engineering Students (0706)
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(5, 'Ahmet Yilmaz', '0706', 'https://randomuser.me/api/portraits/men/1.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(6, 'Ayse Demir', '0706', 'https://randomuser.me/api/portraits/women/2.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(7, 'Mehmet Kaya', '0706', 'https://randomuser.me/api/portraits/men/3.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(8, 'Zeynep Celik', '0706', 'https://randomuser.me/api/portraits/women/4.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(9, 'Emre Sahin', '0706', 'https://randomuser.me/api/portraits/men/5.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(10, 'Elif Ozturk', '0706', 'https://randomuser.me/api/portraits/women/6.jpg');

-- Computer Engineering Students (0704)
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(11, 'Burak Aydin', '0704', 'https://randomuser.me/api/portraits/men/7.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(12, 'Selin Arslan', '0704', 'https://randomuser.me/api/portraits/women/8.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(13, 'Can Dogan', '0704', 'https://randomuser.me/api/portraits/men/9.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(14, 'Merve Kilic', '0704', 'https://randomuser.me/api/portraits/women/10.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(15, 'Kerem Aslan', '0704', 'https://randomuser.me/api/portraits/men/11.jpg');
INSERT INTO students (user_id, full_name, department, reference_photo) VALUES 
(16, 'Irem Koc', '0704', 'https://randomuser.me/api/portraits/women/12.jpg');

-- ============================================
-- 3. EXAMS
-- ============================================

-- Active exams (upcoming)
INSERT INTO exams (code, title, room_code, date, departments, is_active) VALUES 
('SENG405', 'Software Testing Final', 'D-101', '2025-01-20 10:00:00', '0706', true);
INSERT INTO exams (code, title, room_code, date, departments, is_active) VALUES 
('CENG301', 'Operating Systems Final', 'D-102', '2025-01-22 14:00:00', '0704', true);
INSERT INTO exams (code, title, room_code, date, departments, is_active) VALUES 
('MATH101', 'Calculus I Final', 'A-101', '2025-01-25 09:00:00', '0706,0704', true);

-- Inactive exams (completed)
INSERT INTO exams (code, title, room_code, date, departments, is_active) VALUES 
('SENG301', 'Software Engineering Final', 'D-201', '2025-01-05 10:00:00', '0706', false);
INSERT INTO exams (code, title, room_code, date, departments, is_active) VALUES 
('CENG201', 'Data Structures Final', 'D-202', '2025-01-08 14:00:00', '0704', false);

-- ============================================
-- 4. ENROLLMENTS
-- ============================================

-- Exam 1: SENG405 (Software students only)
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 5, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 6, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 7, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 8, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 9, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (1, 10, 'absent');

-- Exam 2: CENG301 (Computer students only)
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 11, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 12, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 13, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 14, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 15, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (2, 16, 'absent');

-- Exam 3: MATH101 (Both departments)
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 5, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 6, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 7, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 8, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 9, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 10, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 11, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 12, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 13, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 14, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 15, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (3, 16, 'absent');

-- Exam 4: SENG301 (Completed - with results)
INSERT INTO enrollments (exam_id, student_id, status) VALUES (4, 5, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (4, 6, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (4, 7, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (4, 8, 'absent');
INSERT INTO enrollments (exam_id, student_id, status, violation_note) VALUES (4, 9, 'violation', 'Face mismatch detected');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (4, 10, 'present');

-- Exam 5: CENG201 (Completed - with results)
INSERT INTO enrollments (exam_id, student_id, status) VALUES (5, 11, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (5, 12, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (5, 13, 'absent');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (5, 14, 'present');
INSERT INTO enrollments (exam_id, student_id, status) VALUES (5, 15, 'present');
INSERT INTO enrollments (exam_id, student_id, status, violation_note) VALUES (5, 16, 'violation', 'Wrong seat');

-- ============================================
-- 5. SEATING PLANS (Completed exams)
-- ============================================

-- Exam 4: SENG301 seating
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 5, 'A-1');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 6, 'A-2');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 7, 'A-3');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 8, 'B-1');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 9, 'B-2');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (4, 10, 'B-3');

-- Exam 5: CENG201 seating
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 11, 'A-1');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 12, 'A-2');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 13, 'A-3');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 14, 'B-1');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 15, 'B-2');
INSERT INTO seating_plans (exam_id, student_id, seat_code) VALUES (5, 16, 'B-3');

-- ============================================
-- 6. CHECK_INS (Completed exams)
-- ============================================

-- Exam 4 check-ins
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(4, 5, '2025-01-05 09:45:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(4, 6, '2025-01-05 09:50:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(4, 7, '2025-01-05 09:52:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(4, 9, '2025-01-05 09:55:00', false, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(4, 10, '2025-01-05 09:58:00', true, true);

-- Exam 5 check-ins
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(5, 11, '2025-01-08 13:45:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(5, 12, '2025-01-08 13:48:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(5, 14, '2025-01-08 13:52:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(5, 15, '2025-01-08 13:55:00', true, true);
INSERT INTO check_ins (exam_id, student_id, checkin_time, ml_verification_status, seat_compliance_status) VALUES 
(5, 16, '2025-01-08 13:58:00', true, false);

-- ============================================
-- 7. VIOLATIONS
-- ============================================

-- Exam 4: Face mismatch violation
INSERT INTO violations (exam_id, student_id, reason, notes, created_at) VALUES 
(4, 9, 'Face Mismatch', 'AI verification failed. Confidence: 35%', '2025-01-05 10:05:00');

-- Exam 5: Wrong seat violation
INSERT INTO violations (exam_id, student_id, reason, notes, created_at) VALUES 
(5, 16, 'Wrong Seat', 'Student was assigned B-3 but sat in C-1', '2025-01-08 14:10:00');

-- ============================================
-- SUMMARY
-- ============================================
-- Users: 16 (2 instructors, 2 proctors, 12 students)
-- Students: 12 (6 Software Eng, 6 Computer Eng)
-- Exams: 5 (3 active, 2 completed)
-- Enrollments: 36
-- Seating Plans: 12
-- Check-ins: 10
-- Violations: 2
-- ============================================
