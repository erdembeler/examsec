import React, { useState, useEffect, useRef } from 'react';
import './ProctorDashboard.css';
import { api } from './services/api';
import { 
  FaCheckCircle, FaExclamationTriangle, FaUserClock, FaSearch, 
  FaIdCard, FaChair, FaSignOutAlt, FaUserCheck, FaSpinner, FaSync
} from 'react-icons/fa';

const ProctorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // localStorage'dan seçilen sınavı al (ProctorExams.js'den geliyor olmalı)
  // Eğer yoksa varsayılan 1 alıyoruz (Test için)
  const currentExamId = localStorage.getItem('currentExamId') || "1";
  const currentExamTitle = localStorage.getItem('currentExamTitle') || "Genel Sınav";

  // Polling (Canlı Takip)
  const pollingRef = useRef(null);

  useEffect(() => {
    fetchData();
    // 3 saniyede bir yeni veri var mı diye bak
    pollingRef.current = setInterval(fetchData, 3000);

    return () => clearInterval(pollingRef.current);
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.getExamStudents(currentExamId);
      setStudents(data);
      setLoading(false);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  // İsim veya Numaraya göre filtreleme
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return <span className="badge success">İçerde</span>;
      case 'pending': return <span className="badge warning">Onay Bekliyor</span>;
      case 'violation': return <span className="badge danger">Reddedildi</span>;
      default: return <span className="badge secondary">Gelmedi</span>;
    }
  };

  // Onaylama İşlemi (Şimdilik sadece UI güncelliyor, API eklemesi yapılabilir)
  const handleApprove = (student) => {
    // Burada backend'e "status=present" isteği atılabilir
    alert(`${student.name} onaylandı!`);
  };

  const handleReject = (student) => {
    const reason = prompt("Red sebebi?");
    if(reason) alert(`${student.name} reddedildi: ${reason}`);
  };

  return (
    <div className="dashboard-layout">
      
      {/* SOL PANEL: LİSTE */}
      <div className="sidebar-list">
        <div className="sidebar-header">
          <div className="header-top">
             <h3>{currentExamTitle}</h3>
             <button className="btn-logout-small" onClick={() => window.location.href='/'}>
                <FaSignOutAlt/> Çıkış
             </button>
          </div>
          <div className="search-wrap">
            <FaSearch className="search-icon"/>
            <input 
              type="text" 
              placeholder="Ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {loading && <div style={{fontSize:'12px', color:'#aaa'}}><FaSync className="fa-spin"/> Canlı veri bekleniyor...</div>}
        </div>

        <div className="student-list">
          {filteredStudents.map(student => (
            <div 
              key={student.id} 
              className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
              style={student.status === 'pending' ? {borderLeft:'4px solid #f1c40f'} : {}}
            >
              <div className="s-info">
                <h4>{student.name}</h4>
                <small>{student.id} • {student.dept === '0706' ? 'Yazılım' : 'Bilgisayar'}</small>
              </div>
              <div className="s-status">
                {getStatusBadge(student.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ PANEL: DETAY */}
      <div className="main-content">
        {selectedStudent ? (
          <div className="verification-panel">
            
            <header className="panel-header">
              <h2><FaIdCard/> Kimlik Doğrulama</h2>
            </header>

            <div className="comparison-area">
              {/* Canlı Fotoğraf (Backend'den Geliyor) */}
              <div className="photo-card" style={{width:'100%', maxWidth:'400px'}}>
                <span className="label">Kapı Girişi (Canlı)</span>
                {selectedStudent.photo_url ? (
                   // API üzerinden resmi çekiyoruz
                   <img src={`http://localhost:5000/api/images/${selectedStudent.photo_url}`} alt="Live Cam" />
                ) : (
                   <div className="no-photo">
                      <FaUserClock size={40}/>
                      <p>Fotoğraf Yok</p>
                   </div>
                )}
              </div>
            </div>

            <div className="student-details-bar" style={{textAlign:'center', marginTop:'20px'}}>
                 <h3>{selectedStudent.name}</h3>
                 <p>{selectedStudent.id}</p>
                 <p style={{color:'#666'}}>Durum: <strong>{selectedStudent.status.toUpperCase()}</strong></p>
            </div>

            <div className="action-bar">
              {selectedStudent.status === 'pending' && (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(selectedStudent)}>
                    <FaCheckCircle /> Onayla
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(selectedStudent)}>
                    <FaExclamationTriangle /> Reddet
                  </button>
                </>
              )}
            </div>

          </div>
        ) : (
          <div className="empty-state">
            <FaIdCard size={50}/>
            <h3>Kontrol etmek için soldan bir öğrenci seçiniz.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;