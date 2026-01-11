import React , { useState, useEffect}  from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './animations.css';

// Sayfaları İçe Aktar
import Login from './Login';
import ProctorExams from './ProctorExams';       // Sınav Listesi
import ProctorDashboard from './ProctorDashboard'; // Sınav Detayı (Kelebek/Onay Ekranı)
import StudentDashboard from './StudentDashboard'; // Öğrenci Ekranı
import InstructorDashboard from './InstructorDashboard'; // Öğretmen Ekranı
import SplashScreen from './Splashscreen';
function App() {
const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Session'da splash gösterildi mi kontrol et
    const splashShown = sessionStorage.getItem('splashShown');
    
    if (splashShown) {
      // Daha önce gösterilmiş, direkt devam et
      setIsReady(true);
      setShowSplash(false);
    } else {
      // İlk kez açılıyor, splash göster
      setShowSplash(true);
    }
  }, []);

  const handleReady = () => {
    // Splash gösterildi olarak işaretle (bu session için)
    sessionStorage.setItem('splashShown', 'true');
    setIsReady(true);
    setShowSplash(false);
  };

  // Splash gösterilecekse
  if (showSplash && !isReady) {
    return <SplashScreen onReady={handleReady} />;
  }

  // Henüz karar verilmediyse (ilk render)
  if (!isReady && !showSplash) {
    return null; // veya basit bir loading
  }


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