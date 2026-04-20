import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import Navbar from '../components/Navbar'
import { computePodScore, getProofs } from '../services/ogCompute'
import { mintAgentId, getAgentId } from '../services/agentId'
import '../App.css'
import './Dashboard.css'

/* =====================================================
   POD — Dashboard / Profile Page
   Fetches real score from 0G Compute + local proofs.
   Falls back to a local scoring algorithm when the
   0G Serving Broker is unavailable.
   ===================================================== */

/* ── SVG Icon helpers (inline, no dependency) ────── */
function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M12 12v3M10 14h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M12 6v12M9.5 9.5A2.5 2.5 0 0112 8h.5a2.5 2.5 0 010 5h-1a2.5 2.5 0 000 5H12a2.5 2.5 0 002.5-2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M3 12h18M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l7 3v5c0 5-3.5 9.74-7 11-3.5-1.26-7-6-7-11V5l7-3z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function ExternalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Score ring — CSS conic-gradient technique ────── */
function ScoreRing({ value, max }) {
  const pct = value / max  // 0–1
  const deg = Math.round(pct * 360)

  return (
    <div className="score-ring" aria-label={`POD Score: ${value} out of ${max}`}>
      {/* Outer ring via conic-gradient */}
      <div
        className="score-ring__track"
        style={{
          background: `conic-gradient(
            #6C63FF 0deg,
            #8b5cf6 ${deg}deg,
            rgba(255,255,255,0.06) ${deg}deg
          )`,
        }}
      >
        {/* Inner circle cuts out to create the ring shape */}
        <div className="score-ring__inner">
          <span className="score-ring__value">{value}</span>
          <span className="score-ring__label">POD Score</span>
        </div>
      </div>
    </div>
  )
}

/* ── Mini bar for score breakdown ────────────────── */
function ScoreBar({ label, value }) {
  return (
    <div className="score-bar">
      <div className="score-bar__header">
        <span className="score-bar__label">{label}</span>
        <span className="score-bar__value">{value}%</span>
      </div>
      <div className="score-bar__track">
        <div
          className="score-bar__fill"
          style={{ width: `${value}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}

/* ── Main Dashboard component ────────────────────── */
function Dashboard() {
  const { address, isConnected } = useAccount()
  const [score, setScore]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [agentRecord, setAgentRecord] = useState(null)
  const [minting, setMinting]   = useState(false)
  const [mintError, setMintError] = useState('')
  const [justMinted, setJustMinted] = useState(false)

  /* Fetch score whenever the connected wallet changes */
  useEffect(() => {
    if (!isConnected || !address) {
      setScore(null)
      return
    }
    let cancelled = false
    setLoading(true)
    computePodScore(address)
      .then(s => { if (!cancelled) setScore(s) })
      .catch(err => console.error('Score compute error:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [address, isConnected])

  /* Load existing Agent ID record */
  useEffect(() => {
    if (isConnected && address) {
      setAgentRecord(getAgentId(address))
    } else {
      setAgentRecord(null)
    }
    setJustMinted(false)
    setMintError('')
  }, [address, isConnected])

  /* Mint Agent ID handler */
  async function handleMint() {
    if (!score || score.value === 0 || minting) return
    setMinting(true)
    setMintError('')
    try {
      const record = await mintAgentId(address, score)
      setAgentRecord(record)
      setJustMinted(true)
    } catch (err) {
      console.error('Mint failed:', err)
      setMintError(err.message || 'Minting failed. Please try again.')
    } finally {
      setMinting(false)
    }
  }

  /* Derive display values from real wallet */
  const displayAddress = isConnected && address
    ? address
    : ''
  const shortAddress = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''
  const avatarInitials = isConnected && address
    ? address.slice(2, 4).toUpperCase()
    : '--'

  /* Use computed score or sensible defaults */
  const scoreValue      = score?.value         ?? 0
  const scoreMax        = score?.max           ?? 1000
  const scorePercentile = score?.percentile    ?? 100
  const breakdown       = score?.breakdown     ?? []
  const totalProjects   = score?.totalProjects ?? 0
  const totalEarned     = score?.totalEarned   ?? '$0'
  const proofs          = score?.proofs        ?? []

  /* Unique client wallets for the "Countries" stat (repurposed as "Clients") */
  const uniqueClients = new Set(
    proofs.map(p => p.clientWallet?.toLowerCase()).filter(Boolean),
  ).size

  const stats = [
    { label: 'Total Projects', value: String(totalProjects), icon: BriefcaseIcon },
    { label: 'Total Earned',   value: totalEarned,           icon: DollarIcon    },
    { label: 'Clients',        value: String(uniqueClients),  icon: GlobeIcon     },
    { label: 'POD Score',      value: String(scoreValue),     icon: ShieldIcon    },
  ]

  /* Format proofs for the work history cards */
  const workCards = proofs.map((p, i) => ({
    id:     i + 1,
    title:  p.title || 'Untitled Project',
    desc:   p.description || '—',
    amount: `$${Number(p.paymentAmount || 0).toLocaleString()}`,
    date:   p.completionDate
      ? new Date(p.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—',
    status: 'Verified',
    hash:   p.txHash
      ? `${p.txHash.slice(0, 6)}...${p.txHash.slice(-4)}`
      : '—',
  }))

  return (
    <div className="dash">

      <Navbar variant="dashboard" />

      <main className="dash__main">
        <div className="dash__container">

          {/* ── 1. Profile Header ──────────────────────── */}
          <section className="profile fade-up" style={{ '--delay': '0ms' }}>
            {/* Gradient avatar */}
            <div className="profile__avatar" aria-label="User avatar">
              <span className="profile__avatar-initials">{avatarInitials}</span>
            </div>

            <div className="profile__info">
              <div className="profile__name-row">
                <h1 className="profile__name">
                  {isConnected ? shortAddress : 'Not Connected'}
                </h1>
                {isConnected && (
                  <span className="profile__verified-badge">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verified Freelancer
                  </span>
                )}
              </div>

              {isConnected && (
                <button
                  className="profile__address"
                  onClick={() => navigator.clipboard?.writeText(displayAddress)}
                  title="Copy full address"
                >
                  <span className="profile__address-text">{shortAddress}</span>
                  <CopyIcon />
                </button>
              )}

              <p className="profile__meta">
                {totalProjects > 0
                  ? `${totalProjects} verified proof${totalProjects === 1 ? '' : 's'} on 0G Network`
                  : 'No proofs submitted yet'}
              </p>
            </div>

            <button className="btn btn--ghost profile__edit-btn">
              <EditIcon />
              Edit Profile
            </button>
          </section>

          {/* ── 2. POD Score Card ─────────────────────── */}
          <section className="score-card fade-up" style={{ '--delay': '80ms' }}>
            {/* Background glow */}
            <div className="score-card__orb" aria-hidden="true" />

            <div className="score-card__left">
              <ScoreRing value={loading ? 0 : scoreValue} max={scoreMax} />
            </div>

            <div className="score-card__right">
              <div className="score-card__header">
                <p className="section-eyebrow" style={{ marginBottom: '8px' }}>Reputation Score</p>
                <h2 className="score-card__title">
                  {loading
                    ? 'Computing your score...'
                    : scoreValue > 0
                      ? `Top ${scorePercentile}% of all freelancers globally`
                      : 'Submit work proofs to build your score'}
                </h2>
                <p className="score-card__sub">
                  Your POD Score is calculated from verified work history, client feedback, and delivery consistency.
                </p>
              </div>

              <div className="score-card__breakdown">
                {breakdown.map(item => (
                  <ScoreBar key={item.label} label={item.label} value={loading ? 0 : item.value} />
                ))}
              </div>

              <Link to="/score" className="btn btn--ghost score-card__cta">
                View Full Breakdown
                <ExternalIcon />
              </Link>
            </div>
          </section>

          {/* ── 3. Stats Row ──────────────────────────── */}
          <section className="dash-stats fade-up" style={{ '--delay': '160ms' }}>
            {stats.map(({ label, value, icon: Icon }) => (
              <div className="dash-stat-card" key={label}>
                <div className="dash-stat-card__icon">
                  <Icon />
                </div>
                <span className="dash-stat-card__value">{loading ? '—' : value}</span>
                <span className="dash-stat-card__label">{label}</span>
              </div>
            ))}
          </section>

          {/* ── 4. Work History ───────────────────────── */}
          <section className="work-history fade-up" style={{ '--delay': '240ms' }}>
            <div className="work-history__header">
              <div>
                <h2 className="work-history__title">Verified Work History</h2>
                <p className="work-history__sub">
                  {workCards.length} proof{workCards.length === 1 ? '' : 's'} stored on 0G Network
                </p>
              </div>
              <Link to="/submit" className="btn btn--primary">
                + Submit Work
              </Link>
            </div>

            <div className="work-history__list">
              {workCards.length === 0 && (
                <div className="work-card" style={{ justifyContent: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
                    No work proofs yet. Submit your first project to get started.
                  </p>
                </div>
              )}
              {workCards.map((job, i) => (
                <div
                  className="work-card fade-up"
                  key={job.id}
                  style={{ '--delay': `${i * 60}ms` }}
                >
                  <div className="work-card__left">
                    {/* Numbered index */}
                    <div className="work-card__index">{String(i + 1).padStart(2, '0')}</div>
                  </div>

                  <div className="work-card__body">
                    <div className="work-card__title-row">
                      <h3 className="work-card__title">{job.title}</h3>
                      <span className="work-card__status">
                        <span className="work-card__status-dot" />
                        {job.status}
                      </span>
                    </div>
                    <p className="work-card__desc">{job.desc}</p>
                    <div className="work-card__meta">
                      <span className="work-card__hash" title={job.hash}>
                        {/* Chain icon */}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                        </svg>
                        {job.hash}
                      </span>
                      <span className="work-card__date">{job.date}</span>
                    </div>
                  </div>

                  <div className="work-card__right">
                    <span className="work-card__amount">{job.amount}</span>
                    <button className="btn btn--ghost work-card__btn">
                      View Proof
                      <ExternalIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. Agent ID Card ──────────────────────── */}
          <section className={`agent-card fade-up${justMinted ? ' agent-card--minted' : ''}`} style={{ '--delay': '320ms' }}>
            {/* Decorative top-right corner glow */}
            <div className="agent-card__glow" aria-hidden="true" />

            {/* ── Success overlay (shown right after minting) ── */}
            {justMinted && agentRecord && (
              <div className="agent-card__success-overlay">
                <div className="agent-card__success-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.75"/>
                    <path d="M8 12l3 3 5-5" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="agent-card__success-title">Agent ID Minted!</h3>
                <p className="agent-card__success-id">{agentRecord.agentId}</p>
                <div className="agent-card__success-details">
                  <div className="agent-detail">
                    <span className="agent-detail__label">Transaction</span>
                    <span className="agent-detail__value agent-detail__value--mono">
                      {agentRecord.txHash.slice(0, 10)}...{agentRecord.txHash.slice(-8)}
                    </span>
                  </div>
                  <div className="agent-detail">
                    <span className="agent-detail__label">Score Recorded</span>
                    <span className="agent-detail__value">{agentRecord.score} / 1000</span>
                  </div>
                </div>
                <div className="agent-card__actions">
                  <a
                    href={`https://chainscan-galileo.0g.ai/tx/${agentRecord.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary"
                  >
                    <ExternalIcon />
                    View Transaction
                  </a>
                  <button className="btn btn--ghost" onClick={() => setJustMinted(false)}>
                    View Agent ID
                  </button>
                </div>
              </div>
            )}

            {/* ── Normal card content ── */}
            {!justMinted && (
              <>
                <div className="agent-card__header">
                  <div className="agent-card__icon-wrap" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="#6C63FF" strokeWidth="1.75" strokeLinejoin="round"/>
                      <text x="12" y="16" textAnchor="middle" fill="#6C63FF" fontSize="8" fontFamily="Syne, sans-serif" fontWeight="700">ID</text>
                    </svg>
                  </div>
                  <div>
                    <p className="section-eyebrow" style={{ marginBottom: '4px' }}>On-Chain Identity</p>
                    <h2 className="agent-card__title">Your Agent ID</h2>
                  </div>

                  <span className={`agent-card__minted-badge${agentRecord ? ' agent-card__minted-badge--active' : ''}`}>
                    <span className="hero__badge-dot" style={{ width: '6px', height: '6px' }} />
                    {agentRecord ? 'Minted' : 'Not Minted'}
                  </span>
                </div>

                <div className="agent-card__body">
                  <div className="agent-card__details">
                    <div className="agent-detail">
                      <span className="agent-detail__label">Wallet</span>
                      <span className="agent-detail__value agent-detail__value--accent">
                        {isConnected ? shortAddress : '—'}
                      </span>
                    </div>
                    {agentRecord ? (
                      <div className="agent-detail">
                        <span className="agent-detail__label">Agent ID</span>
                        <span className="agent-detail__value agent-detail__value--accent">
                          {agentRecord.agentId}
                        </span>
                      </div>
                    ) : (
                      <div className="agent-detail">
                        <span className="agent-detail__label">Proofs</span>
                        <span className="agent-detail__value">{totalProjects}</span>
                      </div>
                    )}
                    <div className="agent-detail">
                      <span className="agent-detail__label">Network</span>
                      <span className="agent-detail__value">0G Galileo</span>
                    </div>
                    {agentRecord ? (
                      <div className="agent-detail">
                        <span className="agent-detail__label">Minted</span>
                        <span className="agent-detail__value">
                          {new Date(agentRecord.mintedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <div className="agent-detail">
                        <span className="agent-detail__label">Score Source</span>
                        <span className="agent-detail__value">
                          {score?.source === '0g-compute' ? '0G Compute AI' : score?.source === 'local' ? 'Local Algorithm' : '—'}
                        </span>
                      </div>
                    )}
                    {agentRecord && (
                      <div className="agent-detail agent-detail--wide">
                        <span className="agent-detail__label">Transaction</span>
                        <span className="agent-detail__value agent-detail__value--mono">
                          {agentRecord.txHash.slice(0, 10)}...{agentRecord.txHash.slice(-8)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className="agent-card__score-chip"
                    style={{
                      background: `conic-gradient(
                        #6C63FF 0deg,
                        #8b5cf6 ${Math.round((scoreValue / 1000) * 360)}deg,
                        rgba(255,255,255,0.06) ${Math.round((scoreValue / 1000) * 360)}deg
                      )`,
                    }}
                  >
                    <span className="agent-card__score-chip-value">{scoreValue}</span>
                    <span className="agent-card__score-chip-label">POD Score</span>
                    <div className="agent-card__score-chip-ring" aria-hidden="true" />
                  </div>
                </div>

                {mintError && (
                  <p className="agent-card__error">{mintError}</p>
                )}

                <div className="agent-card__actions">
                  {!agentRecord && scoreValue > 0 && (
                    <button
                      className="btn btn--primary agent-card__mint-btn"
                      onClick={handleMint}
                      disabled={minting}
                    >
                      {minting ? (
                        <>
                          <span className="agent-card__spinner" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                          </svg>
                          Mint Agent ID
                        </>
                      )}
                    </button>
                  )}
                  {agentRecord && (
                    <a
                      href={`https://chainscan-galileo.0g.ai/tx/${agentRecord.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--primary"
                    >
                      <ExternalIcon />
                      View on Chain
                    </a>
                  )}
                  <button className="btn btn--ghost">
                    <ShareIcon />
                    Share Identity
                  </button>
                </div>
              </>
            )}
          </section>

        </div>{/* end dash__container */}
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="footer dash__footer">
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
          <p className="footer__copy">&copy; 2026 POD. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default Dashboard
