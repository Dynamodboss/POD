/* =====================================================
   0G Storage — Work Proof Uploader
   Galileo Testnet (chainId 16601)

   Primary:  POST the proof JSON to the 0G storage
             indexer HTTP API and return the file hash.
   Fallback: embed the proof as calldata in a contract-
             creation tx on the 0G chain — the tx hash
             becomes the permanent proof reference.
   ===================================================== */

const INDEXER_API = 'https://indexer-storage-testnet-standard.0g.ai'

/* ── Build the canonical JSON payload ────────────── */
function buildPayload(proofData) {
  return JSON.stringify({
    title:            proofData.title,
    description:      proofData.description,
    deliverableLink:  proofData.deliverable,
    clientWallet:     proofData.clientWallet,
    amount:           proofData.paymentAmount,
    token:            proofData.paymentToken,
    completionDate:   proofData.completionDate,
    freelancerWallet: proofData.freelancerWallet,
    timestamp:        new Date().toISOString(),
    version:          '1.0',
  })
}

/* ── Primary: 0G Indexer HTTP upload ─────────────── */
async function uploadViaIndexer(payload) {
  const res = await fetch(`${INDEXER_API}/file/upload`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    payload,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Indexer ${res.status}: ${body || res.statusText}`)
  }

  const data = await res.json()
  return {
    txHash: data.tx_hash || data.hash || data.root || data.cid || JSON.stringify(data),
  }
}

/* ── Ensure wallet is on 0G Galileo (chainId 0x40DA = 16602) ── */
async function ensureGalileoNetwork() {
  // Try switching to 16602 first (works if user already has it)
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x40DA' }],
    })
    return
  } catch (switchErr) {
    // 4902 = chain not found in wallet → fall through to add it
    if (switchErr.code !== 4902) {
      // Any other error (e.g. user rejected, or old 16601 conflict)
      throw new Error(
        'Your wallet has 0G Galileo configured with the old chain ID (16601). ' +
        'In Rabby: Settings → Networks → delete "0G Galileo Testnet", then try again.'
      )
    }
  }

  // Chain not found — add it fresh with the correct chain ID
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId:           '0x40DA',
      chainName:         '0G Galileo Testnet',
      nativeCurrency:    { name: '0G', symbol: 'OG', decimals: 18 },
      rpcUrls:           ['https://evmrpc-testnet.0g.ai'],
      blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
    }],
  })
}

/* ── Fallback: on-chain calldata tx ──────────────── */
async function uploadOnChain(payload) {
  if (!window.ethereum) {
    throw new Error('No injected wallet found. Make sure your browser extension is active.')
  }

  await ensureGalileoNetwork()

  const hexData = '0x' + Array.from(new TextEncoder().encode(payload))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account found. Please connect your wallet.')
  }

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from:  accounts[0],
      to:    '0x000000000000000000000000000000000000dEaD',
      value: '0x0',
      data:  hexData,
      gas:   '0x186a0',  // 100 000
    }],
  })

  return { txHash }
}

/**
 * Upload a work proof to 0G storage.
 * Tries the indexer HTTP API first; falls back to an
 * on-chain calldata transaction if the API is unavailable.
 *
 * @param {object} proofData  — form fields + freelancerWallet
 * @returns {Promise<{ txHash: string }>}
 */
export async function uploadWorkProof(proofData) {
  const payload = buildPayload(proofData)

  /* ── Try indexer HTTP upload ──────────────────────── */
  try {
    return await uploadViaIndexer(payload)
  } catch (indexerErr) {
    console.warn('0G indexer upload failed, falling back to on-chain tx:', indexerErr.message)
  }

  /* ── Fallback: on-chain calldata ─────────────────── */
  return await uploadOnChain(payload)
}
