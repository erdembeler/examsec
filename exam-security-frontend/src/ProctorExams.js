import React from 'react';
import './ProctorDashboard.css'; // Tasarımı ortak CSS'e ekleyeceğiz
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowRight, 
  FaClipboardList, FaSignOutAlt, FaUserFriends, FaHourglassHalf 
} from 'react-icons/fa';

const ProctorExams = () => {
  // Mock Data: Daha detaylı sınav verileri
  const exams = [
    { 
      id: 1, 
      code: "SENG 405",
      title: "Yazılım Test ve Doğrulama", 
      date: "09.01.2025", 
      time: "14:00", 
      duration: "60 Dk",
      room: "Lab-203", 
      status: "Aktif", 
      studentCount: 45,
      color: "green"
    },
    { 
      id: 2, 
      code: "CENG 302",
      title: "Veritabanı Yönetimi", 
      date: "10.01.2025", 
      time: "10:00", 
      duration: "90 Dk",
      room: "Amfi-1", 
      status: "Planlandı", 
      studentCount: 60,
      color: "blue"
    },
    { 
      id: 3, 
      code: "AI 101",
      title: "Yapay Zeka Giriş", 
      date: "12.01.2025", 
      time: "13:30", 
      duration: "45 Dk",
      room: "Online", 
      status: "Bitti", 
      studentCount: 32,
      color: "gray"
    }
  ];

  const handleSelectExam = (examTitle) => {
    localStorage.setItem('currentExam', examTitle);
    window.location.href = '/proctor/dashboard';
  };

  return (
    <div className="pe-wrapper">
      <div className="pe-container">
        
        {/* HEADER */}
        <header className="pe-header">
          <div className="pe-header-left">
             <div className="pe-icon-box"><FaClipboardList /></div>
             <div>
                <h2>Sınav Yönetim Merkezi</h2>
                <p>Gözetmen Paneli • Aktif Oturumlar</p>
             </div>
          </div>
          <button className="btn-logout-header" onClick={() => window.location.href='/'}>
             <FaSignOutAlt/> Çıkış Yap
          </button>
        </header>

        {/* PAGE TITLE */}
        <h3 className="section-title">Atandığınız Sınavlar</h3>

        {/* EXAM CARDS GRID */}
        <div className="pe-grid">
          {exams.map(exam => (
            <div key={exam.id} className={`pe-card ${exam.status === 'Aktif' ? 'card-active' : ''}`}>
              
              {/* Card Top: Badge & Code */}
              <div className="card-top">
                 <span className={`status-pill pill-${exam.color}`}>
                    {exam.status === 'Aktif' ? '🟢 Şu An Yayında' : exam.status}
                 </span>
                 <span className="course-code">{exam.code}</span>
              </div>
              
              {/* Card Title */}
              <h3 className="card-title">{exam.title}</h3>
              
              {/* Meta Data Grid */}
              <div className="meta-grid">
                <div className="meta-item">
                    <FaCalendarAlt className="m-icon"/> {exam.date}
                </div>
                <div className="meta-item">
                    <FaClock className="m-icon"/> {exam.time}
                </div>
                <div className="meta-item">
                    <FaHourglassHalf className="m-icon"/> {exam.duration}
                </div>
                <div className="meta-item">
                    <FaUserFriends className="m-icon"/> {exam.studentCount} Öğr.
                </div>
              </div>

              {/* Footer: Location & Action */}
              <div className="card-footer">
                <div className="location-info">
                    <FaMapMarkerAlt className="loc-icon"/>
                    <span>{exam.room}</span>
                </div>

                <button 
                  className={`btn-action-card ${exam.status === 'Aktif' ? 'btn-pulse' : ''}`}
                  onClick={() => handleSelectExam(exam.title)}
                  disabled={exam.status !== 'Aktif'}
                >
                  {exam.status === 'Aktif' ? 'Yönet' : 'Kapalı'} 
                  <FaArrowRight/>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProctorExams;