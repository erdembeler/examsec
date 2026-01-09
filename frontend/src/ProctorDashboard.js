import React, { useState, useEffect } from 'react';
import './ProctorDashboard.css';
import { api } from './services/api';
import { 
  FaCheckCircle, FaExclamationTriangle, FaSearch, FaIdCard, FaSignOutAlt, FaSync
} from 'react-icons/fa';

const ProctorDashboard = () => {
  const examId = localStorage.getItem('currentExamId') || "1";
  const examTitle = localStorage.getItem('currentExamTitle') || "General Exam";

  // Backend'den gelecek veriler için state
  const [liveFeed, setLiveFeed] = useState([]);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0, violation_count: 0, attendance_rate: 0 });
  const [selectedViolation, setSelectedViolation] = useState(null);

  // Verileri Periyodik Çek (Polling)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. İstatistikleri Çek
        const statsData = await api.getStats(examId);
        setStats(statsData);

        // 2. Canlı Akışı Çek (Son girenler)
        const feedData = await api.getLiveFeed(examId);
        setLiveFeed(feedData);

        // 3. İhlalleri Çek
        const violationsData = await api.getViolations(examId);
        setViolations(violationsData);

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      }
    };

    fetchData(); // İlk açılışta çek
    const interval = setInterval(fetchData, 3000); // Her 3 saniyede bir yenile
    return () => clearInterval(interval);
  }, [examId]);

  return (
    <div className="dashboard-layout">
      
      {/* SOL PANEL: İHLAL LİSTESİ (VIOLATIONS) */}
      <div className="sidebar-list">
        <div className="sidebar-header">
          <div className="header-top">
             <h3>Violations / Alerts</h3>
             <button className="btn-logout-small" onClick={() => window.location.href='/'}><FaSignOutAlt/></button>
          </div>
          <div style={{fontSize:'12px', color:'#777'}}>Exam: {examTitle}</div>
        </div>

        <div className="student-list">
          {violations.length === 0 ? (
            <div style={{padding:'20px', textAlign:'center', color:'#888'}}>No violations detected yet.</div>
          ) : (
            violations.map(v => (
              <div 
                key={v.id} 
                className={`student-item ${selectedViolation?.id === v.id ? 'active' : ''}`}
                onClick={() => setSelectedViolation(v)}
                style={{borderLeft: '4px solid #e74c3c'}}
              >
                <div className="s-info">
                  <h4 style={{color:'#e74c3c'}}>{v.full_name}</h4>
                  <small>{v.student_number} • {new Date(v.timestamp).toLocaleTimeString()}</small>
                  <div style={{fontSize:'11px', marginTop:'5px', fontWeight:'bold'}}>{v.reason}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ORTA PANEL: İSTATİSTİK & DETAY */}
      <div className="main-content">
        
        {/* Üst İstatistikler */}
        <div className="stats-header" style={{display:'flex', gap:'15px', marginBottom:'20px'}}>
             <div className="stat-card">
                <h3>{stats.total_students}</h3>
                <span>Total Students</span>
             </div>
             <div className="stat-card" style={{borderColor:'#2ecc71', color:'#2ecc71'}}>
                <h3>{stats.present_count}</h3>
                <span>Present</span>
             </div>
             <div className="stat-card" style={{borderColor:'#e74c3c', color:'#e74c3c'}}>
                <h3>{stats.violation_count}</h3>
                <span>Violations</span>
             </div>
             <div className="stat-card">
                <h3>%{stats.attendance_rate}</h3>
                <span>Attendance</span>
             </div>
        </div>

        {selectedViolation ? (
          <div className="verification-panel">
            <header className="panel-header">
              <h2 style={{color:'#c0392b'}}><FaExclamationTriangle/> Violation Details</h2>
            </header>

            <div className="comparison-area">
              <div className="photo-card" style={{width: '100%'}}>
                <span className="label">Captured Evidence</span>
                {/* Resim yolu backend'den "assets/..." geldiği için başına base url gerekebilir ama localde direkt çalışır */}
                <img src={selectedViolation.evidence_image} alt="Evidence" />
              </div>
            </div>

            <div className="student-details-bar">
                 <h3>{selectedViolation.full_name}</h3>
                 <p>Reason: {selectedViolation.reason}</p>
                 <button className="btn-reject" onClick={() => setSelectedViolation(null)}>Close Review</button>
            </div>
          </div>
        ) : (
          // Eğer ihlal seçili değilse CANLI AKIŞI göster
          <div className="live-feed-panel">
              <h3><FaSync/> Live Check-in Feed</h3>
              <table className="feed-table">
                  <thead>
                      <tr>
                          <th>Student</th>
                          <th>Time</th>
                          <th>Status</th>
                      </tr>
                  </thead>
                  <tbody>
                      {liveFeed.map((log, index) => (
                          <tr key={index}>
                              <td>{log.full_name}</td>
                              <td>{new Date(log.time).toLocaleTimeString()}</td>
                              <td>
                                  {log.status === 'CLEAN' && <span className="badge success">Verified</span>}
                                  {log.status === 'FACE_MISMATCH' && <span className="badge danger">Face Mismatch</span>}
                                  {log.status === 'WRONG_SEAT' && <span className="badge warning">Wrong Seat</span>}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;