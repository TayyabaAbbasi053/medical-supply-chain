import React, { useState } from "react";
import axios from "axios";
import jsQR from "jsqr";

export default function PatientDashboard() {
  /* ================= STATE ================= */
  const [activeSection, setActiveSection] = useState(null);
  const [batchId, setBatchId] = useState("");
  const [qrBatchId, setQrBatchId] = useState("");
  const [batchData, setBatchData] = useState(null);
  const [error, setError] = useState("");

  /* ================= VERIFY ================= */
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

  /* ================= QR SCAN ================= */
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
        setError("❌ QR Code not detected");
      }
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Patient Dashboard</h1>

        {/* ===== DASHBOARD OPTIONS ===== */}
        <div style={styles.grid}>
          <DashboardCard title="Verify Batch" onClick={() => setActiveSection("verify")} />
          <DashboardCard title="Track Supply Chain" onClick={() => setActiveSection("track")} />
          <DashboardCard title="Verify via QR Code" onClick={() => setActiveSection("qr")} />
          <DashboardCard
            title="Logout"
            danger
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          />
        </div>

        {/* ===== VERIFY MANUAL ===== */}
        {activeSection === "verify" && (
          <Section title="Verify Medicine Batch">
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

        {/* ===== QR VERIFY ===== */}
        {activeSection === "qr" && (
          <Section title="Verify Using QR Code">
            <input type="file" accept="image/*" onChange={handleQRUpload} />
            {qrBatchId && <p style={styles.infoText}>Batch ID: {qrBatchId}</p>}
          </Section>
        )}

        {/* ===== TRACK SUPPLY ===== */}
        {activeSection === "track" && (
          <Section title="Track Supply Chain Journey">
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

        {/* ===== RESULT ===== */}
        {batchData && (
          <div style={styles.result}>
            <h3 style={styles.success}>✔ Authentic Medicine</h3>
            <p><b>Medicine:</b> {batchData.medicineName}</p>
            <p><b>Manufacturer:</b> {batchData.manufacturerName}</p>

            <h4 style={styles.subHeading}>Supply Chain Timeline</h4>
            <ul style={styles.timeline}>
              {batchData.chain.map((e, i) => (
                <li key={i}>
                  <b>{e.role}</b> — {e.location}
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

/* ================= COMPONENTS ================= */
const DashboardCard = ({ title, onClick, danger }) => (
  <div
    onClick={onClick}
    style={{
      ...styles.card,
      borderColor: danger ? "#7a1212" : "#7a1212",
      background: danger ? "#fff5f5" : "#ffffff",
    }}
  >
    <h3 style={{ color: "#7a1212" }}>{title}</h3>
  </div>
);

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>{title}</h2>
    {children}
  </div>
);

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#fdf7f7",
    padding: 30,
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },
  container: {
    maxWidth: 1100,
    margin: "auto",
    background: "#ffffff",
    padding: 40,
    borderRadius: 14,
    border: "2px solid #7a1212",
  },
  title: {
    textAlign: "center",
    color: "#7a1212",
    marginBottom: 30,
    fontSize: "1.8rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20,
    marginBottom: 30,
  },
  card: {
    padding: 30,
    borderRadius: 12,
    border: "2px solid #7a1212",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
  },
  section: {
    marginTop: 25,
    padding: 25,
    background: "#fffafa",
    borderRadius: 12,
    border: "1.5px solid #7a1212",
  },
  sectionTitle: {
    color: "#7a1212",
    marginBottom: 12,
  },
  input: {
    width: "100%",
    padding: 10,
    marginTop: 10,
    borderRadius: 6,
    border: "1.5px solid #7a1212",
  },
  btn: {
    marginTop: 12,
    padding: "10px 18px",
    background: "#7a1212",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    fontWeight: "600",
    cursor: "pointer",
  },
  result: {
    marginTop: 30,
    padding: 20,
    background: "#fffafa",
    borderRadius: 12,
    border: "2px solid #7a1212",
  },
  success: {
    color: "#7a1212",
    marginBottom: 10,
  },
  subHeading: {
    marginTop: 16,
    color: "#7a1212",
  },
  timeline: {
    paddingLeft: 18,
  },
  error: {
    marginTop: 20,
    padding: 12,
    background: "#fff0f0",
    color: "#7a1212",
    borderRadius: 8,
    border: "1.5px solid #7a1212",
  },
  infoText: {
    marginTop: 10,
    color: "#7a1212",
    fontWeight: "600",
  },
};
