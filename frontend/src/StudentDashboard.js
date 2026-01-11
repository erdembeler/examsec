import React, { useState, useEffect, useRef } from 'react';
import './StudentDashboard.css'; 
import { api, API_URL } from './services/api'; 
import { 
  FaUserGraduate, FaCamera, FaCheckCircle, 
  FaExclamationCircle, FaIdCard, FaTimes, FaSpinner 
} from 'react-icons/fa';

const StudentDashboard = () => {
  // localStorage'dan bilgileri al
  const studentName = localStorage.getItem('fullName') || "Student";
  const studentId = localStorage.getItem('userId') || "None";
  const referencePhoto = localStorage.getItem('referencePhoto'); // ✅ Direkt localStorage'dan

  // State tanımları
  const [activeExam, setActiveExam] = useState(null);
  const [livePhoto, setLivePhoto] = useState(null); 
  const [photoBlob, setPhotoBlob] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("idle");

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ✅ Sadece sınavları çek, fotoğraf localStorage'dan geliyor
useEffect(() => {
  const init = async () => {
    try {
      // ✅ Sadece bu öğrencinin kayıtlı olduğu aktif sınavları getir
      const exams = await api.getStudentExams(studentId);
      
      if (exams && exams.length > 0) {
        setActiveExam(exams[0]);
      } else {
        setActiveExam(null);
      }
    } catch (error) {
      console.error(error);
    }
  };
  init();
}, [studentId]);


  const openCamera = () => {
    setIsCameraOpen(true);
    setVerificationStatus("idle");
    startVideo();
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => console.error("Kamera hatası:", err));
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      setLivePhoto(canvas.toDataURL('image/jpeg'));

      canvas.toBlob((blob) => {
        setPhotoBlob(blob);
      }, 'image/jpeg', 0.95);
      
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const sendToProctor = async () => {
    if (!photoBlob || !activeExam) return alert("Fotoğraf hatası!");

    setVerificationStatus("sending");
    
    try {
      const response = await api.checkIn(activeExam.id, studentId, photoBlob);
      
      if (response.success) {
        setVerificationStatus("success");
        setTimeout(() => {
          setIsCameraOpen(false);
          setLivePhoto(null);
          setPhotoBlob(null);
        }, 2000);
      } else {
        setVerificationStatus("error");
        alert("Hata: " + response.message);
      }
    } catch (error) {
      setVerificationStatus("error");
      alert("Sunucu hatası!");
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setLivePhoto(null);
    setPhotoBlob(null);
  };

  const retryPhoto = () => {
    setLivePhoto(null);
    setPhotoBlob(null);
    startVideo();
  };

  return (
    <div className="std-dashboard-wrapper">
      <div className="std-container">
        <header className="std-header">
          <div className="std-profile">
            <div className="profile-icon"><FaUserGraduate /></div>
            <div className="profile-text">
              <h2>Student Panel</h2>
              <p>{studentName} ({studentId})</p>
            </div>
          </div>
          <button className="btn-logout" onClick={() => window.location.href='/'}>Çıkış</button>
        </header>

        <div className="std-content">
          {/* SINAV KARTI */}
          <div className="std-card exam-card">
            <div className="card-badge">Active</div>
            {activeExam ? (
              <>
                <h3>{activeExam.title}</h3>
                <div className="exam-details">
                  <span>📅 {new Date(activeExam.date).toLocaleDateString()}</span>
                  <span>⏰ {new Date(activeExam.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  <span>📍 {activeExam.room_code || "Online"}</span>
                </div>
                <hr className="divider"/>
                <div className="exam-action">
                  {verificationStatus === 'success' ? (
                    <div className="status-box success">
                      <FaCheckCircle/> <p>Sent! Waiting for verify.</p>
                    </div>
                  ) : (
                    <button className="btn-start-exam" onClick={openCamera}>
                      <FaIdCard/> Enter the Exam
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p>No Active Exam.</p>
            )}
          </div>

{/* REFERANS FOTOĞRAF BÖLÜMÜ */}
<div className="reference-section">
  <h3><FaIdCard /> Local Photo</h3>
  <p className="section-subtitle">Your MUBIS photo</p>
  <div className="reference-photo-container">
    {referencePhoto ? (
      <img 
        src={referencePhoto.startsWith('http') ? referencePhoto : `${API_URL}/images/${referencePhoto}`} 
        alt="Referans Fotoğraf" 
        className="reference-photo"
      />
    ) : (
      <div className="no-photo">
        <FaExclamationCircle />
        <span>No Photograph</span>
      </div>
    )}
  </div>
</div>

        </div>
      </div>

      {/* KAMERA MODAL */}
      {isCameraOpen && (
        <div className="camera-modal-overlay">
          <div className="camera-modal">
            <div className="modal-header">
              <h3>Face Recognation</h3>
              <button className="btn-close" onClick={closeCamera}><FaTimes/></button>
            </div>
            <div className="camera-view">
              {verificationStatus === 'sending' && (
                <div className="loader-overlay">
                  <FaSpinner className="fa-spin"/> Sending...
                </div>
              )}
              {!livePhoto ? (
                <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
              ) : (
                <img src={livePhoto} className="captured-img" alt="Çekilen fotoğraf"/>
              )}
              <canvas ref={canvasRef} style={{display:'none'}}></canvas>
            </div>
            <div className="modal-actions">
              {!livePhoto ? (
                <button className="btn-capture" onClick={capturePhoto}>
                  <FaCamera/> SNAP
                </button>
              ) : (
                verificationStatus !== 'sending' && verificationStatus !== 'success' && (
                  <div className="action-buttons">
                    <button className="btn-retry" onClick={retryPhoto}>Retake</button>
                    <button className="btn-send" onClick={sendToProctor}>Sent</button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
