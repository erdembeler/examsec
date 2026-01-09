import React, { useState, useEffect, useRef } from 'react';
import './ProctorDashboard.css';
import { api } from './services/api';
import { 
  FaCheckCircle, FaExclamationTriangle, FaUserClock, FaSearch, 
  FaIdCard, FaSignOutAlt, FaSync, FaRobot, FaBan, FaFileAlt
} from 'react-icons/fa';

const ProctorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const currentExamId = localStorage.getItem('currentExamId') || "1";
  const currentExamTitle = localStorage.getItem('currentExamTitle') || "Genel Sınav";

  const pollingRef = useRef(null);

  useEffect(() => {
    fetchData();
    pollingRef.current = setInterval(fetchData, 3000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.getExamStudents(currentExamId);
      setStudents(data);
      setLoading(false);
      
      if (selectedStudent) {
        const updated = data.find(s => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return <span className="badge success">Verified</span>;
      case 'pending': return <span className="badge warning">Waiting Approval</span>;
      case 'violation': return <span className="badge danger">VIOLATION</span>;
      default: return <span className="badge secondary">Absent</span>;
    }
  };

  // --- ACTIONS ---

  const handleRunAi = async () => {
    if(!window.confirm("Start AI Verification for all pending students?")) return;
    setAiLoading(true);
    try {
        const res = await api.runAiCheck(currentExamId);
        alert(`AI Check Complete! Processed: ${res.processed} students.`);
        fetchData();
    } catch (err) {
        alert("AI Error: " + err.message);
    } finally {
        setAiLoading(false);
    }
  };

  const handleViolation = async (student) => {
    const note = prompt("Enter violation details (e.g. Cheating, Face Mismatch):", "Suspicious Activity");
    if (!note) return;

    try {
        await api.addViolation(currentExamId, student.id, note);
        alert("Violation logged successfully.");
        fetchData();
    } catch (err) {
        alert("Error logging violation.");
    }
  };

  const handleApprove = async (student) => {
     // Manuel onay için backend'e violation notunu silip statusu present yapan bir endpoint eklenebilir
     // Şimdilik sadece violation fonksiyonunu kullanıyoruz ama burayı geliştirebilirsin.
     alert("Manual approvement logic here.");
  };

  const handleGetReport = () => {
    const violations = students.filter(s => s.status === 'violation');
    let report = `EXAM REPORT: ${currentExamTitle}\n\n`;
    report += `Total Students: ${students.length}\n`;
    report += `Verified: ${students.filter(s => s.status === 'present').length}\n`;
    report += `Violations: ${violations.length}\n\n`;
    
    if (violations.length > 0) {
        report += "--- VIOLATION DETAILS ---\n";
        violations.forEach(v => {
            report += `[${v.id}] ${v.name}: ${v.violation_note || 'No details'}\n`;
        });
    } else {
        report += "No violations detected.";
    }
    
    alert(report);
  };

  return (
    <div className="dashboard-layout">
      
      {/* SOL PANEL */}
      <div className="sidebar-list">
        <div className="sidebar-header">
          <div className="header-top">
             <h3>{currentExamTitle}</h3>
             <button className="btn-logout-small" onClick={() => window.location.href='/'}>
                <FaSignOutAlt/>
             </button>
          </div>
          
          <button className="btn-ai-check" onClick={handleRunAi} disabled={aiLoading}>
             {aiLoading ? <FaSync className="fa-spin"/> : <FaRobot/>} 
             {aiLoading ? " Analyzing..." : " Run AI Check All"}
          </button>

          <div className="search-wrap" style={{marginTop:'10px'}}>
            <FaSearch className="search-icon"/>
            <input 
              type="text" 
              placeholder="Search student..." 
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
              style={student.status === 'violation' ? {borderLeft:'4px solid red', background:'#fff5f5'} : 
                     student.status === 'pending' ? {borderLeft:'4px solid orange'} : {}}
            >
              <div className="s-info">
                <h4>{student.name}</h4>
                <small>{student.id} • {student.dept}</small>
                {student.violation_note && <div style={{color:'red', fontSize:'10px', fontWeight:'bold'}}>{student.violation_note}</div>}
              </div>
              <div className="s-status">
                {getStatusBadge(student.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ PANEL */}
      <div className="main-content">
        <button className="btn-report" onClick={handleGetReport}><FaFileAlt/> Get Report</button>

        {selectedStudent ? (
          <div className="verification-panel">
            
            <header className="panel-header">
              <h2><FaIdCard/> Identity Verification</h2>
              {selectedStudent.status === 'violation' && <span className="badge danger">VIOLATION DETECTED</span>}
            </header>

            {/* FOTOĞRAF KARŞILAŞTIRMA ALANI (YAN YANA - BURASI DEĞİŞTİ) */}
            <div className="comparison-grid">
                
                {/* 1. REFERANS FOTO (SİSTEMDEKİ) */}
                <div className="photo-column">
                    <span className="label">Reference (System)</span>
                    <div className="photo-frame">
                        {selectedStudent.reference_photo ? (
                            <img src={selectedStudent.reference_photo} alt="Ref" />
                        ) : (
                            <div className="no-photo">No Reference</div>
                        )}
                    </div>
                </div>

                {/* 2. CANLI FOTO (ÖĞRENCİNİN GÖNDERDİĞİ) */}
                <div className="photo-column">
                    <span className="label">Live Capture (Exam)</span>
                    <div className="photo-frame">
                        {selectedStudent.photo_url ? (
                           <img src={`http://localhost:5000/api/images/${selectedStudent.photo_url}`} alt="Live" />
                        ) : (
                           <div className="no-photo"><FaUserClock size={30}/><br/>Waiting...</div>
                        )}
                    </div>
                </div>

            </div>

            <div className="student-details-bar">
                 <h3>{selectedStudent.name}</h3>
                 <p>{selectedStudent.id} - {selectedStudent.dept === '0706' ? 'Software' : 'Computer'}</p>
                 {selectedStudent.violation_note && (
                     <div className="violation-alert">
                        <FaExclamationTriangle/> {selectedStudent.violation_note}
                     </div>
                 )}
            </div>

            <div className="action-bar">
                <button className="btn-approve" onClick={() => alert("Manual Verify Logic")}>
                    <FaCheckCircle /> Verify Manually
                </button>
                
                <button className="btn-violation" onClick={() => handleViolation(selectedStudent)}>
                    <FaBan /> Report Violation
                </button>
            </div>

          </div>
        ) : (
          <div className="empty-state">
            <FaIdCard size={50}/>
            <h3>Select a student to verify identity</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorDashboard;