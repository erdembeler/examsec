// src/services/api.js

// Proxy ayarı package.json'da olduğu için sadece /api yazmamız yeterli
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = {
  // 1. GİRİŞ YAPMA
  login: async (username, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },
  
  // 2. SINAVLARI GETİR
  getExams: async () => {
    const response = await fetch(`${API_URL}/exams`);
    return response.json();
  },
  
  // 3. SINAVDAKİ ÖĞRENCİLERİ GETİR
  getExamStudents: async (examId) => {
    const response = await fetch(`${API_URL}/exam/${examId}/students`);
    return response.json();
  },

  // 4. FOTOĞRAF GÖNDER (CHECK-IN) - EN ÖNEMLİ KISIM
  checkIn: async (examId, studentId, imageBlob) => {
    const formData = new FormData();
    formData.append('exam_id', examId);
    formData.append('student_id', studentId);
    // Blob verisini 'capture.jpg' adıyla dosyaya çevirip ekliyoruz
    formData.append('image', imageBlob, 'capture.jpg');

    // Fetch ile FormData gönderirken 'Content-Type' header'ı YAZILMAZ.
    // Tarayıcı bunu otomatik halleder.
    const response = await fetch(`${API_URL}/check-in`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },

  // 5. AI KONTROLÜ (Gözetmen)
  runAiCheck: async (examId) => {
    const response = await fetch(`${API_URL}/run-face-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId })
    });
    return response.json();
  },

  // 6. İHLAL EKLE (Gözetmen)
  addViolation: async (examId, studentId, note) => {
    const response = await fetch(`${API_URL}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ examId, studentId, note })
    });
    return response.json();
  }
};