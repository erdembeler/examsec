import React, { useState, useEffect, useRef } from 'react';
import './StudentDashboard.css'; 
import { api } from './services/api'; // API bağlantısı
import { 
  FaUserGraduate, FaCamera, FaCheckCircle, 
  FaExclamationCircle, FaIdCard, FaTimes, FaSpinner, FaMapMarkerAlt, FaClock
} from 'react-icons/fa';

const StudentDashboard = () => {
  // Kullanıcı Bilgileri
  const studentId = localStorage.getItem('userId') || "Unknown";
  // Demo amaçlı isim sabit, gerçekte /me endpointi ile çekilebilir
  const studentName = "Student User"; 

  // State'ler
  const [activeExam, setActiveExam] = useState(null); // Aktif sınav bilgisi
  const [livePhoto, setLivePhoto] = useState(null);   // Çekilen fotoğraf (gösterim için)
  const [photoBlob, setPhotoBlob] = useState(null);   // API'ye gidecek dosya formatı
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Durumlar: 'idle', 'sending', 'success', 'error'
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState("");
  const [assignedSeat, setAssignedSeat] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 1. Sayfa Açılınca Aktif Sınavı Bul
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const exams = await api.getExams();
        if (exams && exams.length > 0) {
          // Varsayım: İlk gelen sınav aktiftir.
          setActiveExam(exams[0]); 
        }
      } catch (error) {
        console.error("Exam fetch error:", error);
      }
    };
    fetchExam();
  }, []);

  // 2. Kamerayı Aç
  const openCamera = () => {
    setIsCameraOpen(true);
    setStatus("idle");
    setMessage("");
    startVideo();
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera error:", err);
        setMessage("Camera access denied.");
      });
  };

  // 3. Fotoğrafı Çek ve Dosyaya Çevir
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // 1. Ekranda göstermek için Base64 URL
      const photoUrl = canvas.toDataURL('image/jpeg');
      setLivePhoto(photoUrl);

      // 2. API'ye göndermek için Blob (Dosya) oluştur
      canvas.toBlob((blob) => {
        setPhotoBlob(blob);
      }, 'image/jpeg', 0.95);
      
      // Kamerayı durdurma (Kullanıcı beğenmezse tekrar açacak)
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // 4. API'ye Gönder (Check-In)
  // src/StudentDashboard.js içindeki sendToProctor fonksiyonunu güncelle:

  const sendToProctor = async () => {
    if (!photoBlob || !activeExam) return;

    setStatus("sending");
    setMessage("Sending to proctor...");
    
    try {
      const response = await api.checkIn(activeExam.id, studentId, photoBlob);

      // Backend artık her zaman success:true dönecek (dosya bozuk değilse)
      if (response.success) {
        setStatus("success");
        // Koltuk numarasını hemen göstermiyoruz, çünkü onaylanmadı.
        setAssignedSeat("Approval Pending"); 
        setMessage("Photo sent! Please wait for the proctor to admit you.");
        
        // Modalı kapat
        setTimeout(() => {
            setIsCameraOpen(false);
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.message || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("Server connection failed.");
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
        
        {/* Header */}
        <header className="std-header">
           <div className="std-profile">
              <div className="profile-icon"><FaUserGraduate /></div>
              <div className="profile-text">
                <h2>Student Portal</h2>
                <p>{studentName} - {studentId}</p>
              </div>
           </div>
           <button className="btn-logout" onClick={() => window.location.href='/'}>Logout</button>
        </header>

        <div className="std-content">
            
            {/* SINAV KARTI */}
            <div className="std-card exam-card" style={{width: '100%', maxWidth: '600px', margin: '0 auto'}}>
                <div className="card-badge">Active Exam</div>
                
                {activeExam ? (
                    <>
                        <h3>{activeExam.title}</h3>
                        <div className="exam-details">
                            <span><FaClock/> {new Date(activeExam.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span><FaMapMarkerAlt/> {activeExam.room_code || "Room TBD"}</span>
                        </div>

                        <hr className="divider"/>

                        <div className="exam-action">
                            {status === 'success' ? (
                                <div className="status-box success">
                                    <FaCheckCircle size={32} style={{marginBottom:'10px'}}/>
                                    <h2 style={{margin:0}}>{assignedSeat}</h2>
                                    <p>Your Seat Number</p>
                                    <small>Checked in successfully</small>
                                </div>
                            ) : (
                                <>
                                    <p className="info-text" style={{marginBottom:'15px', color:'#555'}}>
                                        Please verify your identity to view your seat number.
                                    </p>
                                    <button className="btn-start-exam" onClick={openCamera}>
                                        <FaIdCard/> Start Face Verification
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{padding:'30px', textAlign:'center', color:'#777'}}>
                        <FaExclamationCircle size={30}/>
                        <p>No active exams found for today.</p>
                    </div>
                )}
            </div>

        </div>

      </div>

      {/* --- YÜZ TARAMA MODALI (POPUP) --- */}
      {isCameraOpen && (
        <div className="camera-modal-overlay">
            <div className="camera-modal">
                <div className="modal-header">
                    <h3>Identity Verification</h3>
                    <button className="btn-close" onClick={closeCamera}><FaTimes/></button>
                </div>
                
                <div className="camera-view">
                    {status === 'sending' && (
                        <div className="loader-overlay">
                            <FaSpinner className="fa-spin" size={40} color="white"/>
                            <p>Verifying with AI...</p>
                        </div>
                    )}

                    {!livePhoto ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
                            <div className="scan-line"></div> 
                            <p className="camera-hint">Position your face in the frame</p>
                        </>
                    ) : (
                        <img src={livePhoto} alt="Captured" className="captured-img" />
                    )}
                    <canvas ref={canvasRef} style={{display:'none'}}></canvas>
                </div>

                {/* DURUM MESAJI */}
                {message && (
                    <div className={`status-message ${status}`}>
                        {status === 'error' && <FaExclamationCircle/>}
                        {status === 'success' && <FaCheckCircle/>}
                        {message}
                    </div>
                )}

                <div className="modal-actions">
                    {!livePhoto ? (
                        <button className="btn-capture" onClick={capturePhoto}>
                            <FaCamera/> Capture Photo
                        </button>
                    ) : (
                        status !== 'success' && status !== 'sending' && (
                            <div className="action-buttons">
                                <button className="btn-retry" onClick={retryPhoto}>Retake</button>
                                <button className="btn-send" onClick={sendToProctor}>
                                    Confirm & Send
                                </button>
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