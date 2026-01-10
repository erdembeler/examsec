# 🛡️ Exam Security System

> **Physical Exam Identity Verification & Seating Management System** > *Final Project for Software Testing & Validation Course*

![Status](https://img.shields.io/badge/Status-Completed-success)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20CSS%20%7C%20Jest-blue)
![Testing](https://img.shields.io/badge/Coverage-Pass-brightgreen)

## 🔗 Project Links

* **Jira Board (Project Management):** [Exam Security System Board](https://taylanalp12.atlassian.net/jira/software/projects/ESS/boards/4)
* **Live Demo:** [https://examsec.vercel.app]

---

## 📖 Overview

The **Exam Security System** is a web-based application designed to digitize and secure the management of physical university examinations. It addresses key challenges such as student impersonation ("joker" students) and inefficient seating arrangements.

The system features a **Role-Based Access Control (RBAC)** architecture with modules for Students, Instructors, and Proctors. It integrates **Face Verification** logic to authenticate students via webcam and employs a **"Butterfly Seating Algorithm"** to prevent cheating by mixing students from different departments.

---

## 🚀 Key Features

### 🎓 Student Module
* **Reference Photo Upload:** Upload a secure ID photo for verification.
* **Live Face Check-in:** Webcam integration to capture a live photo before joining the exam.
* **Exam Schedule:** View assigned exams, dates, and locations.

### 👨‍🏫 Instructor Module
* **Exam Management:** Create and configure new exam sessions.
* **Butterfly Seating Algorithm:** Automatically arranges students (e.g., Software vs. Computer Eng.) in an alternating pattern to minimize cheating risks.
* **Manual Override:** Drag-and-drop or click-to-assign functionality for seating.
* **Reporting:** Generates professional PDF reports of attendance and violations.

### 👮‍♂️ Proctor Module
* **Live Verification Dashboard:** View active exams and student lists.
* **Side-by-Side Comparison:** Compare reference photos vs. live camera captures.
* **Approval System:** Approve valid students or flag violations directly from the dashboard.

---

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Styling:** Custom CSS3 (Modern Dashboard UI)
* **Testing:** Jest, React Testing Library
* **Project Management:** Jira (Agile/Scrum)

---

## ⚙️ Installation & Setup

Prerequisites: Make sure you have **Node.js** installed.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/erdembeler/exam-security-system.git](https://github.com/your-username/exam-security-system.git)
    
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```
    The app will open at `http://localhost:3000`.

---

## 🧪 Running Tests

This project adheres to strict testing protocols. Unit tests cover seating logic, validation rules, and service wrappers.

To execute the test suite:

```bash
npm test
