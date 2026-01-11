import React, { useState, useEffect } from 'react';
import './Splashscreen.css';

const Splashscreen = ({ onReady }) => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [dots, setDots] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

  // Proje açıklama metni
  const fullText = `Exam Tracking System

Yüz tanıma teknolojisi ile desteklenen akıllı sınav takip sistemi.

✦ Öğrenciler için kolay check-in
✦ Gerçek zamanlı katılım takibi  
✦ AI destekli kimlik doğrulama
✦ Otomatik oturma planı oluşturma

Maltepe Üniversitesi
Yazılım Mühendisliği - Final Projesi 2026`;

  // Typewriter efekti
  useEffect(() => {
    let index = 0;
    const typeSpeed = 30; // ms per character

    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        setText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setTextComplete(true);
      }
    }, typeSpeed);

    return () => clearInterval(typeInterval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Loading dots animation
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => clearInterval(dotsInterval);
  }, []);

  // Backend health check
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30; // 30 x 2s = 60 saniye max

    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          console.log('✅ Backend hazır!');
          setBackendReady(true);
          return true;
        }
      } catch (error) {
        attempts++;
        console.log(`⏳ Backend bekleniyor... (${attempts}/${maxAttempts})`);
      }
      return false;
    };

    const pollBackend = async () => {
      const isReady = await checkBackend();
      
      if (!isReady && attempts < maxAttempts) {
        setTimeout(pollBackend, 2000); // 2 saniyede bir dene
      }
    };

    pollBackend();
  }, [API_URL]);

  // Her ikisi de hazır olunca geç
  useEffect(() => {
    if (backendReady && textComplete) {
      // Kısa bir bekleme sonra geç
      setTimeout(() => {
        onReady();
      }, 1500);
    }
  }, [backendReady, textComplete, onReady]);

  return (
    <div className="splash-wrapper">
      {/* Floating Orbs */}
      <div className="floating-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Main Content */}
      <div className="splash-content">
        {/* Logo / Icon */}
        <div className="splash-logo">
          <span className="logo-icon">🎓</span>
        </div>

        {/* Typewriter Text */}
        <div className="typewriter-container">
          <pre className="typewriter-text">
            {text}
            <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
          </pre>
        </div>

        {/* Status */}
        <div className="splash-status">
          {!backendReady ? (
            <div className="status-loading">
              <div className="spinner"></div>
              <span>Sunucu başlatılıyor{dots}</span>
            </div>
          ) : (
            <div className="status-ready">
              <span className="check-icon">✓</span>
              <span>Bağlantı kuruldu!</span>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        <div className="progress-container">
          <div className={`progress-bar ${backendReady ? 'complete' : ''}`}></div>
        </div>
      </div>

      {/* Footer */}
      <div className="splash-footer">
        <p>© 2025 Exam Tracking System</p>
      </div>
    </div>
  );
};

export default Splashscreen;
