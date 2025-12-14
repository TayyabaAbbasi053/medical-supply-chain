import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      name: "Manufacturer",
      icon: "🏭",
      description: "Create and manage medicine batches",
      color: "#8b4513"
    },
    {
      name: "Distributor",
      icon: "📦",
      description: "Track and distribute batches",
      color: "#d4691f"
    },
    {
      name: "Pharmacist",
      icon: "💊",
      description: "Receive and manage stock",
      color: "#6a4c93"
    },
    {
      name: "Patient",
      icon: "👤",
      description: "Verify medicine authenticity",
      color: "#1f9c89"
    }
  ];

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/login");
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.bgOverlay}></div>

      <div style={styles.centerContainer}>
        <div style={styles.contentWrapper}>
          
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.mainTitle}>💊 SupplyChain Secure</h1>
            <p style={styles.subtitle}>Select Your Role to Continue</p>
            <p style={styles.description}>
              Access your dashboard by selecting your role and logging in with your credentials
            </p>
          </div>

          {/* Role Selection Grid */}
          <div style={styles.rolesGrid}>
            {roles.map((role) => (
              <div
                key={role.name}
                style={{
                  ...styles.roleCard,
                  borderTopColor: role.color,
                  backgroundColor: `${role.color}08`
                }}
                onClick={() => handleRoleSelect(role.name)}
              >
                <div style={{ ...styles.roleIcon, color: role.color }}>
                  {role.icon}
                </div>
                <h3 style={{ ...styles.roleName, color: role.color }}>
                  {role.name}
                </h3>
                <p style={styles.roleDescription}>
                  {role.description}
                </p>
                <button
                  style={{
                    ...styles.selectBtn,
                    backgroundColor: role.color,
                    color: "white"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.opacity = "0.9";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.opacity = "1";
                  }}
                >
                  Login as {role.name}
                </button>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              🔒 Only registered users can access their dashboards
            </p>
            <p style={styles.footerText2}>
              For security, registration is disabled. Contact your administrator to create an account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== STYLES ==================== */

const styles = {
  pageWrapper: {
    position: "fixed",
    inset: 0,
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },

  bgOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(135deg, rgba(90, 0, 0, 0.15) 0%, rgba(212, 105, 31, 0.1) 100%), url('https://images.unsplash.com/photo-1576091160550-112173f7f869?auto=format&fit=crop&w=1600&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 0,
    backdropFilter: "blur(2px)"
  },

  centerContainer: {
    position: "relative",
    zIndex: 1,
    padding: "20px",
    width: "100%",
    maxWidth: "1200px"
  },

  contentWrapper: {
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    padding: "50px 40px",
    backdropFilter: "blur(10px)"
  },

  header: {
    textAlign: "center",
    marginBottom: "50px"
  },

  mainTitle: {
    fontSize: "3rem",
    fontWeight: "bold",
    color: "#5a0000",
    margin: "0 0 20px 0",
    textShadow: "2px 2px 4px rgba(90, 0, 0, 0.1)"
  },

  subtitle: {
    fontSize: "1.8rem",
    color: "#333",
    margin: "0 0 10px 0",
    fontWeight: "600"
  },

  description: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto"
  },

  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "25px",
    marginBottom: "40px"
  },

  roleCard: {
    padding: "30px 20px",
    borderRadius: "15px",
    border: "2px solid transparent",
    borderTop: "4px solid",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
    }
  },

  roleIcon: {
    fontSize: "3rem",
    marginBottom: "15px",
    display: "inline-block"
  },

  roleName: {
    fontSize: "1.3rem",
    margin: "10px 0",
    fontWeight: "600"
  },

  roleDescription: {
    fontSize: "0.9rem",
    color: "#666",
    marginBottom: "20px",
    minHeight: "40px"
  },

  selectBtn: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.2s",
    width: "100%"
  },

  footer: {
    borderTop: "2px solid #eee",
    paddingTop: "30px",
    textAlign: "center"
  },

  footerText: {
    fontSize: "0.95rem",
    color: "#5a0000",
    fontWeight: "600",
    margin: "0 0 5px 0"
  },

  footerText2: {
    fontSize: "0.85rem",
    color: "#999",
    margin: 0
  }
};
