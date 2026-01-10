import React, { useState, useEffect, useRef } from 'react';
import './InstructorDashboard.css';
import { api } from './services/api';
import { 
  FaChalkboardTeacher, FaRandom, FaExchangeAlt, FaSave, 
  FaChartBar, FaFilePdf, FaUserEdit, 
  FaSignOutAlt, FaEraser, FaUserGraduate, FaBookOpen, FaSpinner, FaSync
} from 'react-icons/fa';

const InstructorDashboard = () => {
  // --- STATE TANIMLARI ---
  const [exams, setExams] = useState([]);           
  const [selectedExamId, setSelectedExamId] = useState(""); 
  const [studentsInClass, setStudentsInClass] = useState([]); 

  const [seatingPlan, setSeatingPlan] = useState([]); 
  const [loading, setLoading] = useState(false);      
  
  // Sınav Durumu
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [selectedStudentForManual, setSelectedStudentForManual] = useState(null);
  // Sınav Oluşturma Modal
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [newExam, setNewExam] = useState({
  title: '',
  date: '',
  time: '',
  room_code: '',
  code: '',
  departments: [] 
});
const [creating, setCreating] = useState(false);

  // Polling (Sürekli Kontrol) için referans
  const pollingRef = useRef(null);

  const rows = 3; 
  const cols = 4;

  // 1. SAYFA AÇILINCA: Sınav Listesini Çek
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const data = await api.getExams();
        setExams(data);
      } catch (error) {
        console.error("Failed to fetch exams:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
    resetSeatingPlan();
    
    // Sayfadan çıkarsa polling'i durdur
    return () => stopPolling();
  }, []);

  // 2. POLLING MEKANİZMASI (CANLI TAKİP)
  // Sınav başladığında devreye girer, 3 saniyede bir verileri günceller.
  useEffect(() => {
    if (isExamStarted && selectedExamId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isExamStarted, selectedExamId]);

  const startPolling = () => {
    // Eğer zaten çalışıyorsa tekrar başlatma
    if (pollingRef.current) return;

    console.log("📡 Canlı takip başlatıldı...");
    pollingRef.current = setInterval(async () => {
      try {
        // Veritabanından en güncel durumları çek
        const freshStudents = await api.getExamStudents(selectedExamId);
        
        // Oturma planındaki öğrencilerin durumunu güncelle
        setSeatingPlan(prevPlan => {
            return prevPlan.map(seat => {
                // Koltuk boşsa elleme
                if (!seat.student) return seat;

                // Koltuktaki öğrenciyi gelen taze listede bul
                const freshData = freshStudents.find(s => s.id === seat.student.id);
                
                // Eğer veri varsa ve durumu değişmişse güncelle
                if (freshData && freshData.status !== seat.student.status) {
                    return {
                        ...seat,
                        student: {
                            ...seat.student,
                            status: freshData.status // 'present', 'pending' vb.
                        }
                    };
                }
                return seat;
            });
        });

      } catch (error) {
        console.error("Polling hatası:", error);
      }
    }, 3000); // 3 Saniyede bir kontrol et
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      console.log("🔕 Canlı takip durduruldu.");
    }
  };

  // 3. SINAV SEÇİLİNCE
  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    setIsExamStarted(false);
    setIsExamFinished(false);
  
    
    if (examId === "") {
        setStudentsInClass([]); 
        resetSeatingPlan();
        return;
    }

    try {
        setLoading(true);
        const students = await api.getExamStudents(examId);
        setStudentsInClass(students);
        resetSeatingPlan(); 
    } catch (err) {
        console.error("Failed to fetch student list:", err);
    } finally {
        setLoading(false);
    }
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
  };
const handleCreateExam = async (e) => {
  e.preventDefault();
  
  if (!newExam.title || !newExam.date || !newExam.time) {
    return alert('Lütfen zorunlu alanları doldurun!');
  }
  
  if (newExam.departments.length === 0) {
    return alert('En az bir bölüm seçmelisiniz!');
  }

  setCreating(true);
  
  try {
    const dateTime = `${newExam.date}T${newExam.time}:00`;
    
    const response = await api.createExam({
      title: newExam.title,
      date: dateTime,
      room_code: newExam.room_code,
      code: newExam.code,
      departments: newExam.departments.join(',')  // ✅ "0706,0704" formatında
    });

    if (response.success) {
      alert('Sınav başarıyla oluşturuldu!');
      setIsCreateModalOpen(false);
      setNewExam({ title: '', date: '', time: '', room_code: '', code: '', departments: [] });
      
      const data = await api.getExams();
      setExams(data);
    } else {
      alert('Hata: ' + (response.message || 'Sınav oluşturulamadı'));
    }
  } catch (error) {
    console.error(error);
    alert('Sunucu hatası!');
  } finally {
    setCreating(false);
  }
};

  // --- ALGORİTMALAR ---
  const handleRandomize = () => {
    if (studentsInClass.length === 0) return alert("Please select an exam first!");
    const shuffled = [...studentsInClass].sort(() => 0.5 - Math.random());
    fillPlan(shuffled);
  };

  const handleButterfly = () => {
    if (studentsInClass.length === 0) return alert("Please select an exam first!");
    const software = studentsInClass.filter(s => s.dept === '0706');
    const computer = studentsInClass.filter(s => s.dept === '0704');
    
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
    if (isExamStarted) return alert("Exam started, cannot modify seats!");
    
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

  // SINAVI BAŞLAT (ARTIK RANDOM YOK!)
const handleStartExam = async () => {
  if (!selectedExamId) return alert("Please select an exam.");
  
  // Oturma planından dolu koltukları al
  const seats = seatingPlan
    .filter(seat => seat.student)
    .map(seat => ({
      student_id: seat.student.id,
      seat_code: seat.seatLabel
    }));

  if (seats.length === 0) {
    return alert("Lütfen önce öğrencileri koltuklara yerleştirin!");
  }

  try {
    // ✅ Önce oturma planını kaydet
    const saveResponse = await api.saveSeatingPlan(selectedExamId, seats);
    
    if (!saveResponse.success) {
      return alert("Oturma planı kaydedilemedi: " + saveResponse.message);
    }
    
    console.log("✅ Oturma planı kaydedildi");
    
    // Sonra sınavı başlat
    setIsExamStarted(true);
    alert("Sınav başlatıldı! Oturma planı kaydedildi.");
    
  } catch (error) {
    console.error(error);
    alert("Sunucu hatası!");
  }
};

const handleFinishExam = async () => {
  if (!window.confirm("Sınavı bitirmek istediğinize emin misiniz?")) return;
  
  try {
    const response = await api.finishExam(selectedExamId);
    
    if (response.success) {
      setIsExamFinished(true);
      stopPolling();
      
      // Sınav listesini güncelle
      const data = await api.getExams();
      setExams(data);
    } else {
      alert("Hata: " + response.message);
    }
  } catch (error) {
    console.error(error);
    alert("Sunucu hatası!");
  }
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

  // --- RENDER ---
  if (isExamFinished) {
    const examInfo = exams.find(e => String(e.id) === selectedExamId);
    return (
        <div className="report-wrapper">
            <div className="report-container">
                <header className="report-header">
                    <h2>🏁 Exam Result Report</h2>
                    <div style={{fontSize:'14px', color:'#555'}}>
                        <strong>Exam:</strong> {examInfo?.title || "Unknown"}
                    </div>
                    <button className="btn-print" onClick={() => window.print()}><FaFilePdf/> Save PDF</button>
                </header>
                <div className="stats-grid">
                    <div className="stat-box blue">Enrolled: {stats.total}</div>
                    <div className="stat-box green">Present: {stats.present}</div>
                    <div className="stat-box gray">Absent: {stats.absent}</div>
                    <div className="stat-box red">Violations: {stats.violations}</div>
                </div>
                <h3>📋 Seating & Attendance Log</h3>
                <table className="report-table">
                    <thead><tr><th>Seat</th><th>Student</th><th>Dept</th><th>Status</th></tr></thead>
                    <tbody>
                        {seatingPlan.filter(s => s.student).map(seat => (
                            <tr key={seat.id} className={seat.student.violation ? 'row-violation' : ''}>
                                <td>{seat.seatLabel}</td>
                                <td>{seat.student.name}</td>
                                <td>{seat.student.dept === '0706' ? 'Software' : 'Computer'}</td>
                                <td>{seat.student.violation || (seat.student.status === 'present' ? '✅ Present' : '❌ Absent')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="btn-start" style={{marginTop:'20px'}} onClick={() => {
  setIsExamFinished(false);
  setIsExamStarted(false);  // ✅ Bunu ekle
  setSelectedExamId("");     // ✅ Sınav seçimini de sıfırla
  resetSeatingPlan();        // ✅ Oturma planını temizle
}}
>Go Back</button>
            </div>
        </div>
    );
  }

  return (
    <div className="inst-wrapper">
      <header className="inst-header">
        <div className="header-left">
            <div className="icon-box"><FaChalkboardTeacher /></div>
            <div>
                <h2>Instructor Dashboard</h2>
                <p>Exam Configuration Panel</p>
            </div>
                <button className="btn-create-exam" onClick={() => setIsCreateModalOpen(true)}>
      <FaBookOpen /> Sınav Oluştur
    </button>
        </div>
        <div className="header-right">
            
            {!isExamStarted ? (
                <button className="btn-start" onClick={handleStartExam}><FaSave /> Start Exam Monitor</button>
            ) : (
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <span style={{color:'#2ecc71', fontWeight:'bold', fontSize:'14px', display:'flex', alignItems:'center', gap:'5px'}}>
                        <FaSync className="fa-spin"/> Live
                    </span>
                    <button className="btn-finish" onClick={handleFinishExam}>
  <FaChartBar /> Finish Exam
</button>

                </div>
            )}
            <button className="btn-logout-header" onClick={() => window.location.href='/'}>
                <FaSignOutAlt /> Logout
            </button>
        </div>
      </header>

      <div className="inst-content">
        
        {/* AYARLAR */}
        <div className="panel settings-panel">
            <div className="form-group highlight-box" style={{background:'#f0f4ff', padding:'15px', borderRadius:'8px', border:'1px solid #d0e0ff'}}>
                <label style={{color:'#0056b3'}}><FaBookOpen/> Select Active Exam</label>
                {loading ? (
                    <div style={{color:'#666'}}><FaSpinner className="fa-spin"/> Loading data...</div>
                ) : (
                    <select value={selectedExamId} onChange={handleExamChange}>
  <option value="">-- Sınav Seçin --</option>
  {exams.map(exam => (
    <option key={exam.id} value={exam.id}>
      {exam.title} {exam.is_active ? '🟢' : '🔴 (Bitmiş)'}
    </option>
  ))}
</select>

                )}
            </div>

            <hr style={{border:'0', borderTop:'1px solid #eee', width:'100%', margin:'10px 0'}}/>
            <h4 style={{margin:'0 0 10px 0', color:'#2c3e50'}}><FaUserEdit/> Auto-Seating</h4>
            <div className="distribution-buttons">
                <button onClick={handleRandomize} disabled={isExamStarted || !selectedExamId} className="btn-action random"><FaRandom /> Randomize</button>
                <button onClick={handleButterfly} disabled={isExamStarted || !selectedExamId} className="btn-action butterfly"><FaExchangeAlt /> Butterfly</button>
                <button onClick={resetSeatingPlan} disabled={isExamStarted} className="btn-action reset"><FaEraser /> Clear</button>
            </div>

            <div className="student-pool-container">
                <h4>
                    Student Database ({studentsInClass.length})
                    <span style={{fontSize:'10px', fontWeight:'normal', color:'#888', marginLeft:'5px'}}>(From Backend)</span>
                </h4>
                {selectedExamId ? (
                    <div className="student-pool">
                        {studentsInClass.length === 0 ? (
                           <div style={{color:'#999', fontSize:'12px', fontStyle:'italic'}}>
                                No students enrolled.
                           </div>
                        ) : (
                            studentsInClass.map(student => {
                                const isSeated = seatingPlan.some(seat => seat.student && seat.student.id === student.id);
                                return (
                                    <div 
                                        key={student.id} 
                                        className={`pool-item ${student.dept === '0706' ? 'yellow-border' : 'blue-border'} ${selectedStudentForManual?.id === student.id ? 'selected' : ''} ${isSeated ? 'seated-disabled' : ''}`}
                                        onClick={() => !isSeated && !isExamStarted && setSelectedStudentForManual(student)}
                                    >
                                        <div>
                                            <div style={{fontWeight:'bold', fontSize:'13px'}}>{student.name}</div>
                                            <div style={{fontSize:'11px', color:'#777'}}>{student.dept === '0706' ? 'Software' : 'Computer'}</div>
                                        </div>
                                        <div className={`dot ${student.dept === '0706' ? 'yellow' : 'blue'}`}></div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                ) : (
                    <div style={{padding:'20px', textAlign:'center', color:'#999', fontStyle:'italic'}}>
                        Please select an exam to load students.
                    </div>
                )}
            </div>
        </div>
{/* SINAV OLUŞTURMA MODAL */}
{isCreateModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2><FaBookOpen /> Yeni Sınav Oluştur</h2>
        <button className="btn-close" onClick={() => setIsCreateModalOpen(false)}>
          ✕
        </button>
      </div>
      
      <form onSubmit={handleCreateExam} className="exam-form">
        <div className="form-group">
          <label>Sınav Adı *</label>
          <input
            type="text"
            placeholder="Örn: Yazılım Mühendisliği Final"
            value={newExam.title}
            onChange={(e) => setNewExam({...newExam, title: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tarih *</label>
            <input
              type="date"
              value={newExam.date}
              onChange={(e) => setNewExam({...newExam, date: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Saat *</label>
            <input
              type="time"
              value={newExam.time}
              onChange={(e) => setNewExam({...newExam, time: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sınıf/Salon</label>
            <input
              type="text"
              placeholder="Örn: D-201"
              value={newExam.room_code}
              onChange={(e) => setNewExam({...newExam, room_code: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Sınav Kodu</label>
            <input
              type="text"
              placeholder="Örn: SWE301"
              value={newExam.code}
              onChange={(e) => setNewExam({...newExam, code: e.target.value})}
            />
          </div>
        </div>
        <div className="form-group">
  <label>Bölümler *</label>
  <div className="checkbox-group">
    <label className="checkbox-item">
      <input
        type="checkbox"
        checked={newExam.departments.includes('0706')}
        onChange={(e) => {
          if (e.target.checked) {
            setNewExam({...newExam, departments: [...newExam.departments, '0706']});
          } else {
            setNewExam({...newExam, departments: newExam.departments.filter(d => d !== '0706')});
          }
        }}
      />
      <span>Yazılım Mühendisliği (0706)</span>
    </label>
    <label className="checkbox-item">
      <input
        type="checkbox"
        checked={newExam.departments.includes('0704')}
        onChange={(e) => {
          if (e.target.checked) {
            setNewExam({...newExam, departments: [...newExam.departments, '0704']});
          } else {
            setNewExam({...newExam, departments: newExam.departments.filter(d => d !== '0704')});
          }
        }}
      />
      <span>Bilgisayar Mühendisliği (0704)</span>
    </label>
  </div>
</div>


        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => setIsCreateModalOpen(false)}>
            İptal
          </button>
          <button type="submit" className="btn-submit" disabled={creating}>
            {creating ? <><FaSpinner className="fa-spin" /> Oluşturuluyor...</> : 'Sınav Oluştur'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* SINIF PLANI */}
        <div className="panel classroom-panel">
            <div className="classroom-header">
                <h3>Classroom Seating Plan</h3>
                <div style={{display:'flex', gap:'15px', fontSize:'13px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot yellow"></span> Software</div>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}><span className="dot blue"></span> Computer</div>
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
                                            {seat.student.status === 'present' ? '✅' : seat.student.status === 'absent' ? '❌' : '⏳'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <span className="empty-label">EMPTY</span>
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