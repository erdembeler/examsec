import React, { useState } from 'react';
import './StudentDashboard.css'; // Yeni CSS dosyasını bağlıyoruz
import { FaUserGraduate, FaCamera, FaUpload, FaPlayCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const StudentDashboard = () => {
  const studentName = "Emre Olca";
  const studentId = localStorage.getItem('userId');
  
  // Fotoğrafın yüklenip yüklenmediğini takip eden state
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Sahte Fotoğraf Yükleme Fonksiyonu
  const handlePhotoUpload = () => {
    // Gerçekte burada dosya seçtirme penceresi açılır.
    // Biz şimdilik yüklenmiş gibi yapıyoruz.
    setUploadedImage("https://randomuser.me/api/portraits/men/32.jpg"); // Örnek resim
    setPhotoUploaded(true);
    alert("Fotoğrafınız başarıyla sisteme yüklendi!");
  };

  const handleJoinExam = () => {
    if (!photoUploaded) return; // Güvenlik önlemi
    alert("Sınav oturumu başlatılıyor...");
    // window.location.href = '/exam-session'; // İleride sınav sayfasına gidecek
  };

  return (
    <div className="std-dashboard-wrapper">
      <div className="std-container">
        
        {/* Üst Bilgi Kartı */}
        <header className="std-header">
           <div className="std-profile">
              <div className="profile-icon">
                <FaUserGraduate />
              </div>
              <div className="profile-text">
                <h2>Öğrenci Paneli</h2>
                <p>{studentName} - {studentId}</p>
              </div>
           </div>
           <button className="btn-logout" onClick={() => window.location.href='/'}>Çıkış Yap</button>
        </header>

        <div className="std-content">
            
            {/* SOL TARAF: Sınav Bilgisi */}
            <div className="std-card exam-card">
                <div className="card-badge">Aktif Sınav</div>
                <h3>Yazılım Test ve Doğrulama</h3>
                <div className="exam-details">
                  <span>📅 09.01.2025</span>
                  <span>⏰ 14:00</span>
                  <span>⏳ 60 Dk</span>
                </div>
                
                <hr className="divider"/>

                <div className="exam-action">
                   {photoUploaded ? (
                     // Fotoğraf VARSA buton aktif
                     <>
                        <p className="success-text"><FaCheckCircle/> Kimlik doğrulama tamamlandı.</p>
                        <button className="btn-start-exam" onClick={handleJoinExam}>
                            <FaPlayCircle/> Sınava Katıl
                        </button>
                     </>
                   ) : (
                     // Fotoğraf YOKSA buton pasif ve uyarı var
                     <>
                        <p className="warning-text"><FaExclamationCircle/> Sınava katılmak için önce fotoğraf yüklemelisiniz.</p>
                        <button className="btn-start-exam disabled" disabled>
                            Sınava Katıl (Kilitli)
                        </button>
                     </>
                   )}
                </div>
            </div>

            {/* SAĞ TARAF: Fotoğraf Yükleme (ZORUNLU ALAN) */}
            <div className={`std-card upload-card ${photoUploaded ? 'completed' : ''}`}>
                <h4><FaCamera/> Kimlik Doğrulama</h4>
                <p className="upload-desc">
                  Sınav güvenliği gereği güncel yüz fotoğrafınızı yüklemeniz gerekmektedir.
                </p>
                
                <div className="upload-area">
                    {uploadedImage ? (
                        <div className="preview-box">
                            <img src={uploadedImage} alt="Yüklenen" />
                            <span className="verified-badge"><FaCheckCircle/> Yüklendi</span>
                        </div>
                    ) : (
                        <div className="placeholder-box">
                            <FaUserGraduate size={50} color="#ddd"/>
                            <span>Fotoğraf Bekleniyor...</span>
                        </div>
                    )}
                </div>

                {!photoUploaded && (
                    <div className="upload-buttons">
                        <button className="btn-upload" onClick={handlePhotoUpload}>
                            <FaUpload/> Dosya Seç
                        </button>
                        <button className="btn-camera" onClick={handlePhotoUpload}>
                            <FaCamera/> Fotoğraf Çek
                        </button>
                    </div>
                )}
            </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;