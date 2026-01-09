// src/services/api.js

// Proxy ayarı package.json'da olduğu için sadece /api yazmamız yeterli
const BASE_URL = "/api"; 

export const api = {
  // 1. GİRİŞ YAP (LOGIN)
  login: async (username, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  // 2. SINAVLARI GETİR (EXAMS)
  getExams: async () => {
    const res = await fetch(`${BASE_URL}/exams`);
    return res.json();
  },

  // 3. CHECK-IN (FOTOĞRAF GÖNDERME)
  checkIn: async (examId, studentId, imageFile) => {
    const formData = new FormData();
    formData.append("exam_id", examId);
    formData.append("student_id", studentId);
    formData.append("image", imageFile);

    const res = await fetch(`${BASE_URL}/check-in`, {
      method: "POST",
      body: formData,
      // FormData kullanırken Content-Type header'ı eklenmez! Tarayıcı halleder.
    });
    return res.json();
  },

  // 4. GÖZETMEN İSTATİSTİKLERİ
  getStats: async (examId) => {
    const res = await fetch(`${BASE_URL}/dashboard/stats/${examId}`);
    return res.json();
  },

  // 5. CANLI AKIŞ (SON GİRENLER)
  getLiveFeed: async (examId) => {
    const res = await fetch(`${BASE_URL}/dashboard/live-feed/${examId}`);
    return res.json();
  },

  // 6. İHLALLER (VIOLATIONS)
  getViolations: async (examId) => {
    const res = await fetch(`${BASE_URL}/dashboard/violations/${examId}`);
    return res.json();
  },
  // 7. SINAVA AİT ÖĞRENCİLERİ GETİR (GÜNCELLENDİ)
  getExamStudents: async (examId) => {
    const res = await fetch(`${BASE_URL}/exam/${examId}/students`);
    return res.json();
  },

};