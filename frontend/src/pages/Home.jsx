import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Manufacturer",
      subtitle: "Create and register medicine batches securely.",
      icon: "🏭",
      path: "/login?role=Manufacturer",
    },
    {
      title: "Distributor",
      subtitle: "Verify and transfer medicines through the supply chain.",
      icon: "📦",
      path: "/login?role=Distributor",
    },
    {
      title: "Pharmacy",
      subtitle: "Receive verified medicines and manage inventory.",
      icon: "💊",
      path: "/login?role=Pharmacy",
    },
    {
      title: "Patient",
      subtitle: "Verify medicine authenticity and track supply journey.",
      icon: "👤",
      path: "/login?role=Patient",
    },
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.badge}>Information Security Project</span>
        <h1 style={styles.title}>Medical Supply Chain System</h1>
        <p style={styles.subtitle}>
          Secure, Transparent & Tamper-Resistant Medicine Verification Platform
        </p>
      </div>

      {/* ROLE CARDS */}
      <div style={styles.cardsContainer}>
        {roles.map((role, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.icon}>{role.icon}</div>
            <h3 style={styles.cardTitle}>{role.title}</h3>
            <p style={styles.cardDesc}>{role.subtitle}</p>
            <button
              style={styles.button}
              onClick={() => navigate(role.path)}
            >
              Continue
            </button>
          </div>
        ))}

        {/* ADMIN */}
        <div style={styles.card}>
          <div style={styles.icon}>🛡️</div>
          <h3 style={styles.cardTitle}>Administrator</h3>
          <p style={styles.cardDesc}>
            Register and manage system participants securely.
          </p>
          <button
            style={styles.button}
            onClick={() => navigate("/admin")}
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== STYLES ===================== */

const MAROON = "#7a1212";
const MAROON_DARK = "#5e0d0d";

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#fafafa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "Segoe UI, Roboto, sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: "40px",
    maxWidth: "900px",
  },

  badge: {
    display: "inline-block",
    border: `1px solid ${MAROON}`,
    color: MAROON,
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: "12px",
  },

  title: {
    fontSize: "2.4rem",
    fontWeight: 800,
    color: MAROON,
    margin: "0 0 8px",
  },

  subtitle: {
    fontSize: "0.95rem",
    color: "#333",
    lineHeight: 1.5,
  },

  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    width: "100%",
    maxWidth: "1100px",
  },

  card: {
    background: "#ffffff",
    border: `1px solid ${MAROON}`,
    borderRadius: "12px",
    padding: "22px 18px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: "1.8rem",
    marginBottom: "10px",
  },

  cardTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: MAROON,
    marginBottom: "6px",
  },

  cardDesc: {
    fontSize: "0.85rem",
    color: "#444",
    lineHeight: 1.4,
    flex: 1,
    marginBottom: "14px",
  },

  button: {
    background: MAROON,
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.25s ease",
  },

  buttonHover: {
    background: MAROON_DARK,
  },
};
