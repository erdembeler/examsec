import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Sayfaları İçe Aktar
import Login from './Login';
import ProctorExams from './ProctorExams';       // Sınav Listesi
import ProctorDashboard from './ProctorDashboard'; // Sınav Detayı (Kelebek/Onay Ekranı)
import StudentDashboard from './StudentDashboard'; // Öğrenci Ekranı
import InstructorDashboard from './InstructorDashboard'; // Öğretmen Ekranı

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. GİRİŞ EKRANI (Varsayılan) */}
        <Route path="/" element={<Login />} />

        {/* 2. GÖZETMEN ROTALARI */}
        {/* Login olunca buraya yönlendirmelisin: /proctor/exams */}
        <Route path="/proctor/exams" element={<ProctorExams />} />
        <Route path="/proctor/dashboard" element={<ProctorDashboard />} />

        {/* 3. ÖĞRENCİ ROTALARI */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* 4. ÖĞRETMEN ROTALARI */}
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />

        {/* Hatalı bir link girilirse Login'e at */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;