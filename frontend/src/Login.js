import { api } from './services/api';
import React, { useState } from 'react';
import './Login.css';
import { 
  FaUser, 
  FaLock, 
  FaShieldAlt, 
  FaArrowRight, 
  FaUniversity, 
  FaIdCard, 
  FaChalkboardTeacher 
} from 'react-icons/fa';

const Login = () => {
  // Varsayılan olarak 'student' seçili gelsin
  // Test kolaylığı için başlangıç değerlerini dolu getiriyoruz
  const [role, setRole] = useState('student'); 
  const [identifier, setIdentifier] = useState('220706010'); 
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');

  // Role göre input etiketini ve ikonunu değiştiren yapı
const getInputConfig = () => {
    switch(role) {
      case 'student':
        return { 
          label: 'Student Number', 
          placeholder: 'Ex: 220706010', 
          icon: <FaIdCard />, 
          type: 'text' 
        };
      case 'admin': // Artık "Instructor" olarak geçecek
        return { 
          label: 'Username', 
          placeholder: 'admin', 
          icon: <FaUniversity />, 
          type: 'text' 
        };
      case 'proctor':
        return { 
          label: 'Proctor Username', 
          placeholder: 'proctor_01', 
          icon: <FaChalkboardTeacher />, 
          type: 'text' 
        };
      default:
        return { label: 'Username', placeholder: '', icon: <FaUser />, type: 'text' };
    }
  };

  const config = getInputConfig();

  // Rol butonuna basınca inputu temizle veya test verisiyle doldur
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    
    // --- TEST İÇİN OTOMATİK DOLDURMA ---
    if(newRole === 'student') {
        setIdentifier('220706010'); setPassword('123');
    } else if(newRole === 'admin') {
        setIdentifier('emreolca@maltepe.edu.tr'); setPassword('123456');
    } else if(newRole === 'proctor') {
        setIdentifier('gozetmen_01'); setPassword('test123');
    } else {
        setIdentifier(''); setPassword('');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // --- MOCK (SAHTE) GİRİŞ KONTROLÜ ---
    // Backend hazır olana kadar şifreleri burada kontrol ediyoruz.
    let isSuccess = false;

    if (role === 'student' && identifier === '220706010' && password === '123') {
      isSuccess = true;
    } 
    else if (role === 'admin' && identifier === 'emreolca@maltepe.edu.tr' && password === '123456') {
      isSuccess = true;
    }
    else if (role === 'proctor' && identifier === 'gozetmen_01' && password === 'test123') {
      isSuccess = true;
    }

    if (isSuccess) {
      console.log("Giriş Başarılı: ", role);
      
      // Giriş bilgilerini tarayıcı hafızasına kaydet
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', identifier);

      // --- YÖNLENDİRME MANTIĞI ---
      if (role === 'student') {
        window.location.href = '/student/dashboard';    // Öğrenci Paneli
      } else if (role === 'proctor') {
        window.location.href = '/proctor/exams';        // Gözetmen Sınav Seçimi
      } else if (role === 'admin') {
        window.location.href = '/instructor/dashboard'; // Öğretmen (Oturma Planı) Paneli
      }
      
    } else {
      setError('Hatalı bilgi! Lütfen belirlediğimiz test şifrelerini kullanın.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        <div className="login-header">
          <div className="icon-circle">
            <FaShieldAlt />
          </div>
          <h2>Exam Security System</h2>
          <p>Lütfen giriş türünü seçiniz</p>
        </div>

        {/* ROL SEÇİM BUTONLARI */}
        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'student' ? 'active' : ''}`} 
            onClick={() => handleRoleChange('student')}
          >
            Öğrenci
          </button>
          <button 
            className={`role-btn ${role === 'admin' ? 'active' : ''}`} 
            onClick={() => handleRoleChange('admin')}
          >
            Öğretmen
          </button>
          <button 
            className={`role-btn ${role === 'proctor' ? 'active' : ''}`} 
            onClick={() => handleRoleChange('proctor')}
          >
            Gözetmen
          </button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>{config.label}</label>
            <div className="input-field">
              <span className="icon">{config.icon}</span>
              <input 
                type={config.type}
                placeholder={config.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Şifre</label>
            <div className="input-field">
              <span className="icon"><FaLock /></span>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <label className="remember-me">
                <input type="checkbox" /> Beni Hatırla
            </label>
            <a href="#!" className="forgot-password">Şifremi Unuttum?</a>
          </div>

          <button type="submit" className="btn-login">
            Giriş Yap <FaArrowRight style={{ marginLeft: '8px' }} />
          </button>
        </form>

        <div className="login-footer">
          <p>Software Testing & Validation Final Project</p>
        </div>
      </div>
    </div>
  );
};

export default Login;