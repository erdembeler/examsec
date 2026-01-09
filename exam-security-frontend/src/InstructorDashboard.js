import React, { useState, useEffect } from 'react';
import './InstructorDashboard.css';
import { 
  FaChalkboardTeacher, FaRandom, FaExchangeAlt, FaSave, 
  FaChartBar, FaFilePdf, FaCalendarAlt, FaUserEdit, 
  FaSignOutAlt, FaEraser, FaUserGraduate, FaBookOpen 
} from 'react-icons/fa';

// TÜM ÖĞRENCİ LİSTESİ (Veritabanı gibi düşünelim)
// 0706: Yazılım (Sarı), 0704: Bilgisayar (Mavi)
const allStudentsDB = [
  { id: "220706001", name: "Ali (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704001", name: "Veli (Bilgisayar)", dept: "0704", status: "pending", violation: null },
  { id: "220706002", name: "Ayşe (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704002", name: "Fatma (Bilgisayar)", dept: "0704", status: "pending", violation: null },
  { id: "220706003", name: "Mehmet (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704003", name: "Zeynep (Bilgisayar)", dept: "0704", status: "pending", violation: null },
  { id: "220706004", name: "Can (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704004", name: "Elif (Bilgisayar)", dept: "0704", status: "pending", violation: null },
  { id: "220706005", name: "Burak (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704005", name: "Selin (Bilgisayar)", dept: "0704", status: "pending", violation: null },
  { id: "220706006", name: "Oğuz (Yazılım)", dept: "0706", status: "pending", violation: null },
  { id: "220704006", name: "Merve (Bilgisayar)", dept: "0704", status: "pending", violation: null },
];

// DERSLER VE KURALLARI
const courses = [
    { 
        id: 'soft-val', 
        name: 'Software Validation & Testing', 
        allowedDepts: ['0706'] // Sadece Yazılım
    },
    { 
        id: 'algo', 
        name: 'Algorithms Design & Analysis', 
        allowedDepts: ['0706', '0704'] // Ortak Ders
    }
];

const InstructorDashboard = () => {
  // State Tanımları
  const [selectedCourse, setSelectedCourse] = useState(""); // Seçilen Ders
  const [students, setStudents] = useState([]); // O anki dersin öğrencileri
  const [seatingPlan, setSeatingPlan] = useState([]);
  
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);

  const rows = 3; 
  const cols = 4;

  // Sayfa açıldığında boş plan oluştur
  useEffect(() => {
    resetSeatingPlan();
  }, []);

  // Ders Seçimi Değiştiğinde Çalışır
  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    
    if (courseId === "") {
        setStudents([]); // Ders seçilmediyse liste boş
        resetSeatingPlan();
        return;
    }

    const course = courses.find(c => c.id === courseId);
    
    // Veritabanından (allStudentsDB) sadece o dersi alan bölümleri filtrele
    const filteredStudents = allStudentsDB.filter(s => course.allowedDepts.includes(s.dept));
    
    setStudents(filteredStudents);
    resetSeatingPlan(); // Öğrenciler değiştiği için planı sıfırla
  };

  const resetSeatingPlan = () => {
    let plan = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        plan.push({ 
            id: `${r}-${c}`,
            seatLabel: `${String.fromCharCode(65 + r)}-${c + 1}`, 
            student: null 
        });
      }
    }
    setSeatingPlan(plan);
    // Seçim sıfırlanınca student state'i handleCourseChange içinde ayarlandığı için burayı ellemiyoruz
  };

  // --- ALGORİTMALAR (Mevcut student listesine göre çalışır) ---
  const handleRandomize = () => {
    if (students.length === 0) return alert("Lütfen önce bir ders seçin!");
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    fillPlan(shuffled);
  };

  const handleButterfly = () => {
    if (students.length === 0) return alert("Lütfen önce bir ders seçin!");
    
    const software = students.filter(s => s.dept === '0706');
    const computer = students.filter(s => s.dept === '0704');
    
    // Eğer sadece tek bölüm varsa (Örn: Software Validation) uyarı ver veya düz yerleştir
    if (computer.length === 0) {
        alert("Bu derste sadece tek bölüm olduğu için Kelebek Sistemi yerine rastgele dağıtılıyor.");
        handleRandomize();
        return;
    }

    let butterflyList = [];
    const maxLen = Math.max(software.length, computer.length);
    for (let i = 0; i < maxLen; i++) {
        if (software[i]) butterflyList.push(software[i]);
        if (computer[i]) butterflyList.push(computer[i]);
    }
    fillPlan(butterflyList);
  };

  const fillPlan = (studentList) => {
    let newPlan = [];
    let studentIndex = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newPlan.push({ 
            id: `${r}-${c}`,
            seatLabel: `${String.fromCharCode(65 + r)}-${c + 1}`, 
            student: studentList[studentIndex] || null 
        });
        studentIndex++;
      }
    }
    setSeatingPlan(newPlan);
  };

  const handleSeatClick = (seatId) => {
    if (isExamStarted) return alert("Sınav başladı, değişiklik yapılamaz!");
    
    if (selectedStudentForManual) {
        setSeatingPlan(prev => prev.map(seat => {
            if (seat.id === seatId && !seat.student) {
                return { ...seat, student: selectedStudentForManual };
            }
            return seat;
        }));
        setSelectedStudentForManual(null);
    } else {
        setSeatingPlan(prev => prev.map(seat => {
            if (seat.id === seatId && seat.student) {
                return { ...seat, student: null };
            }
            return seat;
        }));
    }
  };

  const handleStartExam = () => {
    if (!selectedCourse) return alert("Lütfen bir ders seçiniz.");
    if (!examDate || !examTime) return alert("Lütfen tarih ve saat giriniz.");
    setIsExamStarted(true);
    alert("Sınav Simülasyonu Başlatıldı.");

    const interval = setInterval(() => {
        setSeatingPlan(prevPlan => {
            return prevPlan.map(seat => {
                if (seat.student && seat.student.status === 'pending') {
                    if (Math.random() > 0.7) {
                        const newStatus = Math.random() > 0.1 ? 'present' : 'absent';
                        return { ...seat, student: { ...seat.student, status: newStatus } };
                    }
                }
                return seat;
            });
        });
    }, 2000);
    setTimeout(() => clearInterval(interval), 15000);
  };

  const getStats = () => {
    let total = 0, present = 0, absent = 0, violations = 0;
    seatingPlan.forEach(seat => {
        if (seat.student) {
            total++;
            if (seat.student.status === 'present') present++;
            if (seat.student.status === 'absent') absent++;
            if (seat.student.violation) violations++;
        }
    });
    return { total, present, absent, violations };
  };
  const stats = getStats();

  // --- RENDER: RAPOR ---
  if (isExamFinished) {
    return (
        <div className="report-wrapper">
            <div className="report-container">
                <header className="report-header">
                    <h2>🏁 Sınav Sonuç Raporu</h2>
                    <div style={{fontSize:'14px', color:'#555'}}>
                        <strong>Ders:</strong> {courses.find(c=>c.id===selectedCourse)?.name}
                    </div>
                    <button className="btn-print" onClick={() => window.print()}><FaFilePdf/> PDF Kaydet</button>
                </header>
                <div className="stats-grid">
                    <div className="stat-box blue">Kayıtlı: {stats.total}</div>
                    <div className="stat-box green">Katılan: {stats.present}</div>
                    <div className="stat-box gray">Gelmeyen: {stats.absent}</div>
                    <div className="stat-box red">İhlal: {stats.violations}</div>
                </div>
                <h3>📋 Oturma Düzeni ve Durumlar</h3>
                <table className="report-table">
                    <thead><tr><th>Sıra</th><th>Öğrenci</th><th>Bölüm</th><th>Durum</th></tr></thead>
                    <tbody>
                        {seatingPlan.filter(s => s.student).map(seat => (
                            <tr key={seat.id} className={seat.student.violation ? 'row-violation' : ''}>
                                <td>{seat.seatLabel}</td>
                                <td>{seat.student.name}</td>
                                <td>{seat.student.dept === '0706' ? 'Yazılım' : 'Bilgisayar'}</td>
                                <td>{seat.student.violation || (seat.student.status === 'present' ? '✅ Katıldı' : '❌ Gelmedi')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="btn-start" style={{marginTop:'20px'}} onClick={() => setIsExamFinished(false)}>Geri Dön</button>
            </div>
        </div>
    );
  }

  // --- RENDER: DASHBOARD ---
  return (
    <div className="inst-wrapper">
      <header className="inst-header">
        <div className="header-left">
            <div className="icon-box"><FaChalkboardTeacher /></div>
            <div>
                <h2>Öğretmen Paneli</h2>
                <p>Hoşgeldin, Dr. Emre Olca</p>
            </div>
        </div>
        <div className="header-right">
            {!isExamStarted ? (
                <button className="btn-start" onClick={handleStartExam}><FaSave /> Sınavı Başlat</button>
            ) : (
                <button className="btn-finish" onClick={() => {if(window.confirm("Sınavı bitir?")) setIsExamFinished(true)}}>
                    <FaChartBar /> Sınavı Bitir
                </button>
            )}
            <button className="btn-logout-header" onClick={() => window.location.href='/'}>
                <FaSignOutAlt /> Çıkış
            </button>
        </div>
      </header>

      <div className="inst-content">
        
        {/* SOL PANEL */}
        <div className="panel settings-panel">
            
            {/* DERS SEÇİMİ (YENİ EKLENDİ) */}
            <div className="form-group highlight-box" style={{background:'#f0f4ff', padding:'15px', borderRadius:'8px', border:'1px solid #d0e0ff'}}>
                <label style={{color:'#0056b3'}}><FaBookOpen/> Aktif Ders Seçimi</label>
                <select 
                    value={selectedCourse} 
                    onChange={handleCourseChange}
                    disabled={isExamStarted}
                    style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #0056b3', fontWeight:'bold'}}
                >
                    <option value="">-- Lütfen Ders Seçiniz --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label><FaCalendarAlt/> Tarih & Saat</label>
                <div style={{display:'flex', gap:'10px'}}>
                    <input type="date" value={examDate} onChange={(e)=>setExamDate(e.target.value)} disabled={isExamStarted}/>
                    <input type="time" value={examTime} onChange={(e)=>setExamTime(e.target.value)} disabled={isExamStarted}/>
                </div>
            </div>

            <hr style={{border:'0', borderTop:'1px solid #eee', width:'100%', margin:'10px 0'}}/>
            
            <h4 style={{margin:'0 0 10px 0', color:'#2c3e50'}}><FaUserEdit/> Yerleştirme</h4>
            <div className="distribution-buttons">
                <button onClick={handleRandomize} disabled={isExamStarted || !selectedCourse} className="btn-action random"><FaRandom /> Rastgele Dağıt</button>
                <button onClick={handleButterfly} disabled={isExamStarted || !selectedCourse} className="btn-action butterfly"><FaExchangeAlt /> Kelebek (Sarı/Mavi)</button>
                <button onClick={resetSeatingPlan} disabled={isExamStarted} className="btn-action reset"><FaEraser /> Temizle</button>
            </div>

            <div className="student-pool-container">
                <h4>
                    Öğrenci Listesi ({students.length})
                    {selectedCourse === 'soft-val' && <span style={{fontSize:'11px', color:'#e67e22', marginLeft:'5px'}}>(Sadece Yazılım)</span>}
                    {selectedCourse === 'algo' && <span style={{fontSize:'11px', color:'#2980b9', marginLeft:'5px'}}>(Ortak)</span>}
                </h4>
                
                {selectedCourse ? (
                    <div className="student-pool">
                        {students.map(student => {
                            const isSeated = seatingPlan.some(seat => seat.student && seat.student.id === student.id);
                            return (
                                <div 
                                    key={student.id} 
                                    className={`pool-item ${student.dept === '0706' ? 'yellow-border' : 'blue-border'} ${selectedStudentForManual?.id === student.id ? 'selected' : ''} ${isSeated ? 'seated-disabled' : ''}`}
                                    onClick={() => !isSeated && !isExamStarted && setSelectedStudentForManual(student)}
                                >
                                    <div>
                                        <div style={{fontWeight:'bold', fontSize:'13px'}}>{student.name}</div>
                                        <div style={{fontSize:'11px', color:'#777'}}>{student.dept === '0706' ? 'Yazılım Müh.' : 'Bilgisayar Müh.'}</div>
                                    </div>
                                    <div className={`dot ${student.dept === '0706' ? 'yellow' : 'blue'}`}></div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div style={{padding:'20px', textAlign:'center', color:'#999', fontStyle:'italic'}}>
                        Listeyi görmek için yukarıdan ders seçiniz.
                    </div>
                )}
            </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="panel classroom-panel">
            <div className="classroom-header">
                <h3>Sınıf Oturma Planı (Öğretmen Masası)</h3>
                <div style={{display:'flex', gap:'15px', fontSize:'13px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot yellow"></span> Yazılım</div>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot blue"></span> Bilgisayar</div>
                </div>
            </div>

            <div className="classroom-grid" style={{gridTemplateColumns: `repeat(${cols}, 1fr)`}}>
                {seatingPlan.map((seat) => {
                    let deptClass = "";
                    let statusClass = "";
                    if (seat.student) {
                        deptClass = seat.student.dept === '0706' ? 'soft-eng-bg' : 'comp-eng-bg';
                        if (isExamStarted) {
                            if (seat.student.status === 'present') statusClass = 'status-present';
                            else if (seat.student.status === 'absent') statusClass = 'status-absent';
                            else statusClass = 'status-pending';
                        }
                    }
                    return (
                        <div 
                            key={seat.id} 
                            className={`seat-box ${seat.student ? 'occupied' : 'empty'} ${deptClass} ${statusClass}`}
                            onClick={() => handleSeatClick(seat.id)}
                        >
                            <span className="seat-number">{seat.seatLabel}</span>
                            {seat.student ? (
                                <div className="seat-student">
                                    <FaUserGraduate className="student-icon"/>
                                    <span className="s-name">{seat.student.name}</span>
                                    <span className="s-id">{seat.student.id}</span>
                                    {isExamStarted && (
                                        <div className="live-badge">
                                            {seat.student.status === 'present' ? '✅ Sınavda' : seat.student.status === 'absent' ? '❌ Yok' : '⏳ Bekliyor'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="empty-label">BOŞ</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;