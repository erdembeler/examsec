import React, { useState, useEffect, useRef } from 'react';
import './StudentDashboard.css'; 
import { api } from './services/api'; 
import { 
  FaUserGraduate, FaCamera, FaUpload, FaCheckCircle, 
  FaExclamationCircle, FaIdCard, FaTimes, FaSpinner 
} from 'react-icons/fa';

const StudentDashboard = () => {
  const studentName = localStorage.getItem('fullName') || "Öğrenci";
  const studentId = localStorage.getItem('userId') || "Bilinmiyor";
  
  const [activeExam, setActiveExam] = useState(null);
  const [referencePhoto, setReferencePhoto] = useState(null);
  const [livePhoto, setLivePhoto] = useState(null); 
  const [photoBlob, setPhotoBlob] = useState(null); // GERÇEK DOSYA VERİSİ
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("idle");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const exams = await api.getExams();
        if (exams && exams.length > 0) setActiveExam(exams[0]); 
      } catch (error) { console.error(error); }
    };
    init();
  }, []);

  const handleReferenceUpload = () => {
    setReferencePhoto("https://randomuser.me/api/portraits/men/32.jpg");
    alert("Referans fotoğraf yüklendi (Demo).");
  };

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
      
      // Ekranda göstermek için
      setLivePhoto(canvas.toDataURL('image/jpeg'));

      // Backend'e göndermek için (Blob)
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
        // Gerçek API isteği (api.js içindeki checkIn fonksiyonu kullanılacak)
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
              <div className="profile-text"><h2>Öğrenci Paneli</h2><p>{studentName} ({studentId})</p></div>
           </div>
           <button className="btn-logout" onClick={() => window.location.href='/'}>Çıkış</button>
        </header>

        <div className="std-content">
            <div className="std-card exam-card">
                <div className="card-badge">Aktif</div>
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
                                <div className="status-box success"><FaCheckCircle/> <p>Gönderildi! Onay Bekleniyor.</p></div>
                            ) : (
                                <button className="btn-start-exam" onClick={openCamera}><FaIdCard/> Sınava Giriş Yap</button>
                            )}
                        </div>
                    </>
                ) : (<p>Sınav yok.</p>)}
            </div>

            <div className={`std-card upload-card ${referencePhoto ? 'completed' : ''}`}>
                <h4><FaCamera/> Referans Fotoğraf</h4>
                <div className="upload-area">
                    {referencePhoto ? (
                        <div className="preview-box"><img src={referencePhoto} alt="Ref"/><span className="verified-badge">Yüklendi</span></div>
                    ) : (<div className="placeholder-box">Fotoğraf Yok</div>)}
                </div>
                {!referencePhoto && <button className="btn-upload" onClick={handleReferenceUpload}><FaUpload/> Yükle (Demo)</button>}
            </div>
        </div>
      </div>

      {isCameraOpen && (
        <div className="camera-modal-overlay">
            <div className="camera-modal">
                <div className="modal-header"><h3>Yüz Doğrulama</h3><button className="btn-close" onClick={closeCamera}><FaTimes/></button></div>
                <div className="camera-view">
                    {verificationStatus === 'sending' && <div className="loader-overlay"><FaSpinner className="fa-spin"/> Gönderiliyor...</div>}
                    {!livePhoto ? <video ref={videoRef} autoPlay playsInline className="video-feed"></video> : <img src={livePhoto} className="captured-img" alt="c"/>}
                    <canvas ref={canvasRef} style={{display:'none'}}></canvas>
                </div>
                <div className="modal-actions">
                    {!livePhoto ? <button className="btn-capture" onClick={capturePhoto}><FaCamera/> Çek</button> : 
                        verificationStatus !== 'sending' && verificationStatus !== 'success' && (
                            <div className="action-buttons">
                                <button className="btn-retry" onClick={retryPhoto}>Tekrar</button>
                                <button className="btn-send" onClick={sendToProctor}>Gönder</button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;