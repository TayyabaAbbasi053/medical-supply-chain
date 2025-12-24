import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Manufacturer() {
  const [formData, setFormData] = useState({
    batchNumber: "",
    medicineName: "",
    strength: "",
    quantityProduced: 0,
    distributorId: "",
    dispatchDate: "",
    manufacturingDate: "",
    expiryDate: "",
    manufacturerName: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const SESSION_TIMEOUT = 15 * 60 * 1000;

  /* ================= AUTH CHECK (UNCHANGED) ================= */
  useEffect(() => {
    try {
      const email = localStorage.getItem("userEmail");
      const role = localStorage.getItem("userRole");
      const verified = localStorage.getItem("is3FAVerified");
      const loginTime = localStorage.getItem("loginTimestamp");

      if (email && role === "Manufacturer" && verified === "true") {
        if (Date.now() - parseInt(loginTime) > SESSION_TIMEOUT) {
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        setIsAuthenticated(true);
        setUserEmail(email);
      }
    } catch {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  /* ================= CREATE BATCH (UNCHANGED) ================= */
  const createBatch = async () => {
    try {
      setIsCreating(true);
      const res = await axios.post(
        "http://localhost:5000/api/modules/manufacturer/create-batch",
        { ...formData, email: userEmail }
      );

      if (res.data.success) {
        alert("✅ Batch Created Successfully");
        setFormData({
          batchNumber: "",
          medicineName: "",
          strength: "",
          quantityProduced: 0,
          distributorId: "",
          dispatchDate: "",
          manufacturingDate: "",
          expiryDate: "",
          manufacturerName: "",
        });
      }
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || "Server error"));
    } finally {
      setIsCreating(false);
    }
  };

  /* ================= UI STATES ================= */
  if (loading)
    return <div style={styles.loading}>Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div style={styles.authPage}>
        <div style={styles.authCard}>
          <h2 style={styles.authTitle}>Authentication Required</h2>
          <p style={styles.authText}>Please login with 3-Factor Authentication.</p>
          <a href="/login" style={styles.authBtn}>Go to Login</a>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Medicine Batch</h1>
        <p style={styles.subtitle}>Manufacturer Control Panel</p>

        <div style={styles.grid}>
          {[
            ["Batch Number", "batchNumber"],
            ["Medicine Name", "medicineName"],
            ["Strength / Dosage", "strength"],
            ["Quantity Produced", "quantityProduced", "number"],
            ["Distributor ID", "distributorId"],
            ["Dispatch Date", "dispatchDate", "date"],
            ["Manufacturing Date", "manufacturingDate", "date"],
            ["Expiry Date", "expiryDate", "date"],
            ["Manufacturer Name", "manufacturerName"],
          ].map(([label, key, type = "text"], i) => (
            <div key={i} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type}
                value={formData[key]}
                style={styles.input}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div style={styles.actions}>
          <button
            onClick={createBatch}
            disabled={isCreating}
            style={styles.primaryBtn}
          >
            {isCreating ? "Creating..." : "Create Batch"}
          </button>

          <button
            onClick={() => window.history.back()}
            style={styles.secondaryBtn}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  page: {
    minHeight: "100vh",
    background: "#faf7f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 1100,
    background: "#ffffff",
    borderRadius: 14,
    padding: 36,
    border: "2px solid #7a1212",
  },

  title: {
    textAlign: "center",
    color: "#7a1212",
    fontSize: "1.6rem",
    fontWeight: 700,
    marginBottom: 4,
  },

  subtitle: {
    textAlign: "center",
    color: "#5a0e0e",
    fontSize: "0.85rem",
    marginBottom: 28,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 18,
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#5a0e0e",
    marginBottom: 6,
  },

  input: {
    padding: "10px",
    borderRadius: 6,
    border: "1.5px solid #7a1212",
    fontSize: "0.85rem",
  },

  actions: {
    marginTop: 28,
    display: "flex",
    gap: 12,
  },

  primaryBtn: {
    background: "#7a1212",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryBtn: {
    background: "#fff",
    color: "#7a1212",
    border: "1.5px solid #7a1212",
    borderRadius: 6,
    padding: "10px 18px",
    fontWeight: 600,
    cursor: "pointer",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#7a1212",
  },

  authPage: {
    minHeight: "100vh",
    background: "#faf7f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  authCard: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    border: "2px solid #7a1212",
    textAlign: "center",
  },

  authTitle: { color: "#7a1212", marginBottom: 6 },
  authText: { fontSize: "0.85rem", marginBottom: 16 },

  authBtn: {
    padding: "10px 18px",
    background: "#7a1212",
    color: "#fff",
    borderRadius: 6,
    textDecoration: "none",
    fontWeight: 600,
  },
};
