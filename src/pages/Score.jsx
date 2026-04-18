import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import Navbar from '../components/Navbar'
import { computePodScore, getScoreHistory } from '../services/ogCompute'
import '../App.css'
import './Score.css'

/* =====================================================
   POD — Score Breakdown Page
   Shows the AI-generated reputation score with full
   category breakdown, history chart, and tips.
   Fetches real score from 0G Compute; falls back to
   a local algorithm when unavailable.
   ===================================================== */

/* ── Category metadata (colors & icons per slot) ──── */
const CATEGORY_META = [
  { id: 'delivery',     icon: '◈', color: '#6C63FF' },
  { id: 'satisfaction', icon: '◉', color: '#8b5cf6' },
  { id: 'ontime',       icon: '◷', color: '#a78bfa' },
  { id: 'diversity',    icon: '◑', color: '#7c3aed' },
]

/* ── Insight sentences per category ─────────────────── */
function categoryInsight(label, value) {
  if (value >= 85) return `Strong performance in ${label.toLowerCase()}. Keep it up.`
  if (value >= 60) return `Good ${label.toLowerCase()}, with room to improve further.`
  if (value >= 30) return `${label} is developing. More verified proofs will help.`
  return `${label} needs attention — submit more work to improve this area.`
}

/* ── Icon components ─────────────────────────────── */
function ClientIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.75"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}
function DiversifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.75"/>
      <circle cx="17.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.75"/>
    </svg>
  )
}

/* ── Generate dynamic tips based on score breakdown ── */
function generateTips(breakdown) {
  if (!breakdown || breakdown.length === 0) return []

  /* Sort by weakest area first */
  const sorted = [...breakdown].sort((a, b) => a.value - b.value)
  const tips = []

  const weakest = sorted[0]
  if (weakest && weakest.value < 80) {
    tips.push({
      id: 1,
      title: `Improve ${weakest.label}`,
      desc: `Your weakest category at ${weakest.value}%. Focus here for the biggest score boost.`,
      bonus: `+${Math.max(10, 80 - weakest.value)} score potential`,
      icon: DiversifyIcon,
      urgency: 'high',
    })
  }

  tips.push({
    id: 2,
    title: 'Get Client Attestations',
    desc: 'Ask past clients to verify your work on-chain for higher trust.',
    bonus: '+50 score potential',
    icon: ClientIcon,
    urgency: tips.length === 0 ? 'high' : 'medium',
  })

  tips.push({
    id: 3,
    title: 'Submit More Proofs',
    desc: 'Each verified proof strengthens your on-chain reputation.',
    bonus: '+35 score potential',
    icon: UploadIcon,
    urgency: 'low',
  })

  return tips
}

/* ── Animated counter hook ───────────────────────── */
function useCountUp(target, duration = 1800, delay = 300) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let rafId
    let startTime = null

    const delayTimer = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * target))
        if (progress < 1) rafId = requestAnimationFrame(animate)
      }
      rafId = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(delayTimer)
      cancelAnimationFrame(rafId)
    }
  }, [target, duration, delay])

  return count
}

/* ── AI Typing component ─────────────────────────── */
function AITypingText({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone]           = useState(false)
  const indexRef                  = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    // Small delay before typing starts so the page settles
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1
        setDisplayed(text.slice(0, indexRef.current))
        if (indexRef.current >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, 600)
    return () => clearTimeout(startDelay)
  }, [text, speed])

  return (
    <p className="ai-text">
      {displayed}
      {!done && <span className="ai-cursor" aria-hidden="true">|</span>}
    </p>
  )
}

/* ── Score ring (CSS conic-gradient) ─────────────── */
function ScoreRingLarge({ value, displayValue, max }) {
  const deg = Math.round((value / max) * 360)
  return (
    <div className="score-ring-lg">
      <div
        className="score-ring-lg__track"
        style={{
          background: `conic-gradient(
            #6C63FF 0deg,
            #8b5cf6 ${deg}deg,
            rgba(255,255,255,0.05) ${deg}deg
          )`,
        }}
        aria-label={`POD Score ${value} out of ${max}`}
      >
        <div className="score-ring-lg__inner">
          <span className="score-ring-lg__value">{displayValue}</span>
          <span className="score-ring-lg__label">POD Score</span>
        </div>
      </div>
    </div>
  )
}

/* ── Category card ───────────────────────────────── */
function CategoryCard({ cat, animate }) {
  return (
    <div className="cat-card">
      <div className="cat-card__header">
        <div className="cat-card__icon" aria-hidden="true">{cat.icon}</div>
        <div className="cat-card__label-group">
          <h3 className="cat-card__label">{cat.label}</h3>
          <div className="cat-card__score-row">
            <span className="cat-card__score" style={{ color: cat.color }}>
              {cat.score}
            </span>
            <span className="cat-card__score-max">/ {cat.max}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="cat-bar">
        <div
          className="cat-bar__fill"
          style={{
            width:      animate ? `${cat.score}%` : '0%',
            background: `linear-gradient(90deg, ${cat.color}, ${cat.color}aa)`,
          }}
          role="progressbar"
          aria-valuenow={cat.score}
          aria-valuemin={0}
          aria-valuemax={cat.max}
        />
      </div>

      <p className="cat-card__insight">{cat.insight}</p>
    </div>
  )
}

/* ── Bar chart (CSS only) ────────────────────────── */
function BarChart({ data }) {
  const [animate, setAnimate] = useState(false)
  const ref = useRef(null)

  /* Derive chart range from actual data */
  const values  = data.map(d => d.value)
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values)
  const chartMin = Math.max(0, Math.floor((dataMin - 50) / 50) * 50)
  const chartMax = Math.ceil((dataMax + 50) / 50) * 50
  const chartMid = Math.round((chartMin + chartMax) / 2)
  const range    = chartMax - chartMin || 1

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="chart" ref={ref} aria-label="POD Score history">
      {/* Y-axis labels */}
      <div className="chart__y-axis" aria-hidden="true">
        <span>{chartMax}</span>
        <span>{chartMid}</span>
        <span>{chartMin}</span>
      </div>

      <div className="chart__area">
        {/* Horizontal grid lines */}
        <div className="chart__grid" aria-hidden="true">
          <div className="chart__grid-line" />
          <div className="chart__grid-line" />
          <div className="chart__grid-line" />
        </div>

        {/* Bars */}
        <div className="chart__bars">
          {data.map((item, i) => {
            const pct = ((item.value - chartMin) / range) * 100
            const isLast = i === data.length - 1
            return (
              <div className="chart__col" key={item.month}>
                <span
                  className={`chart__bar-label ${animate ? 'chart__bar-label--visible' : ''}`}
                  style={{ transitionDelay: `${i * 80 + 200}ms` }}
                >
                  {item.value}
                </span>
                <div
                  className={`chart__bar ${isLast ? 'chart__bar--current' : ''}`}
                  style={{
                    height: animate ? `${pct}%` : '0%',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
                <span className="chart__month">{item.month}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Main page component ─────────────────────────── */
function Score() {
  const { address, isConnected } = useAccount()
  const [score, setScore]       = useState(null)
  const [loading, setLoading]   = useState(false)

  /* Fetch score when wallet connects */
  useEffect(() => {
    if (!isConnected || !address) { setScore(null); return }
    let cancelled = false
    setLoading(true)
    computePodScore(address)
      .then(s => { if (!cancelled) setScore(s) })
      .catch(err => console.error('Score compute error:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [address, isConnected])

  const scoreValue  = score?.value      ?? 0
  const scoreMax    = score?.max        ?? 1000
  const percentile  = score?.percentile ?? 100
  const breakdown   = score?.breakdown  ?? []
  const totalProofs = score?.totalProjects ?? 0
  const aiInsight   = score?.aiInsight  ?? 'Connect your wallet to see your AI-generated score analysis.'

  const displayScore = useCountUp(scoreValue, 1800, 400)

  /* Map breakdown to category card format */
  const categories = breakdown.map((item, i) => {
    const meta = CATEGORY_META[i] || CATEGORY_META[0]
    return {
      id:      meta.id,
      label:   item.label,
      score:   item.value,
      max:     100,
      icon:    meta.icon,
      insight: categoryInsight(item.label, item.value),
      color:   meta.color,
    }
  })

  /* Build chart data from score history */
  const history = getScoreHistory(address)
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const chartData = history.map(h => {
    const d = new Date(h.date)
    return { month: MONTH_NAMES[d.getMonth()] || '?', value: h.value }
  })

  /* Generate tips based on breakdown */
  const tips = generateTips(breakdown)

  const [catsVisible, setCatsVisible] = useState(false)
  const catsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCatsVisible(true); observer.disconnect() } },
      { threshold: 0.2 }
    )
    if (catsRef.current) observer.observe(catsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="score-page">
      <Navbar variant="dashboard" />

      <main className="score-main">
        <div className="score-container">

          {/* ── Hero score section ─────────────────── */}
          <section className="score-hero fade-up" style={{ '--delay': '0ms' }}>
            {/* Background glow */}
            <div className="score-hero__orb" aria-hidden="true" />

            <div className="score-hero__ring-wrap">
              <ScoreRingLarge
                value={scoreValue}
                displayValue={loading ? '...' : displayScore}
                max={scoreMax}
              />
            </div>

            <div className="score-hero__meta">
              <span className="score-hero__percentile">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#6C63FF" strokeWidth="1.75" strokeLinejoin="round"/>
                </svg>
                {scoreValue > 0 ? `Top ${percentile}% Globally` : 'Not Yet Ranked'}
              </span>

              <h1 className="score-hero__title">Your POD Score</h1>
              <p className="score-hero__sub">
                {totalProofs > 0
                  ? `Calculated from ${totalProofs} verified work proof${totalProofs === 1 ? '' : 's'} via ${score?.source === '0g-compute' ? '0G Compute AI' : 'local algorithm'}.`
                  : 'Submit work proofs to generate your AI-powered reputation score.'}
              </p>

              <div className="score-hero__updated">
                <span className="score-hero__updated-dot" aria-hidden="true" />
                {score?.source === '0g-compute' ? 'Scored by 0G Compute' : score?.source === 'local' ? 'Scored locally' : 'No score yet'}
              </div>
            </div>
          </section>

          {/* ── Category breakdown ─────────────────── */}
          {categories.length > 0 && (
            <section ref={catsRef} className="score-cats fade-up" style={{ '--delay': '100ms' }}>
              <div className="section-label-row">
                <p className="section-eyebrow">Score Breakdown</p>
                <h2 className="score-section-title">How your score is calculated</h2>
              </div>

              <div className="cats-grid">
                {categories.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} animate={catsVisible} />
                ))}
              </div>
            </section>
          )}

          {/* ── AI Insights ────────────────────────── */}
          <section className="ai-insights fade-up" style={{ '--delay': '160ms' }}>
            <div className="ai-insights__header">
              <div className="ai-insights__icon" aria-hidden="true">
                {/* Sparkle icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" stroke="#6C63FF" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="section-eyebrow" style={{ marginBottom: '2px' }}>AI Analysis</p>
                <h2 className="score-section-title" style={{ marginBottom: 0 }}>
                  What the AI sees in your work
                </h2>
              </div>
            </div>

            <div className="ai-insights__body">
              <div className="ai-insights__prompt-chip" aria-hidden="true">
                {totalProofs > 0
                  ? `Analyzing ${totalProofs} proof${totalProofs === 1 ? '' : 's'} · 0G Network · POD AI`
                  : 'No proofs to analyze yet'}
              </div>
              <AITypingText text={aiInsight} speed={18} />
            </div>
          </section>

          {/* ── Score history chart ─────────────────── */}
          {chartData.length > 1 && (
            <section className="score-history fade-up" style={{ '--delay': '220ms' }}>
              <div className="section-label-row">
                <p className="section-eyebrow">Score History</p>
                <h2 className="score-section-title">Your progress over time</h2>
              </div>
              <div className="score-history__card">
                <BarChart data={chartData} />
              </div>
            </section>
          )}

          {/* ── Improvement tips ───────────────────── */}
          {tips.length > 0 && (
            <section className="score-tips fade-up" style={{ '--delay': '280ms' }}>
              <div className="section-label-row">
                <p className="section-eyebrow">Recommendations</p>
                <h2 className="score-section-title">How to improve your score</h2>
              </div>

              <div className="tips-grid">
                {tips.map(tip => {
                  const Icon = tip.icon
                  return (
                    <div className={`tip-card tip-card--${tip.urgency}`} key={tip.id}>
                      <div className="tip-card__icon">
                        <Icon />
                      </div>
                      <div className="tip-card__body">
                        <h3 className="tip-card__title">{tip.title}</h3>
                        <p className="tip-card__desc">{tip.desc}</p>
                        <span className="tip-card__bonus">{tip.bonus}</span>
                      </div>
                      <button className="btn btn--ghost tip-card__btn">
                        Take Action
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  )
}

export default Score
