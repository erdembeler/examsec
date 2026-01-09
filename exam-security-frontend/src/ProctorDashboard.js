import React, { useState } from 'react';
import './ProctorDashboard.css';
import { FaCheckCircle, FaExclamationTriangle, FaUserClock, FaSearch, FaCamera } from 'react-icons/fa';

// Sınıf Listesi (Mock Data) - Backend'den bu liste gelecek 
const mockRoster = [
  { id: "220706010", name: "Emre Olca", seat: "A-1", photoRef: "https://randomuser.me/api/portraits/men/32.jpg", photoLive: "https://randomuser.me/api/portraits/men/32.jpg", matchScore: 98, status: "pending" }, // pending: Onay Bekliyor
  { id: "220706011", name: "Ayşe Yılmaz", seat: "A-2", photoRef: "https://randomuser.me/api/portraits/women/44.jpg", photoLive: null, matchScore: 0, status: "waiting" }, // waiting: Henüz gelmedi
  { id: "220706012", name: "Mehmet Demir", seat: "B-1", photoRef: "https://randomuser.me/api/portraits/men/85.jpg", photoLive: "https://randomuser.me/api/portraits/men/86.jpg", matchScore: 45, status: "violation" }, // violation: Düşük eşleşme
  { id: "220706013", name: "Zeynep Kaya", seat: "B-2", photoRef: "https://randomuser.me/api/portraits/women/65.jpg", photoLive: "https://randomuser.me/api/portraits/women/65.jpg", matchScore: 99, status: "approved" }, // approved: İçerde
];

const ProctorDashboard = () => {
  const [students, setStudents] = useState(mockRoster);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // İsim veya Numaraya göre filtreleme
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  // Öğrenci Durumuna Göre İkon/Renk Getir
  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="badge success">Sınavda</span>;
      case 'pending': return <span className="badge warning">Onay Bekliyor</span>;
      case 'violation': return <span className="badge danger">İhlal/Red</span>;
      default: return <span className="badge secondary">Gelmedi</span>;
    }
  };

  // Onaylama İşlemi
  const handleApprove = (student) => {
    const updatedList = students.map(s => s.id === student.id ? {...s, status: 'approved'} : s);
    setStudents(updatedList);
    setSelectedStudent({...student, status: 'approved'}); // Ekranı güncelle
    alert(`${student.name} sınava kabul edildi.`);
  };

  // Reddetme/İhlal İşlemi
  const handleReject = (student) => {
    const reason = prompt("Reddetme sebebini giriniz (Örn: Eşleşme düşük):");
    if(reason) {
      const updatedList = students.map(s => s.id === student.id ? {...s, status: 'violation'} : s);
      setStudents(updatedList);
      setSelectedStudent({...student, status: 'violation'});
    }
  };

  return (
    <div className="dashboard-layout">
      
      {/* SOL PANEL: ÖĞRENCİ LİSTESİ */}
      <div className="sidebar-list">
        <div className="sidebar-header">
          <h3>Öğrenci Listesi</h3>
          <div className="search-wrap">
            <FaSearch className="search-icon"/>
            <input 
              type="text" 
              placeholder="İsim veya No ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="student-list">
          {filteredStudents.map(student => (
            <div 
              key={student.id} 
              className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''} ${student.status}`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="s-avatar">
                <img src={student.photoRef} alt="avatar" />
              </div>
              <div className="s-info">
                <h4>{student.name}</h4>
                <small>{student.id}</small>
              </div>
              <div className="s-status">
                {getStatusBadge(student.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ PANEL: DETAY VE ONAY */}
      <div className="main-content">
        {selectedStudent ? (
          <div className="verification-panel">
            <header className="panel-header">
              <h2>Kimlik Doğrulama Ekranı</h2>
              <span className="seat-info">Oturması Gereken Sıra: <strong>{selectedStudent.seat}</strong></span>
            </header>

            <div className="photos-comparison">
              {/* Referans Fotoğraf */}
              <div className="photo-card">
                <span className="label">Sistemdeki Fotoğraf</span>
                <img src={selectedStudent.photoRef} alt="Reference" />
              </div>

              {/* AI Skoru */}
              <div className="ai-score-box">
                 <div className={`score-circle ${selectedStudent.matchScore < 70 ? 'low' : 'high'}`}>
                    <span>%{selectedStudent.matchScore}</span>
                    <small>Eşleşme</small>
                 </div>
                 <p>{selectedStudent.matchScore < 70 ? "⚠️ Düşük Benzerlik" : "✅ Güvenilir"}</p>
              </div>

              {/* Canlı Fotoğraf */}
              <div className="photo-card">
                <span className="label">Giriş Anındaki Fotoğraf</span>
                {selectedStudent.photoLive ? (
                   <img src={selectedStudent.photoLive} alt="Live" />
                ) : (
                   <div className="no-photo"><FaUserClock/> Henüz Giriş Yapmadı</div>
                )}
              </div>
            </div>

            <div className="action-bar">
              {selectedStudent.status === 'pending' || selectedStudent.status === 'violation' ? (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(selectedStudent)}>
                    <FaCheckCircle /> Girişi Onayla
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(selectedStudent)}>
                    <FaExclamationTriangle /> Reddet / İhlal
                  </button>
                </>
              ) : selectedStudent.status === 'approved' ? (
                <div className="approved-msg">✅ Bu öğrenci başarıyla giriş yaptı.</div>
              ) : (
                <div className="waiting-msg">⏳ Öğrencinin sisteme bağlanması bekleniyor...</div>
              )}
            </div>

          </div>
        ) : (
          <div className="empty-state">
            <FaCamera size={50} color="#ccc"/>
            <h3>Detayları görmek için soldan bir öğrenci seçin</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;