/* =====================================================
   0G Compute — AI Reputation Scoring
   Galileo Testnet

   Collects a freelancer's verified work proofs and sends
   them to 0G Compute (decentralised AI inference) to
   generate a POD Score (0–1000).

   Flow:
     1. Proofs are cached in localStorage after each
        successful on-chain upload (see ogStorage.js).
     2. computePodScore() gathers all proofs for the
        connected wallet and sends them to a model on
        the 0G Serving Network.
     3. The model returns a structured JSON score with
        category breakdown and AI insight text.
     4. If 0G Compute is unreachable, a deterministic
        local algorithm produces the score instead.
   ===================================================== */

const PROOFS_KEY      = 'pod_work_proofs'
const SCORE_CACHE_KEY = 'pod_score_cache'
const HISTORY_KEY     = 'pod_score_history'

/* 0G Serving Broker — OpenAI-compatible inference endpoint */
const OG_COMPUTE_URL =
  import.meta.env.VITE_OG_COMPUTE_URL ||
  'https://serving-broker-testnet.0g.ai/v1/chat/completions'

const OG_COMPUTE_MODEL =
  import.meta.env.VITE_OG_COMPUTE_MODEL ||
  'meta-llama/Llama-3.1-8B-Instruct'

/* ── Proof Store (localStorage) ─────────────────────── */

/** Save a work proof locally after on-chain upload. */
export function saveProof(proofData, txHash) {
  const proofs = getAllProofs()
  proofs.push({
    ...proofData,
    txHash,
    storedAt: new Date().toISOString(),
  })
  localStorage.setItem(PROOFS_KEY, JSON.stringify(proofs))
}

/** Return every stored proof (all wallets). */
function getAllProofs() {
  try { return JSON.parse(localStorage.getItem(PROOFS_KEY) || '[]') }
  catch { return [] }
}

/** Return proofs that belong to `walletAddress`. */
export function getProofs(walletAddress) {
  if (!walletAddress) return []
  const lc = walletAddress.toLowerCase()
  return getAllProofs().filter(
    p => p.freelancerWallet?.toLowerCase() === lc,
  )
}

/* ── Score Cache ────────────────────────────────────── */
const CACHE_TTL = 5 * 60 * 1000 // 5 min

function getCachedScore(address) {
  try {
    const raw = localStorage.getItem(`${SCORE_CACHE_KEY}_${address.toLowerCase()}`)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached._ts > CACHE_TTL) return null
    return cached
  } catch { return null }
}

function setCachedScore(address, score) {
  localStorage.setItem(
    `${SCORE_CACHE_KEY}_${address.toLowerCase()}`,
    JSON.stringify({ ...score, _ts: Date.now() }),
  )
}

/* ── Score History (for the chart) ──────────────────── */

function pushHistory(address, value) {
  const key = `${HISTORY_KEY}_${address.toLowerCase()}`
  let history = []
  try { history = JSON.parse(localStorage.getItem(key) || '[]') } catch { /* */ }

  const today = new Date().toISOString().slice(0, 10)
  // Only one entry per day
  if (history.length && history[history.length - 1].date === today) {
    history[history.length - 1].value = value
  } else {
    history.push({ date: today, value })
  }
  // Keep last 12 entries
  if (history.length > 12) history = history.slice(-12)
  localStorage.setItem(key, JSON.stringify(history))
}

export function getScoreHistory(address) {
  if (!address) return []
  try {
    return JSON.parse(
      localStorage.getItem(`${HISTORY_KEY}_${address.toLowerCase()}`) || '[]',
    )
  } catch { return [] }
}

/* ── Empty score shape ──────────────────────────────── */

function emptyScore() {
  return {
    value:         0,
    max:           1000,
    percentile:    100,
    breakdown: [
      { label: 'Delivery Rate',      value: 0 },
      { label: 'Client Satisfaction', value: 0 },
      { label: 'On-Time Rate',       value: 0 },
      { label: 'Work Diversity',     value: 0 },
    ],
    totalProjects: 0,
    totalEarned:   '$0',
    proofs:        [],
    aiInsight:     'Submit your first work proof to start building your POD Score.',
    source:        'none',
  }
}

/* ── Public: compute the POD Score ──────────────────── */

/**
 * Compute the full POD Score for a wallet address.
 * Tries 0G Compute first, falls back to a local algorithm.
 *
 * @param {string} walletAddress
 * @returns {Promise<object>} score object
 */
export async function computePodScore(walletAddress) {
  if (!walletAddress) return emptyScore()

  /* Return cached score if fresh */
  const cached = getCachedScore(walletAddress)
  if (cached) return cached

  const proofs = getProofs(walletAddress)
  if (proofs.length === 0) return emptyScore()

  let score

  /* ── Try 0G Compute (AI inference) ────────────────── */
  try {
    score = await scoreVia0GCompute(proofs, walletAddress)
  } catch (err) {
    console.warn('0G Compute scoring failed, using local algorithm:', err.message)
    score = scoreLocally(proofs, walletAddress)
  }

  setCachedScore(walletAddress, score)
  pushHistory(walletAddress, score.value)
  return score
}

/* ── 0G Compute: AI inference path ──────────────────── */

async function scoreVia0GCompute(proofs, walletAddress) {
  const prompt = buildScoringPrompt(proofs)

  const res = await fetch(OG_COMPUTE_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OG_COMPUTE_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are the POD reputation scoring AI. ' +
            'Analyze the freelancer\'s verified work proofs and produce a score 0–1000. ' +
            'Return ONLY valid JSON with this structure:\n' +
            '{\n' +
            '  "score": <0-1000>,\n' +
            '  "percentile": <1-100>,\n' +
            '  "breakdown": {\n' +
            '    "deliveryRate": <0-100>,\n' +
            '    "clientSatisfaction": <0-100>,\n' +
            '    "onTimeRate": <0-100>,\n' +
            '    "workDiversity": <0-100>\n' +
            '  },\n' +
            '  "insight": "<one paragraph>"\n' +
            '}',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
    }),
  })

  if (!res.ok) throw new Error(`0G Compute ${res.status}: ${await res.text().catch(() => '')}`)

  const data    = res.json ? await res.json() : JSON.parse(await res.text())
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from 0G Compute')

  /* Parse the JSON from the model output */
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in model response')
  const parsed = JSON.parse(jsonMatch[0])

  const totalEarned = proofs.reduce((s, p) => s + (parseFloat(p.paymentAmount) || 0), 0)

  return {
    value:         clamp(parsed.score, 0, 1000),
    max:           1000,
    percentile:    clamp(parsed.percentile, 1, 100),
    breakdown: [
      { label: 'Delivery Rate',      value: clamp(parsed.breakdown.deliveryRate, 0, 100) },
      { label: 'Client Satisfaction', value: clamp(parsed.breakdown.clientSatisfaction, 0, 100) },
      { label: 'On-Time Rate',       value: clamp(parsed.breakdown.onTimeRate, 0, 100) },
      { label: 'Work Diversity',     value: clamp(parsed.breakdown.workDiversity, 0, 100) },
    ],
    totalProjects: proofs.length,
    totalEarned:   formatUSD(totalEarned),
    proofs,
    aiInsight:     parsed.insight || '',
    source:        '0g-compute',
  }
}

function buildScoringPrompt(proofs) {
  const lines = proofs.map((p, i) =>
    `${i + 1}. "${p.title}"\n` +
    `   Description: ${p.description || '—'}\n` +
    `   Amount: $${p.paymentAmount || 0} ${p.paymentToken || 'USDC'}\n` +
    `   Client wallet: ${p.clientWallet || '—'}\n` +
    `   Completed: ${p.completionDate || '—'}\n` +
    `   Deliverable: ${p.deliverable || '—'}\n` +
    `   On-chain tx: ${p.txHash || '—'}`,
  )

  return (
    `Evaluate this freelancer's reputation based on ${proofs.length} verified on-chain work proof(s):\n\n` +
    lines.join('\n\n') +
    '\n\nScoring factors:\n' +
    '- Number & consistency of completed projects\n' +
    '- Payment amounts and growth\n' +
    '- Unique client wallets (diversity)\n' +
    '- Variety of skills / project types\n' +
    '- Completeness of records\n' +
    '- Recency of submissions'
  )
}

/* ── Local fallback: deterministic scoring ──────────── */

function scoreLocally(proofs, _walletAddress) {
  const n = proofs.length

  /* 1. Project volume (0–250) */
  const projectScore = Math.min(250, n * 50)

  /* 2. Earnings (0–250) */
  const totalEarned = proofs.reduce((s, p) => s + (parseFloat(p.paymentAmount) || 0), 0)
  const earningsScore = Math.min(250, Math.floor(totalEarned / 100) * 5)

  /* 3. Client diversity (0–250) — unique wallets */
  const uniqueClients = new Set(
    proofs.map(p => p.clientWallet?.toLowerCase()).filter(Boolean),
  ).size
  const diversityScore = Math.min(250, uniqueClients * 60)

  /* 4. Completeness (0–250) — all key fields filled */
  const complete = proofs.filter(
    p => p.title && p.description && p.deliverable && p.paymentAmount,
  ).length
  const completenessScore = Math.min(250, Math.floor((complete / n) * 250))

  const total      = Math.min(1000, projectScore + earningsScore + diversityScore + completenessScore)
  const percentile = Math.max(1, 100 - Math.floor(total / 10))

  /* Breakdown as percentages */
  const deliveryRate = Math.min(100, Math.round((projectScore / 250) * 100))
  const clientSat    = Math.min(100, Math.round((completenessScore / 250) * 100))
  const onTimeRate   = Math.min(100, Math.round((earningsScore / 250) * 100))
  const workDiv      = Math.min(100, Math.round((diversityScore / 250) * 100))

  /* Insight */
  let insight
  if (total >= 800)
    insight = `Based on ${n} verified work proof${n === 1 ? '' : 's'}, you demonstrate exceptional freelancing capability with strong client relationships and diverse skills.`
  else if (total >= 600)
    insight = `Based on ${n} verified work proof${n === 1 ? '' : 's'}, your track record shows solid experience. Continue building client diversity and submitting more proofs to reach the top tier.`
  else if (total >= 300)
    insight = `Based on ${n} verified work proof${n === 1 ? '' : 's'}, you're building a strong foundation. Focus on completing more projects and diversifying your client base.`
  else
    insight = `Based on ${n} verified work proof${n === 1 ? '' : 's'}, you're just getting started. Submit more verified work proofs to build your reputation score.`

  return {
    value:         total,
    max:           1000,
    percentile,
    breakdown: [
      { label: 'Delivery Rate',      value: deliveryRate },
      { label: 'Client Satisfaction', value: clientSat },
      { label: 'On-Time Rate',       value: onTimeRate },
      { label: 'Work Diversity',     value: workDiv },
    ],
    totalProjects: n,
    totalEarned:   formatUSD(totalEarned),
    proofs,
    aiInsight:     insight,
    source:        'local',
  }
}

/* ── Helpers ────────────────────────────────────────── */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
}

function formatUSD(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
