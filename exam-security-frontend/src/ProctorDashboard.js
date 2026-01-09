import React, { useState } from 'react';
import './ProctorDashboard.css';
import { 
  FaCheckCircle, FaExclamationTriangle, FaUserClock, FaSearch, 
  FaCamera, FaIdCard, FaChair, FaSignOutAlt, FaUserCheck 
} from 'react-icons/fa';

// MOCK DATA (Gözetmen için sınıf listesi)
const mockRoster = [
  { id: "220706010", name: "Emre Olca", seat: "A-1", photoRef: "https://randomuser.me/api/portraits/men/32.jpg", photoLive: "https://randomuser.me/api/portraits/men/32.jpg", matchScore: 98, status: "pending" }, 
  { id: "220706011", name: "Ayşe Yılmaz", seat: "A-2", photoRef: "https://randomuser.me/api/portraits/women/44.jpg", photoLive: null, matchScore: 0, status: "waiting" }, 
  { id: "220706012", name: "Mehmet Demir", seat: "B-1", photoRef: "https://randomuser.me/api/portraits/men/85.jpg", photoLive: "https://randomuser.me/api/portraits/men/86.jpg", matchScore: 45, status: "violation" },
  { id: "220706013", name: "Zeynep Kaya", seat: "B-2", photoRef: "https://randomuser.me/api/portraits/women/65.jpg", photoLive: "https://randomuser.me/api/portraits/women/65.jpg", matchScore: 99, status: "approved" },
  { id: "220706005", name: "Burak Yılmaz", seat: "C-1", photoRef: "https://randomuser.me/api/portraits/men/11.jpg", photoLive: null, matchScore: 0, status: "waiting" },
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="badge success">İçerde</span>;
      case 'pending': return <span className="badge warning">Bekliyor</span>;
      case 'violation': return <span className="badge danger">İhlal</span>;
      default: return <span className="badge secondary">Gelmedi</span>;
    }
  };

  const handleApprove = (student) => {
    const updatedList = students.map(s => s.id === student.id ? {...s, status: 'approved'} : s);
    setStudents(updatedList);
    setSelectedStudent({...student, status: 'approved'});
  };

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
      
      {/* SOL PANEL: LİSTE */}
      <div className="sidebar-list">
        <div className="sidebar-header">
          <div className="header-top">
             <h3>Öğrenci Listesi ({filteredStudents.length})</h3>
             <button className="btn-logout-small" onClick={() => window.location.href='/'}>
                <FaSignOutAlt/> Çıkış
             </button>
          </div>
          <div className="search-wrap">
            <FaSearch className="search-icon"/>
            <input 
              type="text" 
              placeholder="İsim veya Numara ara..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="student-list">
          {filteredStudents.map(student => (
            <div 
              key={student.id} 
              className={`student-item ${selectedStudent?.id === student.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="s-avatar">
                <img src={student.photoRef} alt="avatar" />
              </div>
              <div className="s-info">
                <h4>{student.name}</h4>
                <small>{student.id} - {student.seat}</small>
              </div>
              <div className="s-status">
                {getStatusBadge(student.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ PANEL: DETAY VE İŞLEM */}
      <div className="main-content">
        {selectedStudent ? (
          <div className="verification-panel">
            
            <header className="panel-header">
              <h2><FaIdCard/> Kimlik Doğrulama</h2>
              <div className="seat-info">
                 <FaChair/> Sıra No: {selectedStudent.seat}
              </div>
            </header>

            <div className="comparison-area">
              {/* Kayıtlı Foto */}
              <div className="photo-card">
                <span className="label">Sistem Kaydı</span>
                <img src={selectedStudent.photoRef} alt="System Ref" />
              </div>

              {/* AI Skor */}
              <div className="ai-score-box">
                 <div className={`score-circle ${selectedStudent.matchScore < 70 ? 'low' : 'high'}`}>
                    %{selectedStudent.matchScore}
                 </div>
                 <p>{selectedStudent.matchScore < 70 ? "Uyuşmazlık" : "Yüksek Eşleşme"}</p>
              </div>

              {/* Canlı Foto */}
              <div className="photo-card">
                <span className="label">Kapı Girişi (Canlı)</span>
                {selectedStudent.photoLive ? (
                   <img src={selectedStudent.photoLive} alt="Live Cam" />
                ) : (
                   <div className="no-photo">
                      <FaUserClock size={30}/>
                      <p>Giriş Yapmadı</p>
                   </div>
                )}
              </div>
            </div>

            <div className="student-details-bar" style={{textAlign:'center', padding:'10px', color:'#555', borderBottom:'1px solid #eee'}}>
                 <h3>{selectedStudent.name}</h3>
                 <p>{selectedStudent.id}</p>
            </div>

            <div className="action-bar">
              {selectedStudent.status === 'pending' || selectedStudent.status === 'violation' ? (
                <>
                  <button className="btn-approve" onClick={() => handleApprove(selectedStudent)}>
                    <FaCheckCircle /> Onayla ve İçeri Al
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(selectedStudent)}>
                    <FaExclamationTriangle /> İhlal Bildir / Reddet
                  </button>
                </>
              ) : selectedStudent.status === 'approved' ? (
                <div style={{color:'#27ae60', fontWeight:'bold', fontSize:'18px', display:'flex', alignItems:'center', gap:'10px'}}>
                    <FaUserCheck size={24}/> Öğrenci Sınav Salonunda
                </div>
              ) : (
                <div style={{color:'#f39c12', fontWeight:'bold'}}>⏳ Öğrenci henüz kapıya gelmedi.</div>
              )}
            </div>

          </div>
        ) : (
          <div className="empty-state">
            <FaIdCard />
            <h3>Kontrol etmek için listeden bir öğrenci seçiniz.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;