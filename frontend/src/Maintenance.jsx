import "./maintenance.css";

export default function Maintenance() {
  return (
    <div className="maintenance-root">
      <div className="maintenance-card">
        <h1 className="title">🚧 Bakımdayız</h1>
        <p className="subtitle">
          Sistem optimize ediliyor, lütfen bekleyin…
        </p>

        <div className="terminal">
          <div className="terminal-content">
            <p>✔ CSS’ler düzeltiliyor…</p>
            <p>✔ Gereksiz görüntüler kaldırılıyor…</p>
            <p>✔ Script’ler sadeleştiriliyor…</p>
            <p>✔ Performans ayarları yapılıyor…</p>
            <p>✔ Güvenlik kontrolleri tamamlanıyor…</p>
            <p>✔ Son dokunuşlar uygulanıyor…</p>

            {/* tekrar – kesintisiz akış için */}
            <p>✔ CSS’ler düzeltiliyor…</p>
            <p>✔ Gereksiz görüntüler kaldırılıyor…</p>
            <p>✔ Script’ler sadeleştiriliyor…</p>
            <p>✔ Performans ayarları yapılıyor…</p>
            <p>✔ Güvenlik kontrolleri tamamlanıyor…</p>
            <p>✔ Son dokunuşlar uygulanıyor…</p>
          </div>
        </div>

        <span className="hint">Lütfen sayfayı kapatmayın</span>
      </div>
    </div>
  );
}
