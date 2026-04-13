import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import '../App.css'
import './Score.css'

/* =====================================================
   POD — Score Breakdown Page
   Shows the AI-generated reputation score with full
   category breakdown, history chart, and tips.
   All data is mock / hardcoded — no chain calls yet.
   ===================================================== */

/* ── Mock data ───────────────────────────────────── */
const SCORE_VALUE = 742
const SCORE_MAX   = 1000
const PERCENTILE  = 12

const CATEGORIES = [
  {
    id: 'delivery',
    label: 'Delivery Quality',
    score: 89,
    max: 100,
    icon: '◈',
    insight: 'Consistently delivers complete, professional work with thorough documentation.',
    color: '#6C63FF',
  },
  {
    id: 'satisfaction',
    label: 'Client Satisfaction',
    score: 88,
    max: 100,
    icon: '◉',
    insight: 'High repeat client rate and positive feedback across all project types.',
    color: '#8b5cf6',
  },
  {
    id: 'ontime',
    label: 'On-Time Rate',
    score: 91,
    max: 100,
    icon: '◷',
    insight: 'Rarely misses deadlines across all projects. Strong time management habits.',
    color: '#a78bfa',
  },
  {
    id: 'diversity',
    label: 'Work Diversity',
    score: 76,
    max: 100,
    icon: '◑',
    insight: 'Strong variety of project types and industries, with room to expand further.',
    color: '#7c3aed',
  },
]

/* Score history — last 6 months */
const HISTORY = [
  { month: 'Jan', value: 580 },
  { month: 'Feb', value: 623 },
  { month: 'Mar', value: 668 },
  { month: 'Apr', value: 701 },
  { month: 'May', value: 728 },
  { month: 'Jun', value: 742 },
]

const TIPS = [
  {
    id: 1,
    title: 'Get Client Attestations',
    desc: 'Ask past clients to verify your work on-chain.',
    bonus: '+50 score potential',
    icon: ClientIcon,
    urgency: 'high',
  },
  {
    id: 2,
    title: 'Submit More Proofs',
    desc: 'You have 3 unsubmitted projects. Add them to boost your score.',
    bonus: '+35 score potential',
    icon: UploadIcon,
    urgency: 'medium',
  },
  {
    id: 3,
    title: 'Diversify Work Types',
    desc: 'Your lowest category. Try new project types to improve.',
    bonus: '+28 score potential',
    icon: DiversifyIcon,
    urgency: 'low',
  },
]

/* Full AI analysis text — typed out on load */
const AI_TEXT =
  'Based on 23 verified work proofs, your strongest attribute is delivery consistency. ' +
  'Clients report high satisfaction with communication and final output quality. ' +
  'To improve your score, consider expanding into new industries and collecting more ' +
  'client attestations from past engagements.'

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
/* Bars are scaled from a baseline of 500 to max 800 */
const CHART_MIN = 500
const CHART_MAX = 800

function BarChart({ data }) {
  const [animate, setAnimate] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    // Trigger bar growth via IntersectionObserver so it fires when visible
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="chart" ref={ref} aria-label="POD Score history over 6 months">
      {/* Y-axis labels */}
      <div className="chart__y-axis" aria-hidden="true">
        <span>800</span>
        <span>650</span>
        <span>500</span>
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
            const pct = ((item.value - CHART_MIN) / (CHART_MAX - CHART_MIN)) * 100
            const isLast = i === data.length - 1
            return (
              <div className="chart__col" key={item.month}>
                {/* Value label above bar */}
                <span
                  className={`chart__bar-label ${animate ? 'chart__bar-label--visible' : ''}`}
                  style={{ transitionDelay: `${i * 80 + 200}ms` }}
                >
                  {item.value}
                </span>
                {/* The bar itself */}
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
  const displayScore = useCountUp(SCORE_VALUE, 1800, 400)
  const [catsVisible, setCatsVisible] = useState(false)
  const catsRef = useRef(null)

  // Trigger category bar animations when the section scrolls into view
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
                value={SCORE_VALUE}
                displayValue={displayScore}
                max={SCORE_MAX}
              />
            </div>

            <div className="score-hero__meta">
              <span className="score-hero__percentile">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#6C63FF" strokeWidth="1.75" strokeLinejoin="round"/>
                </svg>
                Top {PERCENTILE}% Globally
              </span>

              <h1 className="score-hero__title">Your POD Score</h1>
              <p className="score-hero__sub">
                Calculated from 23 verified work proofs across 7 countries and 4 categories.
              </p>

              <div className="score-hero__updated">
                <span className="score-hero__updated-dot" aria-hidden="true" />
                Updated 2 hours ago
              </div>
            </div>
          </section>

          {/* ── Category breakdown ─────────────────── */}
          <section ref={catsRef} className="score-cats fade-up" style={{ '--delay': '100ms' }}>
            <div className="section-label-row">
              <p className="section-eyebrow">Score Breakdown</p>
              <h2 className="score-section-title">How your score is calculated</h2>
            </div>

            <div className="cats-grid">
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} cat={cat} animate={catsVisible} />
              ))}
            </div>
          </section>

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
                Analyzing 23 proofs · 0G Network · POD AI v2.1
              </div>
              <AITypingText text={AI_TEXT} speed={18} />
            </div>
          </section>

          {/* ── Score history chart ─────────────────── */}
          <section className="score-history fade-up" style={{ '--delay': '220ms' }}>
            <div className="section-label-row">
              <p className="section-eyebrow">Score History</p>
              <h2 className="score-section-title">Your progress over 6 months</h2>
            </div>
            <div className="score-history__card">
              <BarChart data={HISTORY} />
            </div>
          </section>

          {/* ── Improvement tips ───────────────────── */}
          <section className="score-tips fade-up" style={{ '--delay': '280ms' }}>
            <div className="section-label-row">
              <p className="section-eyebrow">Recommendations</p>
              <h2 className="score-section-title">How to improve your score</h2>
            </div>

            <div className="tips-grid">
              {TIPS.map((tip, i) => {
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

        </div>
      </main>
    </div>
  )
}

export default Score
