import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WalletButton from '../components/WalletButton'
import '../App.css'

/* =====================================================
   POD — Landing Page
   ===================================================== */
function Landing() {
  return (
    <div className="pod-app">

      <Navbar variant="landing" />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__orb hero__orb--1" aria-hidden="true" />
        <div className="hero__orb hero__orb--2" aria-hidden="true" />
        <div className="hero__orb hero__orb--3" aria-hidden="true" />

        <div className="hero__content">
          <div className="hero__badge fade-up" style={{ '--delay': '0ms' }}>
            <span className="hero__badge-dot" />
            Now live on testnet
          </div>

          <h1 className="hero__headline fade-up" style={{ '--delay': '80ms' }}>
            Own Your Work.<br />
            Build Your Reputation.
          </h1>

          <p className="hero__sub fade-up" style={{ '--delay': '160ms' }}>
            POD turns your completed projects into verifiable on-chain proof —
            creating a reputation score that travels with you, forever.
          </p>

          <div className="hero__actions fade-up" style={{ '--delay': '240ms' }}>
            <Link to="/dashboard" className="btn btn--primary btn--lg">Get Started</Link>
            <a href="#how-it-works" className="btn btn--ghost btn--lg">
              See How It Works
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section className="stats fade-up" style={{ '--delay': '320ms' }}>
        <div className="stats__inner">
          <div className="stats__item">
            <span className="stats__value">12,400+</span>
            <span className="stats__label">Freelancers</span>
          </div>
          <div className="stats__divider" aria-hidden="true" />
          <div className="stats__item">
            <span className="stats__value">$2.1M+</span>
            <span className="stats__label">Work Verified</span>
          </div>
          <div className="stats__divider" aria-hidden="true" />
          <div className="stats__item">
            <span className="stats__value">190+</span>
            <span className="stats__label">Countries</span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="section-header fade-up" style={{ '--delay': '0ms' }}>
            <p className="section-eyebrow">Built different</p>
            <h2 className="section-title">Your reputation, on-chain.</h2>
            <p className="section-desc">
              No platform can gatekeep your work history. POD makes your track record permanent, portable, and provable.
            </p>
          </div>

          <div className="features__grid">
            <div className="feature-card fade-up" style={{ '--delay': '80ms' }}>
              <div className="feature-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" stroke="#6C63FF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Proof of Work</h3>
              <p className="feature-card__desc">
                Every completed project is stored permanently on 0G Storage. Immutable, verifiable, yours.
              </p>
              <div className="feature-card__tag">0G Storage</div>
            </div>

            <div className="feature-card feature-card--accent fade-up" style={{ '--delay': '160ms' }}>
              <div className="feature-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" stroke="#6C63FF" strokeWidth="1.75"/>
                  <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#6C63FF" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">AI Reputation Score</h3>
              <p className="feature-card__desc">
                An AI agent reads your work history and generates a POD Score — a single number that proves your value.
              </p>
              <div className="feature-card__tag">AI Agent</div>
            </div>

            <div className="feature-card fade-up" style={{ '--delay': '240ms' }}>
              <div className="feature-card__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6C63FF" strokeWidth="1.75"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="#6C63FF" strokeWidth="1.75" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1.5" fill="#6C63FF"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Agent ID</h3>
              <p className="feature-card__desc">
                Your score mints as an on-chain identity. Take it anywhere. No platform can take it away.
              </p>
              <div className="feature-card__tag">On-chain NFT</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────── */}
      <section className="how" id="how-it-works">
        <div className="section-inner">
          <div className="section-header fade-up" style={{ '--delay': '0ms' }}>
            <p className="section-eyebrow">The process</p>
            <h2 className="section-title">Three steps to your on-chain reputation.</h2>
          </div>

          <div className="how__steps">
            <div className="how__step fade-up" style={{ '--delay': '80ms' }}>
              <div className="how__step-num">01</div>
              <div className="how__step-connector" aria-hidden="true" />
              <div className="how__step-body">
                <h3 className="how__step-title">Connect Wallet</h3>
                <p className="how__step-desc">
                  Link your Web3 wallet to create your POD identity. No email, no passwords, no middlemen.
                </p>
              </div>
            </div>

            <div className="how__step fade-up" style={{ '--delay': '160ms' }}>
              <div className="how__step-num">02</div>
              <div className="how__step-connector" aria-hidden="true" />
              <div className="how__step-body">
                <h3 className="how__step-title">Submit Work Proofs</h3>
                <p className="how__step-desc">
                  Upload contracts, deliverables, client attestations, or GitHub commits. POD stores them permanently on 0G.
                </p>
              </div>
            </div>

            <div className="how__step fade-up" style={{ '--delay': '240ms' }}>
              <div className="how__step-num">03</div>
              <div className="how__step-body">
                <h3 className="how__step-title">Get Your POD Score</h3>
                <p className="how__step-desc">
                  Our AI agent analyzes your verified history and issues your POD Score — minted on-chain as your Agent ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="cta fade-up" style={{ '--delay': '0ms' }}>
        <div className="cta__orb" aria-hidden="true" />
        <div className="cta__inner">
          <h2 className="cta__title">Ready to own your reputation?</h2>
          <p className="cta__sub">
            Join thousands of freelancers building their on-chain identity with POD.
          </p>
          <WalletButton className="btn--lg" />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <Link to="/" className="navbar__logo footer__logo">
              <span className="navbar__logo-mark">◈</span>
              POD
            </Link>
            <p className="footer__tagline">Own Your Work.</p>
          </div>

          <div className="footer__links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
        <div className="footer__bottom">
          <p className="footer__copy">© 2026 POD. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default Landing
