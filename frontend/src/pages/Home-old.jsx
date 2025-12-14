import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const modules = [
    {
      id: 1,
      title: 'Manufacturer',
      role: 'BATCH CREATOR',
      description: 'Create and manage medicine batches with unique QR codes',
      color: '#0891b2',
      icon: '🏭',
      path: '/login?role=Manufacturer',
      steps: ['Create Batch', 'Generate QR', 'Assign Distributor']
    },
    {
      id: 2,
      title: 'Distributor',
      role: 'LOGISTICS HUB',
      description: 'Receive, verify and forward medicine batches securely',
      color: '#f97316',
      icon: '📦',
      path: '/login?role=Distributor',
      steps: ['Receive Batch', 'Verify', 'Forward']
    },
    {
      id: 3,
      title: 'Pharmacy',
      role: 'DISPENSING CENTER',
      description: 'Verify authenticity and dispense medicines',
      color: '#16a34a',
      icon: '🏥',
      path: '/login?role=Pharmacist',
      steps: ['Verify Batch', 'Check Expiry', 'Dispense']
    },
    {
      id: 4,
      title: 'Patient',
      role: 'END CONSUMER',
      description: 'Verify medicine authenticity and view supply chain',
      color: '#7c3aed',
      icon: '🔍',
      path: '/login?role=Patient',
      steps: ['Scan QR', 'Verify', 'View History']
    }
  ];

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>💊 Medical Supply Chain</h1>
        <p style={styles.tagline}>Secure • Transparent • Tamper-Proof Distribution</p>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Intro */}
        <div style={styles.intro}>
          <h2 style={styles.heading}>Select Your Role</h2>
          <p style={styles.subtitle}>Access your dashboard with 3-Factor Authentication</p>
        </div>

        {/* 2x2 Grid */}
        <div style={styles.grid}>
          {modules.map((module) => (
            <div
              key={module.id}
              style={{...styles.card, borderLeftColor: module.color}}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Icon */}
              <div style={{...styles.iconBox, backgroundColor: `${module.color}15`}}>
                <span style={styles.icon}>{module.icon}</span>
              </div>

              {/* Title & Role */}
              <h3 style={styles.cardTitle}>{module.title}</h3>
              <p style={{...styles.roleTag, color: module.color}}>{module.role}</p>

              {/* Description */}
              <p style={styles.cardDesc}>{module.description}</p>

              {/* Steps */}
              <div style={styles.stepsBox}>
                <p style={styles.stepsLabel}>Workflow</p>
                <ol style={styles.steps}>
                  {module.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Button */}
              <button
                style={{...styles.btn, backgroundColor: module.color}}
                onClick={() => navigate(module.path)}
              >
                Access Dashboard →
              </button>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.stat}>
            <p style={styles.statNumber}>15+</p>
            <p style={styles.statText}>Partners</p>
          </div>
          <div style={styles.stat}>
            <p style={styles.statNumber}>100%</p>
            <p style={styles.statText}>Verified</p>
          </div>
          <div style={styles.stat}>
            <p style={styles.statNumber}>24/7</p>
            <p style={styles.statText}>Monitored</p>
          </div>
          <div style={styles.stat}>
            <p style={styles.statNumber}>0</p>
            <p style={styles.statText}>Incidents</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>🔒 Military-grade encryption • 3-Factor Authentication • Real-time tracking</p>
      </footer>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    color: 'white',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },

  title: {
    margin: 0,
    fontSize: '3rem',
    fontWeight: '900',
    letterSpacing: '-1px',
  },

  tagline: {
    margin: '12px 0 0 0',
    fontSize: '1.1rem',
    color: '#cbd5e1',
    fontWeight: '300',
  },

  main: {
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
    padding: '80px 40px',
  },

  intro: {
    textAlign: 'center',
    marginBottom: '60px',
  },

  heading: {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '12px',
  },

  subtitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: '500',
  },

  // Grid Layout - 2 columns on desktop
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '32px',
    marginBottom: '80px',
  },

  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    borderLeft: '5px solid',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },

  iconBox: {
    width: '70px',
    height: '70px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },

  icon: {
    fontSize: '2.5rem',
  },

  cardTitle: {
    margin: '0 0 6px 0',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
  },

  roleTag: {
    margin: '0 0 16px 0',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },

  cardDesc: {
    margin: '0 0 20px 0',
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: '1.5',
  },

  stepsBox: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },

  stepsLabel: {
    margin: '0 0 8px 0',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  steps: {
    margin: 0,
    paddingLeft: '20px',
    color: '#64748b',
    fontSize: '0.9rem',
  },

  btn: {
    width: '100%',
    padding: '12px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '40px',
    borderRadius: '16px',
    color: 'white',
  },

  stat: {
    textAlign: 'center',
  },

  statNumber: {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#06b6d4',
  },

  statText: {
    margin: '8px 0 0 0',
    fontSize: '0.95rem',
    color: '#cbd5e1',
    fontWeight: '500',
  },

  footer: {
    background: '#1e293b',
    color: '#cbd5e1',
    textAlign: 'center',
    padding: '24px 40px',
    fontSize: '0.95rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },

  // Responsive
  '@media (max-width: 1024px)': {
    grid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '24px',
    },
  },

  '@media (max-width: 768px)': {
    grid: {
      gridTemplateColumns: '1fr',
      gap: '20px',
    },
    stats: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    main: {
      padding: '40px 20px',
    },
    title: {
      fontSize: '2rem',
    },
  },
};
