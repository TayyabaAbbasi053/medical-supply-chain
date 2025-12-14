import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Manufacturer',
      subtitle: 'Create, encrypt, and register medicine batches securely.',
      icon: '🏭',
      path: '/login?role=Manufacturer'
    },
    {
      title: 'Distributor',
      subtitle: 'Track, verify, and securely transfer medicines.',
      icon: '📦',
      path: '/login?role=Distributor'
    },
    {
      title: 'Pharmacy',
      subtitle: 'Receive verified medicines and manage inventory.',
      icon: '💊',
      path: '/login?role=Pharmacist'
    },
    {
      title: 'Patient',
      subtitle: 'Verify medicine authenticity and view safe details.',
      icon: '👤',
      path: '/login?role=Patient'
    }
  ];

  return (
    <div style={styles.pageWrapper}>
      {/* Header Section */}
      <div style={styles.headerSection}>
        <div style={styles.badge}>🔒 Information Security Project</div>
        
        <h1 style={styles.mainTitle}>Medical Supply Chain</h1>
        
        <p style={styles.tagline}>Secure, Transparent & Trusted Medicine Distribution</p>
        
        <p style={styles.description}>
          An information-secure system ensuring authenticity and traceability of medicines through advanced encryption and blockchain-inspired verification.
        </p>

        {/* Feature Pills */}
        <div style={styles.featuresRow}>
          <div style={styles.featurePill}>
            🔐 End-to-End Encrypted
          </div>
          <div style={styles.featurePill}>
            ✓ Verified & Trusted
          </div>
          <div style={styles.featurePill}>
            ⚡ Real-time Tracking
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div style={styles.cardsContainer}>
        {roles.map((role, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.iconBadge}>{role.icon}</div>
            <h3 style={styles.cardTitle}>{role.title}</h3>
            <p style={styles.cardDescription}>{role.subtitle}</p>
            <button
              onClick={() => navigate(role.path)}
              style={styles.button}
            >
              Login
            </button>
          </div>
        ))}

        {/* Admin Card - Direct Access */}
        <div style={styles.card}>
          <div style={{...styles.iconBadge, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>🛡️</div>
          <h3 style={styles.cardTitle}>Admin</h3>
          <p style={styles.cardDescription}>Register manufacturers, distributors, and pharmacists.</p>
          <button
            onClick={() => navigate('/admin')}
            style={{...styles.button, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e8ecf1 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '25px 30px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    overflow: 'auto',
  },

  headerSection: {
    textAlign: 'center',
    marginBottom: '28px',
    maxWidth: '850px',
    width: '100%',
  },

  badge: {
    display: 'inline-block',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '50px',
    padding: '6px 14px',
    fontSize: '0.75rem',
    color: '#1f2937',
    marginBottom: '10px',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },

  mainTitle: {
    fontSize: '2.4rem',
    fontWeight: '700',
    color: '#1a73e8',
    margin: '0 0 5px 0',
    letterSpacing: '-0.7px',
    lineHeight: '1.1',
  },

  tagline: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 10px 0',
    letterSpacing: '-0.2px',
  },

  description: {
    fontSize: '0.88rem',
    color: '#6b7280',
    margin: '0 0 14px 0',
    lineHeight: '1.5',
    maxWidth: '700px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  featuresRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '12px',
  },

  featurePill: {
    background: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.78rem',
    color: '#1f2937',
    fontWeight: '500',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    whiteSpace: 'nowrap',
  },

  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    maxWidth: '1080px',
    width: '100%',
    margin: '0 auto',
  },

  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px 16px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },

  iconBadge: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    margin: '0 auto 10px',
  },

  cardTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 6px 0',
    letterSpacing: '-0.2px',
  },

  cardDescription: {
    fontSize: '0.85rem',
    color: '#6b7280',
    margin: '0 0 12px 0',
    lineHeight: '1.35',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  button: {
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
  },

  '@media (max-width: 1024px)': {
    cardsContainer: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },

  '@media (max-width: 640px)': {
    cardsContainer: {
      gridTemplateColumns: '1fr',
    },
    mainTitle: {
      fontSize: '2.5rem',
    },
  },
};
