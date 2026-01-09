-- 1. Users table for Role-Based Access (Admin/Proctor) [cite: 34, 72]
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('Admin', 'Proctor')) NOT NULL
);

-- 2. Students table for roster management [cite: 36]
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    registered_photo_path TEXT -- Path to the original ID photo [cite: 18]
);

-- 3. Exams table [cite: 35]
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    room_code VARCHAR(50) NOT NULL,
    exam_date TIMESTAMP NOT NULL
);

-- 4. Seating Plan [cite: 37]
-- Constraint: A student can only have one seat per exam [cite: 85]
CREATE TABLE seating_plans (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    seat_code VARCHAR(10) NOT NULL,
    UNIQUE(exam_id, student_id),
    UNIQUE(exam_id, seat_code) 
);

-- 5. Check-in Workflow logs [cite: 38, 75]
-- Constraint: Duplicate check-in is prevented 
CREATE TABLE check_ins (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    student_id INTEGER REFERENCES students(id),
    checkin_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ml_verification_status BOOLEAN NOT NULL, -- Match vs No Match [cite: 17]
    seat_compliance_status BOOLEAN NOT NULL, -- Correct vs Wrong seat [cite: 38]
    live_photo_path TEXT,
    UNIQUE(exam_id, student_id)
);

-- 6. Violation Logs [cite: 39, 78]
CREATE TABLE violations (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    student_id INTEGER REFERENCES students(id),
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    evidence_image_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
