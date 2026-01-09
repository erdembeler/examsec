import React, { useState } from 'react';
import './InstructorDashboard.css';
import { FaChalkboardTeacher, FaRandom, FaExchangeAlt, FaSave, FaUserGraduate } from 'react-icons/fa';

// MOCK DATA: Karışık bölüm öğrencileri
// 0706: Yazılım Müh. | 0704: Bilgisayar Müh.
const mockClassList = [
  { id: "220706001", name: "Ali (Yazılım)", dept: "0706" },
  { id: "220704001", name: "Veli (Bilgisayar)", dept: "0704" },
  { id: "220706002", name: "Ayşe (Yazılım)", dept: "0706" },
  { id: "220704002", name: "Fatma (Bilgisayar)", dept: "0704" },
  { id: "220706003", name: "Mehmet (Yazılım)", dept: "0706" },
  { id: "220704003", name: "Zeynep (Bilgisayar)", dept: "0704" },
  { id: "220706004", name: "Can (Yazılım)", dept: "0706" },
  { id: "220704004", name: "Elif (Bilgisayar)", dept: "0704" },
  { id: "220706005", name: "Burak (Yazılım)", dept: "0706" },
  { id: "220704005", name: "Selin (Bilgisayar)", dept: "0704" },
];

const InstructorDashboard = () => {
  const [examName, setExamName] = useState("Final Sınavı");
const [students] = useState(mockClassList);
  const [seatingPlan, setSeatingPlan] = useState([]);

  // Sınıf Kapasitesi (Örn: 3 Sıra x 4 Sütun = 12 Kişilik)
  const rows = 3;
  const cols = 4;
  const totalSeats = rows * cols;

  // --- ALGORİTMA 1: RASTGELE DAĞITIM ---
  const handleRandomize = () => {
    // Listeyi kopyala ve karıştır (Shuffle)
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    generatePlan(shuffled);
  };

  // --- ALGORİTMA 2: KELEBEK SİSTEMİ (0706 ve 0704 Çapraz) ---
  const handleButterfly = () => {
    // 1. Öğrencileri bölümlerine göre ayır
    const softwareEng = students.filter(s => s.id.substring(4, 8) === '0706');
    const compEng = students.filter(s => s.id.substring(4, 8) === '0704');

    const butterflyList = [];
    const maxLen = Math.max(softwareEng.length, compEng.length);

    // 2. Sırayla bir ondan bir bundan al
    for (let i = 0; i < maxLen; i++) {
      if (softwareEng[i]) butterflyList.push(softwareEng[i]);
      if (compEng[i]) butterflyList.push(compEng[i]);
    }

    generatePlan(butterflyList);
  };

  // Listeyi Koltuklara Yerleştirme Fonksiyonu
  const generatePlan = (studentList) => {
    let plan = [];
    let studentIndex = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Eğer öğrenci kaldıysa yerleştir, yoksa koltuk boş kalsın
        const student = studentList[studentIndex] || null;
        
        plan.push({
          seatLabel: `${String.fromCharCode(65 + r)}-${c + 1}`, // A-1, A-2...
          student: student
        });
        studentIndex++;
      }
    }
    setSeatingPlan(plan);
  };

  return (
    <div className="inst-wrapper">
      <header className="inst-header">
        <div className="header-left">
            <div className="icon-box"><FaChalkboardTeacher /></div>
            <div>
                <h2>Öğretmen Paneli</h2>
                <p>Sınav Oluşturma & Oturma Düzeni</p>
            </div>
        </div>
        <button className="btn-save"><FaSave /> Sınavı Başlat</button>
      </header>

      <div className="inst-content">
        
        {/* SOL: Ayarlar */}
        <div className="panel settings-panel">
            <h3>Sınav Ayarları</h3>
            <div className="form-group">
                <label>Sınav Adı</label>
                <input 
                    type="text" 
                    value={examName} 
                    onChange={(e) => setExamName(e.target.value)} 
                />
            </div>

            <div className="roster-info">
                <p>Toplam Öğrenci: <strong>{students.length}</strong></p>
                <p>Kapasite: <strong>{totalSeats}</strong> Koltuk</p>
            </div>

            <div className="distribution-buttons">
                <button onClick={handleRandomize} className="btn-action random">
                    <FaRandom /> Rastgele Dağıt
                </button>
                <button onClick={handleButterfly} className="btn-action butterfly">
                    <FaExchangeAlt /> Kelebek Sistemi (0706/0704)
                </button>
            </div>
            
            <div className="legend">
                <h4>Renk Kodları:</h4>
                <div className="legend-item"><span className="dot blue"></span> Yazılım (0706)</div>
                <div className="legend-item"><span className="dot orange"></span> Bilgisayar (0704)</div>
            </div>
        </div>

        {/* SAĞ: Görsel Oturma Planı */}
        <div className="panel classroom-panel">
            <h3>Sınıf Önü (Tahta)</h3>
            <div className="classroom-grid" style={{gridTemplateColumns: `repeat(${cols}, 1fr)`}}>
                {seatingPlan.length > 0 ? (
                    seatingPlan.map((seat, index) => {
                        // Bölüme göre renk belirleme
                        let deptClass = "";
                        if (seat.student) {
                            const deptCode = seat.student.id.substring(4, 8);
                            deptClass = deptCode === '0706' ? 'soft-eng' : 'comp-eng';
                        }

                        return (
                            <div key={index} className={`seat-box ${seat.student ? 'occupied' : 'empty'} ${deptClass}`}>
                                <span className="seat-number">{seat.seatLabel}</span>
                                {seat.student ? (
                                    <div className="seat-student">
                                        <FaUserGraduate />
                                        <span>{seat.student.name}</span>
                                        <small>{seat.student.id}</small>
                                    </div>
                                ) : (
                                    <span className="empty-label">BOŞ</span>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-plan-msg">
                        Lütfen soldaki menüden bir dağıtım türü seçiniz.
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorDashboard;