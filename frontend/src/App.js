// src/App.js
import React from 'react';
import Login from './Login';
import ProctorDashboard from './ProctorDashboard'; // Detaylı Sınıf Paneli
import ProctorExams from './ProctorExams';       // YENİ: Sınav Seçim Ekranı
import StudentDashboard from './StudentDashboard'; // YENİ: Öğrenci Paneli
import InstructorDashboard from './InstructorDashboard';

function App() {
  const path = window.location.pathname;

  if (path === '/instructor/dashboard') {
    return <InstructorDashboard />;
  }

  // GÖZETMEN SAYFALARI
  if (path === '/proctor/exams') {
    return <ProctorExams />;
  }
  if (path === '/proctor/dashboard') {
    return <ProctorDashboard />;
  }

  // ÖĞRENCİ SAYFASI
  if (path === '/student/dashboard') {
    return <StudentDashboard />;
  }
  
  // Varsayılan: Login
  return <Login />;
}

export default App;