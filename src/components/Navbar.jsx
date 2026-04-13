import { Link } from 'react-router-dom'
import '../App.css'

/* =====================================================
   Shared Navbar
   Used on both Landing and Dashboard.
   Props:
     - variant: 'landing' | 'dashboard'  (default: 'landing')
       Controls which center-links are shown.
   ===================================================== */
function Navbar({ variant = 'landing' }) {
  return (
    <nav className="navbar">
      <div className="navbar__inner">

        {/* Logo — always links to home */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">◈</span>
          POD
        </Link>

        {/* Center links differ per context */}
        {variant === 'landing' ? (
          <ul className="navbar__links">
            <li><a href="#how-it-works" className="navbar__link">How it Works</a></li>
            <li><a href="#features"     className="navbar__link">For Freelancers</a></li>
          </ul>
        ) : (
          <ul className="navbar__links">
            <li><Link to="/dashboard" className="navbar__link navbar__link--active">Dashboard</Link></li>
            <li><Link to="/submit"    className="navbar__link">Submit Work</Link></li>
            <li><Link to="/score"     className="navbar__link">My Score</Link></li>
          </ul>
        )}

        <button className="btn btn--primary navbar__cta">
          Connect Wallet
        </button>

        {/* Mobile burger */}
        <button className="navbar__burger" aria-label="Open menu">
          <span /><span /><span />
        </button>

      </div>
    </nav>
  )
}

export default Navbar
