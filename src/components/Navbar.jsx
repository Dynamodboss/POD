import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import WalletButton from './WalletButton'
import '../App.css'

/* =====================================================
   Shared Navbar
   Props:
     - variant: 'landing' | 'dashboard'  (default: 'landing')
   ===================================================== */
function Navbar({ variant = 'landing' }) {
  const [isOpen, setIsOpen] = useState(false)
  const navRef = useRef(null)
  const { pathname } = useLocation()

  /* Close when clicking outside the navbar */
  useEffect(() => {
    if (!isOpen) return
    function onOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [isOpen])

  function close() { setIsOpen(false) }

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={close}>
          <span className="navbar__logo-mark">◈</span>
          POD
        </Link>

        {/* Center links — desktop only */}
        {variant === 'landing' ? (
          <ul className="navbar__links">
            <li><a href="#how-it-works" className="navbar__link">How it Works</a></li>
            <li><a href="#features"     className="navbar__link">For Freelancers</a></li>
          </ul>
        ) : (
          <ul className="navbar__links">
            <li><Link to="/dashboard" className={`navbar__link${pathname === '/dashboard' ? ' navbar__link--active' : ''}`}>Dashboard</Link></li>
            <li><Link to="/submit"    className={`navbar__link${pathname === '/submit'    ? ' navbar__link--active' : ''}`}>Submit Work</Link></li>
            <li><Link to="/score"     className={`navbar__link${pathname === '/score'     ? ' navbar__link--active' : ''}`}>My Score</Link></li>
          </ul>
        )}

        {/* Desktop wallet button */}
        <div className="navbar__cta">
          <WalletButton />
        </div>

        {/* Mobile burger — transforms into × when open */}
        <button
          className={`navbar__burger${isOpen ? ' navbar__burger--open' : ''}`}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile dropdown menu ──────────────────────── */}
      <div className={`navbar__mobile-menu${isOpen ? ' navbar__mobile-menu--open' : ''}`}>
        {variant === 'landing' ? (
          <>
            <a href="#how-it-works" className="navbar__mobile-link" onClick={close}>How it Works</a>
            <a href="#features"     className="navbar__mobile-link" onClick={close}>For Freelancers</a>
          </>
        ) : (
          <>
            <Link to="/dashboard" className="navbar__mobile-link" onClick={close}>Dashboard</Link>
            <Link to="/submit"    className="navbar__mobile-link" onClick={close}>Submit Work</Link>
            <Link to="/score"     className="navbar__mobile-link" onClick={close}>My Score</Link>
          </>
        )}

        <div className="navbar__mobile-divider" />

        <WalletButton className="navbar__mobile-cta" />
      </div>
    </nav>
  )
}

export default Navbar
