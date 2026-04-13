import { useState } from 'react'
import { useAccount } from 'wagmi'
import Navbar from '../components/Navbar'
import WalletButton from '../components/WalletButton'
import '../App.css'
import './SubmitWork.css'

/* =====================================================
   POD — Submit Work Proof Page
   Lets freelancers submit completed projects as
   permanent on-chain proofs via 0G Storage.
   All submission logic is mocked — no chain calls yet.
   ===================================================== */

/* Submit state machine: idle → loading → success */
const STATUS = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success' }

const EMPTY_FORM = {
  title:         '',
  description:   '',
  deliverable:   '',
  clientWallet:  '',
  paymentAmount: '',
  paymentToken:  'USDC',
  completionDate: '',
}

function SubmitWork() {
  const { isConnected } = useAccount()
  const [form,   setForm]   = useState(EMPTY_FORM)
  const [status, setStatus] = useState(STATUS.IDLE)
  const [errors, setErrors] = useState({})

  /* ── Field change handler ──────────────────────── */
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear the error for this field as the user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  /* ── Basic validation ──────────────────────────── */
  function validate() {
    const next = {}
    if (!form.title.trim())        next.title        = 'Project title is required.'
    if (!form.description.trim())  next.description  = 'Description is required.'
    if (!form.deliverable.trim())  next.deliverable  = 'A deliverable link is required.'
    if (!form.clientWallet.trim()) next.clientWallet = 'Client wallet address is required.'
    if (!form.paymentAmount)       next.paymentAmount = 'Payment amount is required.'
    if (!form.completionDate)      next.completionDate = 'Completion date is required.'
    return next
  }

  /* ── Submit handler — mocked chain call ─────────── */
  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setStatus(STATUS.LOADING)
    // Simulate a 2.5s blockchain write
    setTimeout(() => setStatus(STATUS.SUCCESS), 2500)
  }

  /* ── Reset form after success ────────────────────── */
  function handleReset() {
    setForm(EMPTY_FORM)
    setErrors({})
    setStatus(STATUS.IDLE)
  }

  const isLoading = status === STATUS.LOADING
  const isSuccess = status === STATUS.SUCCESS

  return (
    <div className="submit-page">
      <Navbar variant="dashboard" />

      <main className="submit-main">
        <div className="submit-container">

          {/* ── Page header ─────────────────────────── */}
          <header className="submit-header fade-up" style={{ '--delay': '0ms' }}>
            <div className="submit-header__text">
              <div className="submit-header__badge">
                {/* Chain link icon */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Stored on 0G Network
              </div>
              <h1 className="submit-header__title">Submit Work Proof</h1>
              <p className="submit-header__sub">
                Your completed project will be stored permanently on 0G Storage and used to calculate your POD Score.
              </p>
            </div>
          </header>

          {/* ── Wallet gate ─────────────────────────── */}
          {!isConnected && (
            <div className="wallet-gate fade-up" style={{ '--delay': '80ms' }}>
              <div className="wallet-gate__icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="6" width="20" height="14" rx="2" stroke="#6C63FF" strokeWidth="1.5"/>
                  <path d="M16 13a2 2 0 100-4 2 2 0 000 4z" fill="#6C63FF" opacity=".6"/>
                  <path d="M2 10h20" stroke="#6C63FF" strokeWidth="1.5"/>
                </svg>
              </div>
              <h2 className="wallet-gate__title">Connect your wallet to submit work</h2>
              <p className="wallet-gate__sub">
                Your wallet address is used to sign and store your work proof on-chain.
              </p>
              <WalletButton className="btn--lg" />
            </div>
          )}

          {/* ── Two-column layout: form + sidebar ───── */}
          {isConnected && (
          <div className="submit-layout fade-up" style={{ '--delay': '80ms' }}>

            {/* ── Main form card ─────────────────────── */}
            <div className="submit-form-card">

              {/* Success overlay */}
              {isSuccess && (
                <div className="success-overlay">
                  <div className="success-overlay__icon" aria-hidden="true">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="#4ade80" strokeWidth="1.5"/>
                      <path d="M7 12.5l3.5 3.5 6.5-7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="success-overlay__title">Proof Submitted Successfully!</h2>
                  <p className="success-overlay__sub">
                    Your work proof has been stored on 0G Network.<br />
                    Transaction hash: <code className="success-overlay__hash">0x7f3a...c2d1</code>
                  </p>
                  <p className="success-overlay__note">
                    Your POD Score will update within 24 hours as our AI agent processes your submission.
                  </p>
                  <div className="success-overlay__actions">
                    <button className="btn btn--primary" onClick={handleReset}>
                      Submit Another
                    </button>
                    <a href="/dashboard" className="btn btn--ghost">
                      View Dashboard
                    </a>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className={isSuccess ? 'form--hidden' : ''}>
                <div className="form-section">
                  <h2 className="form-section__title">Project Details</h2>
                  <p className="form-section__sub">Describe the work you completed for this client.</p>
                </div>

                {/* ── Project Title ──────────────────── */}
                <div className={`form-field ${errors.title ? 'form-field--error' : ''}`}>
                  <label className="form-label" htmlFor="title">
                    Project Title
                    <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Brand Identity for TechCorp"
                    value={form.title}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {errors.title && <p className="form-error">{errors.title}</p>}
                </div>

                {/* ── Description ───────────────────── */}
                <div className={`form-field ${errors.description ? 'form-field--error' : ''}`}>
                  <label className="form-label" htmlFor="description">
                    Description
                    <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="form-textarea"
                    placeholder="Describe what you built or delivered..."
                    value={form.description}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.description && <p className="form-error">{errors.description}</p>}
                </div>

                {/* ── Deliverable Link ──────────────── */}
                <div className={`form-field ${errors.deliverable ? 'form-field--error' : ''}`}>
                  <label className="form-label" htmlFor="deliverable">
                    Deliverable Link
                    <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <div className="form-input-icon-wrap">
                    <svg className="form-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15 3h6v6M10 14L21 3M18 13v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      id="deliverable"
                      name="deliverable"
                      type="url"
                      className="form-input form-input--icon"
                      placeholder="https://github.com/... or https://figma.com/..."
                      value={form.deliverable}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.deliverable && <p className="form-error">{errors.deliverable}</p>}
                </div>

                <div className="form-divider" />

                <div className="form-section">
                  <h2 className="form-section__title">Client & Payment</h2>
                  <p className="form-section__sub">Verify who you worked with and what you were paid.</p>
                </div>

                {/* ── Client Wallet ─────────────────── */}
                <div className={`form-field ${errors.clientWallet ? 'form-field--error' : ''}`}>
                  <label className="form-label" htmlFor="clientWallet">
                    Client Wallet Address
                    <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <div className="form-input-icon-wrap">
                    <svg className="form-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/>
                      <path d="M16 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" opacity=".5"/>
                      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75"/>
                    </svg>
                    <input
                      id="clientWallet"
                      name="clientWallet"
                      type="text"
                      className="form-input form-input--icon form-input--mono"
                      placeholder="0x..."
                      value={form.clientWallet}
                      onChange={handleChange}
                      disabled={isLoading}
                      spellCheck={false}
                    />
                  </div>
                  <p className="form-hint">
                    The client's wallet will receive a request to verify this proof.
                  </p>
                  {errors.clientWallet && <p className="form-error">{errors.clientWallet}</p>}
                </div>

                {/* ── Payment row: amount + token ────── */}
                <div className="form-grid-2">
                  <div className={`form-field ${errors.paymentAmount ? 'form-field--error' : ''}`}>
                    <label className="form-label" htmlFor="paymentAmount">
                      Payment Amount (USD)
                      <span className="form-label__required" aria-hidden="true">*</span>
                    </label>
                    <div className="form-input-icon-wrap">
                      <span className="form-input-prefix">$</span>
                      <input
                        id="paymentAmount"
                        name="paymentAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        className="form-input form-input--prefix"
                        placeholder="0.00"
                        value={form.paymentAmount}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.paymentAmount && <p className="form-error">{errors.paymentAmount}</p>}
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="paymentToken">Payment Token</label>
                    <div className="form-select-wrap">
                      <select
                        id="paymentToken"
                        name="paymentToken"
                        className="form-select"
                        value={form.paymentToken}
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        <option value="USDC">USDC</option>
                        <option value="ETH">ETH</option>
                        <option value="USDT">USDT</option>
                        <option value="Other">Other</option>
                      </select>
                      {/* Custom chevron */}
                      <svg className="form-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* ── Completion Date ───────────────── */}
                <div className={`form-field form-field--half ${errors.completionDate ? 'form-field--error' : ''}`}>
                  <label className="form-label" htmlFor="completionDate">
                    Completion Date
                    <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="completionDate"
                    name="completionDate"
                    type="date"
                    className="form-input form-input--date"
                    value={form.completionDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.completionDate && <p className="form-error">{errors.completionDate}</p>}
                </div>

                {/* ── Submit button ────────────────── */}
                <button
                  type="submit"
                  className={`submit-btn ${isLoading ? 'submit-btn--loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="submit-btn__spinner" aria-hidden="true" />
                      Storing on-chain...
                    </>
                  ) : (
                    <>
                      {/* Upload icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                        <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                      </svg>
                      Submit to 0G Storage
                    </>
                  )}
                </button>

                <p className="form-disclaimer">
                  By submitting, you confirm this work was completed and agree to POD's{' '}
                  <a href="/" className="form-disclaimer__link">terms of service</a>.
                  This record will be permanent and publicly verifiable.
                </p>
              </form>
            </div>

            {/* ── Sidebar ────────────────────────────── */}
            <aside className="submit-sidebar">

              {/* What happens next */}
              <div className="sidebar-card">
                <h3 className="sidebar-card__title">What happens next?</h3>
                <div className="next-steps">
                  <div className="next-step">
                    <div className="next-step__num">1</div>
                    <div className="next-step__connector" aria-hidden="true" />
                    <div className="next-step__body">
                      <h4 className="next-step__title">Proof stored on-chain</h4>
                      <p className="next-step__desc">
                        Your submission is written permanently to 0G Storage. Immutable and publicly verifiable.
                      </p>
                    </div>
                  </div>

                  <div className="next-step">
                    <div className="next-step__num">2</div>
                    <div className="next-step__connector" aria-hidden="true" />
                    <div className="next-step__body">
                      <h4 className="next-step__title">AI agent reads your work</h4>
                      <p className="next-step__desc">
                        Our AI agent analyzes the project details, deliverables, and client relationship.
                      </p>
                    </div>
                  </div>

                  <div className="next-step">
                    <div className="next-step__num">3</div>
                    <div className="next-step__body">
                      <h4 className="next-step__title">POD Score updates</h4>
                      <p className="next-step__desc">
                        Your score recalculates within 24 hours. The more you submit, the stronger your reputation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="sidebar-card sidebar-card--tip">
                <div className="sidebar-card__tip-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#6C63FF" strokeWidth="1.75"/>
                    <path d="M12 7v6M12 17h.01" stroke="#6C63FF" strokeWidth="1.75" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <h4 className="sidebar-card__tip-title">What counts as valid proof?</h4>
                  <ul className="sidebar-tip-list">
                    <li>GitHub repos or deployed apps</li>
                    <li>Figma / design file links</li>
                    <li>Notion docs or Loom walkthroughs</li>
                    <li>Invoice or contract PDFs</li>
                    <li>Client testimonials (text or link)</li>
                  </ul>
                </div>
              </div>

              {/* Network badge */}
              <div className="sidebar-network-badge">
                <div className="sidebar-network-badge__dot" aria-hidden="true" />
                <div>
                  <p className="sidebar-network-badge__label">0G Network</p>
                  <p className="sidebar-network-badge__status">Testnet · Live</p>
                </div>
              </div>

            </aside>
          </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default SubmitWork
