import { ConnectButton } from '@rainbow-me/rainbowkit'

/* =====================================================
   WalletButton — thin wrapper around RainbowKit's
   ConnectButton.Custom that matches POD's .btn styles.

   Props:
     className — extra modifier classes, e.g.:
       "btn--lg"            → large landing CTA
       "navbar__mobile-cta" → full-width mobile drawer btn
   ===================================================== */
export default function WalletButton({ className = '' }) {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        /* RainbowKit's hydration guard */
        const ready     = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              /* ── Not connected ── */
              <button
                onClick={openConnectModal}
                type="button"
                className={`btn btn--primary ${className}`}
              >
                Connect Wallet
              </button>

            ) : chain.unsupported ? (
              /* ── Wrong / unsupported network ── */
              <button
                onClick={openChainModal}
                type="button"
                className={`btn btn--ghost ${className}`}
                style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#f87171' }}
              >
                Wrong Network
              </button>

            ) : (
              /* ── Connected — show shortened address / ENS ── */
              <button
                onClick={openAccountModal}
                type="button"
                className={`btn btn--primary ${className}`}
              >
                {account.displayName}
              </button>
            )}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
