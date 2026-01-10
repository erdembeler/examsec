import React, { useEffect, useState } from 'react';
import './ProctorDashboard.css';
import { api } from './services/api';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaArrowRight, 
  FaClipboardList, FaSignOutAlt, FaSpinner 
} from 'react-icons/fa';

const ProctorExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.getExams();
        // Backend'den gelen veri formatına göre mapping yapıyoruz
        // Backend: { id, title, room_code, date } dönüyor
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleSelectExam = (exam) => {
    localStorage.setItem('currentExamId', exam.id);
    localStorage.setItem('currentExamTitle', exam.title);
    window.location.href = '/proctor/dashboard';
  };

  return (
    <div className="pe-wrapper">
      <div className="pe-container">
        
        <header className="pe-header">
          <div className="pe-header-left">
             <div className="pe-icon-box"><FaClipboardList /></div>
             <div>
                <h2>Exam Management Center</h2>
                <p>Proctor Panel • Active Sessions</p>
             </div>
          </div>
          <button className="btn-logout-header" onClick={() => window.location.href='/'}>
             <FaSignOutAlt/> Logout
          </button>
        </header>

        <h3 className="section-title">Assigned Exams</h3>

        {loading ? (
            <div style={{textAlign: 'center', padding: '40px'}}><FaSpinner className="fa-spin"/> Loading exams...</div>
        ) : (
            <div className="pe-grid">
            {exams.length === 0 ? <p>No active exams found.</p> : exams.map(exam => (
                <div key={exam.id} className="pe-card card-active">
                
                <div className="card-top">
                    <span className={`exam-status ${exam.is_active ? 'active' : 'finished'}`}>
      {exam.is_active ? '🟢 Aktif' : '🔴 Bitmiş'}
    </span>
                    <span className="course-code">ID: {exam.id}</span>
                </div>
                
                <h3 className="card-title">{exam.title}</h3>
                
                <div className="meta-grid">
                    <div className="meta-item">
                        <FaCalendarAlt className="m-icon"/> {new Date(exam.date).toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                        <FaClock className="m-icon"/> {new Date(exam.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                </div>

                <div className="card-footer">
                    <div className="location-info">
                        <FaMapMarkerAlt className="loc-icon"/>
                        <span>{exam.room_code || "Room TBD"}</span>
                    </div>

                    <button className="btn-action-card btn-pulse" onClick={() => handleSelectExam(exam)}>
                        Manage <FaArrowRight/>
                    </button>
                </div>

                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProctorExams;