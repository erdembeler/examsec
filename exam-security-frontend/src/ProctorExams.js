import React from 'react';
import './ProctorDashboard.css'; // Aynı CSS'i kullanabiliriz
import { FaCalendarAlt, FaClock, FaDoorOpen, FaArrowRight } from 'react-icons/fa';

const ProctorExams = () => {
  // Mock Sınav Listesi
  const exams = [
    { id: 1, title: "Yazılım Test ve Doğrulama", date: "09.01.2025", time: "14:00", room: "Lab-203", status: "Aktif" },
    { id: 2, title: "Veritabanı Yönetimi", date: "10.01.2025", time: "10:00", room: "Amfi-1", status: "Planlandı" },
    { id: 3, title: "Yapay Zeka Giriş", date: "12.01.2025", time: "13:30", room: "Online", status: "Bitti" }
  ];

  const handleSelectExam = (examTitle) => {
    // Sınavı seçti, detay panele gidiyoruz
    localStorage.setItem('currentExam', examTitle);
    window.location.href = '/proctor/dashboard';
  };

  return (
    <div className="dashboard-wrapper" style={{padding: '40px'}}>
      <div className="dashboard-container" style={{maxWidth: '900px'}}>
        
        <header className="dash-header">
          <h2>Sınav Yönetim Paneli</h2>
          <p>Merhaba Gözetmen, lütfen yönetmek istediğiniz sınavı seçiniz.</p>
        </header>

        <div className="exams-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px'}}>
          {exams.map(exam => (
            <div key={exam.id} className="student-card" style={{padding: '20px', borderLeft: exam.status === 'Aktif' ? '5px solid #28a745' : '5px solid #ccc'}}>
              
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                <span className={`badge ${exam.status === 'Aktif' ? 'success' : 'secondary'}`}>{exam.status}</span>
                <small><FaCalendarAlt/> {exam.date}</small>
              </div>
              
              <h3 style={{margin: '10px 0', color: '#333'}}>{exam.title}</h3>
              
              <div style={{color: '#666', fontSize: '14px', marginBottom: '20px'}}>
                <p><FaClock/> Saat: {exam.time}</p>
                <p><FaDoorOpen/> Derslik: {exam.room}</p>
              </div>

              <button 
                className="btn-login" 
                style={{marginTop: '0', backgroundColor: exam.status === 'Aktif' ? '#0061f2' : '#999'}}
                onClick={() => handleSelectExam(exam.title)}
                disabled={exam.status !== 'Aktif'}
              >
                {exam.status === 'Aktif' ? 'Sınava Git' : 'Beklemede'} <FaArrowRight/>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProctorExams;