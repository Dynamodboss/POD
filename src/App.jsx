import { Routes, Route } from 'react-router-dom'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import Landing    from './pages/Landing'
import Dashboard  from './pages/Dashboard'
import SubmitWork from './pages/SubmitWork'
import Score      from './pages/Score'

const EXPECTED_CHAIN_ID = 16602

/* ── Wrong-network banner ──────────────────────────── */
function WrongNetworkBanner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  if (!isConnected || chainId === EXPECTED_CHAIN_ID) return null

  return (
    <div style={{
      background:  '#dc2626',
      color:       '#fff',
      textAlign:   'center',
      padding:     '10px 16px',
      fontSize:    '14px',
      fontWeight:  600,
      position:    'fixed',
      top:         0,
      left:        0,
      right:       0,
      zIndex:      9999,
    }}>
      Wrong network — please switch to 0G Galileo Testnet.
      <button
        onClick={() => switchChain({ chainId: EXPECTED_CHAIN_ID })}
        style={{
          marginLeft:    12,
          padding:       '4px 14px',
          borderRadius:  6,
          border:        '1px solid #fff',
          background:    'transparent',
          color:         '#fff',
          cursor:        'pointer',
          fontSize:      '13px',
          fontWeight:    600,
        }}
      >
        Switch Network
      </button>
    </div>
  )
}

/* =====================================================
   POD — Root Router
   All route declarations live here.
   ===================================================== */
function App() {
  return (
    <>
      <WrongNetworkBanner />
      <Routes>
        <Route path="/"          element={<Landing />}    />
        <Route path="/dashboard" element={<Dashboard />}  />
        <Route path="/submit"    element={<SubmitWork />} />
        <Route path="/score"     element={<Score />}      />
      </Routes>
    </>
  )
}

export default App
