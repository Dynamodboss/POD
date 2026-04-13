import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../App.css'

/* =====================================================
   POD — Submit Work Proof (Placeholder)
   ===================================================== */
function Submit() {
  return (
    <div className="pod-app" style={{ minHeight: '100vh' }}>
      <Navbar variant="dashboard" />
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        paddingTop: '64px',
        gap: '20px',
        textAlign: 'center',
        padding: '64px 24px',
      }}>
        <p style={{ fontSize: '48px' }}>📦</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.02em' }}>
          Submit Work Proof
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.6' }}>
          This page is coming soon. You'll be able to upload contracts, deliverables, and client attestations to 0G Storage.
        </p>
        <Link to="/dashboard" className="btn btn--primary">← Back to Dashboard</Link>
      </main>
    </div>
  )
}

export default Submit
