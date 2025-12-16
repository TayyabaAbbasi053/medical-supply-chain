import React, { useState } from "react";
import axios from "axios";
import jsQR from "jsqr";

export default function PatientDashboard() {
  /* ================= DASHBOARD STATE ================= */
  const [activeSection, setActiveSection] = useState(null);

  /* ================= DATA ================= */
  const [batchId, setBatchId] = useState("");
  const [qrBatchId, setQrBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState("");

  /* ================= VERIFY MANUAL ================= */
  const verifyBatch = async (id) => {
    try {
      setError("");
      const res = await axios.get(`http://localhost:5000/api/batch/${id}`);
      setBatchData(res.data);
    } catch {
      setBatchData(null);
      setError("❌ Fake / Invalid Batch");
    }
  };

  /* ================= QR IMAGE SCAN ================= */
  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => (img.src = reader.result);
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imageData.data, canvas.width, canvas.height);

      if (qr) {
        setQrBatchId(qr.data.trim());
        verifyBatch(qr.data.trim());
      } else {
        setError("❌ QR not detected");
      }
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Patient Dashboard</h1>

        {/* ================= DASHBOARD CARDS ================= */}
        <div style={styles.grid}>
          <Card title="Verify Batch" onClick={() => setActiveSection("verify")} />
          <Card title="Track Supply" onClick={() => setActiveSection("track")} />
          <Card title="Verify via QR" onClick={() => setActiveSection("qr")} />
          <Card
            title="Logout"
            danger
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          />
        </div>

        {/* ================= VERIFY BATCH ================= */}
        {activeSection === "verify" && (
          <Section title="Verify Batch">
            <input
              style={styles.input}
              placeholder="Enter Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
            <button style={styles.btn} onClick={() => verifyBatch(batchId)}>
              Verify
            </button>
          </Section>
        )}

        {/* ================= QR VERIFY ================= */}
        {activeSection === "qr" && (
          <Section title="Verify via QR Code">
            <input type="file" accept="image/*" onChange={handleQRUpload} />
            {qrBatchId && <p>📦 Batch ID: {qrBatchId}</p>}
          </Section>
        )}

        {/* ================= TRACK SUPPLY ================= */}
        {activeSection === "track" && (
          <Section title="Track Supply Chain">
            <input
              style={styles.input}
              placeholder="Enter Batch ID"
              onChange={(e) => setBatchId(e.target.value)}
            />
            <button style={styles.btn} onClick={() => verifyBatch(batchId)}>
              Track
            </button>
          </Section>
        )}

        {/* ================= RESULT ================= */}
        {batchData && (
          <div style={styles.result}>
            <h3>✅ Authentic Medicine</h3>
            <p><b>Medicine:</b> {batchData.medicineName}</p>
            <p><b>Manufacturer:</b> {batchData.manufacturerName}</p>

            <h4>📦 Supply Chain</h4>
            <ul>
              {batchData.chain.map((e, i) => (
                <li key={i}>
                  {e.role} — {e.location}
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */
const Card = ({ title, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      ...styles.card,
      borderColor: danger ? "#b91c1c" : "#e5d1d1",
      color: danger ? "#b91c1c" : "#7a1212",
    }}
  >
    <h3>{title}</h3>
  </div>
);

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2>{title}</h2>
    {children}
  </div>
);

/* ================= STYLES ================= */
const styles = {
  page: { minHeight: "100vh", background: "#f9f5f4", padding: 30 },
  container: { maxWidth: 1000, margin: "auto", background: "#fff", padding: 30, borderRadius: 16 },
  title: { textAlign: "center", color: "#7a1212" },
  grid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 30 },
  card: { padding: 30, borderRadius: 12, border: "2px solid", cursor: "pointer", textAlign: "center" },
  section: { marginTop: 20, padding: 20, background: "#f9fafb", borderRadius: 10 },
  input: { width: "100%", padding: 8, marginTop: 10 },
  btn: { marginTop: 10, padding: "8px 16px", background: "#1a73e8", color: "#fff", border: "none" },
  result: { marginTop: 20, background: "#f0fdf4", padding: 20, borderRadius: 10 },
  error: { marginTop: 10, background: "#fee2e2", padding: 10 },
};
