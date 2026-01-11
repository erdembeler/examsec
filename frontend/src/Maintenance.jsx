import { useEffect, useState } from "react";
import "./Maintenance.css";

const TASKS = [
"CSS’ler düzeltiliyor",
  "Gereksiz görüntüler kaldırılıyor",
  "Responsive hatalar gideriliyor",
  "Animasyonlar optimize ediliyor",
  "Render süresi iyileştiriliyor",
  "Script’ler sadeleştiriliyor",
  "DOM yükü azaltılıyor",
  "Unused CSS ayıklanıyor",
  "Fontlar optimize ediliyor",
  "SVG’ler temizleniyor",
  "Lazy loading ayarlanıyor",
  "Cache mekanizması yapılandırılıyor",
  "Bundle boyutu küçültülüyor",
  "Tree shaking uygulanıyor",
  "Critical CSS ayrıştırılıyor",
  "Dark mode uyumluluğu test ediliyor",
  "Hover gecikmeleri azaltılıyor",
  "Scroll performansı artırılıyor",

  "API çağrıları kontrol ediliyor",
  "Timeout değerleri güncelleniyor",
  "Rate limit kuralları ayarlanıyor",
  "Error handling güçlendiriliyor",
  "Log seviyesi düşürülüyor",
  "Debug kodları temizleniyor",
  "Gereksiz istekler iptal ediliyor",

  "Güvenlik başlıkları ekleniyor",
  "CORS kuralları sıkılaştırılıyor",
  "Token doğrulama iyileştiriliyor",
  "Session yönetimi düzenleniyor",
  "XSS kontrolleri yapılıyor",
  "CSRF önlemleri uygulanıyor",

  "Veritabanı sorguları optimize ediliyor",
  "Indexler yeniden oluşturuluyor",
  "Connection pool ayarlanıyor",
  "Slow query’ler düzeltiliyor",

  "SEO meta etiketleri güncelleniyor",
  "Open Graph ayarları yapılıyor",
  "Accessibility kontrolleri yapılıyor",
  "ARIA etiketleri ekleniyor",

  "Build script’leri düzenleniyor",
  "Deployment ayarları doğrulanıyor",
  "Environment değişkenleri kontrol ediliyor",
  "Production config temizleniyor",

  "Son kontroller uygulanıyor",
  "Stabilite testleri çalıştırılıyor",
  "Final optimizasyonlar yapılıyor",
  "Yayına hazırlanıyor"
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Maintenance() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let active = true;

    const loop = async () => {
      while (active) {
        const text = randomItem(TASKS);
        let current = "";

        // ❌ önce hata gibi girsin
        setLogs((l) => [
          ...l.slice(-6),
          { text: "", status: "error" }
        ]);

        // harf harf yaz
        for (let char of text) {
          if (!active) return;
          current += char;
          await wait(20 + Math.random() * 40);

          setLogs((l) => {
            const updated = [...l];
            updated[updated.length - 1] = {
              text: current,
              status: "error"
            };
            return updated;
          });
        }

        // biraz bekle
        await wait(100);

        // ✅ başarıya çevir
        setLogs((l) => {
          const updated = [...l];
          updated[updated.length - 1] = {
            text,
            status: "success"
          };
          return updated;
        });

        await wait(600);
      }
    };

    loop();
    return () => (active = false);
  }, []);

  return (
    <div className="maintenance-root">
      <div className="maintenance-card">
        <h1 className="title">🚧 Bakımdayız</h1>
        <p className="subtitle">
          Sistem hazırlanıyor, lütfen bekleyin…
        </p>

        <div className="terminal">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`line ${log.status}`}
            >
              <span className="icon">
                {log.status === "error" ? "✖" : "✔"}
              </span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>

        <span className="hint">
          Lütfen sayfayı kapatmayın
        </span>
      </div>
    </div>
  );
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
