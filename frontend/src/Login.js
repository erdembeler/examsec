import React, { useState, useEffect } from 'react';
import './Login.css';
import { api } from './services/api';
import { 
  FaUser, FaLock, FaShieldAlt, FaArrowRight, FaUniversity, 
  FaIdCard, FaChalkboardTeacher, FaSpinner 
} from 'react-icons/fa';

const Login = () => {
  // Varsayılan olarak Öğrenci seçili ve bilgileri dolu gelsin
  const [role, setRole] = useState('student'); 
  const [identifier, setIdentifier] = useState('220706001'); 
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rol butonlarına basınca bilgileri otomatik doldur
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');

    if (newRole === 'student') {
      setIdentifier('220706001');
      setPassword('123456');
    } else if (newRole === 'admin') {
      setIdentifier('instructor1');
      setPassword('123456');
    } else if (newRole === 'proctor') {
      setIdentifier('proctor1');
      setPassword('123456');
    } else {
      setIdentifier('');
      setPassword('');
    }
  };

  const getInputConfig = () => {
    switch(role) {
      case 'student':
        return { label: 'Student Number', placeholder: '220706011', icon: <FaIdCard />, type: 'text' };
      case 'admin':
        return { label: 'Username', placeholder: 'admin_erdem', icon: <FaUniversity />, type: 'text' };
      case 'proctor':
        return { label: 'Proctor Username', placeholder: 'proctor_ali', icon: <FaChalkboardTeacher />, type: 'text' };
      default:
        return { label: 'Username', placeholder: '', icon: <FaUser />, type: 'text' };
    }
  };

  const config = getInputConfig();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.login(identifier, password, role);

      if (response.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', identifier);
        localStorage.setItem('referencePhoto', response.referencePhoto || '')

        if (role === 'student') window.location.href = '/student/dashboard';
        else if (role === 'proctor') window.location.href = '/proctor/exams';
        else if (role === 'admin') window.location.href = '/instructor/dashboard';
      } else {
        setError(response.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        <div className="login-header">
          <div className="icon-circle"><FaShieldAlt /></div>
          <h2>Exam Security System</h2>
          <p>Select login type (Auto-fill enabled)</p>
        </div>

        <div className="role-selector">
          <button className={`role-btn ${role === 'student' ? 'active' : ''}`} onClick={() => handleRoleChange('student')}>Student</button>
          <button className={`role-btn ${role === 'admin' ? 'active' : ''}`} onClick={() => handleRoleChange('admin')}>Instructor</button>
          <button className={`role-btn ${role === 'proctor' ? 'active' : ''}`} onClick={() => handleRoleChange('proctor')}>Proctor</button>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}

          <div className="input-group">
            <label>{config.label}</label>
            <div className="input-field">
              <span className="icon">{config.icon}</span>
              <input 
                type={config.type} 
                value={identifier} 
                onChange={(e) => setIdentifier(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field">
              <span className="icon"><FaLock /></span>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? <><FaSpinner className="fa-spin"/> Logging in...</> : <>Login <FaArrowRight style={{marginLeft:'8px'}}/></>}
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