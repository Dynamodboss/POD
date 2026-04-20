/* =====================================================
   Agent ID — On-Chain Reputation Minting
   0G Galileo Testnet (chainId 16602)

   Mints a freelancer's POD Score as an on-chain Agent ID
   by encoding wallet + score + timestamp as calldata in
   a transaction on the 0G chain.

   The minted Agent ID is persisted in localStorage so
   the UI can show the minted state on subsequent visits.
   ===================================================== */

const AGENT_ID_KEY = 'pod_agent_ids'

/* Registry burn address — all Agent ID mints go here */
const AGENT_REGISTRY = '0x0000000000000000000000000000000000A9E47D'

/* ── Ensure wallet is on 0G Galileo (chainId 0x40DA = 16602) ── */
async function ensureGalileoNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x40DA' }],
    })
    return
  } catch (switchErr) {
    if (switchErr.code !== 4902) {
      throw new Error(
        'Could not switch to 0G Galileo Testnet. ' +
        'Please add it manually: Chain ID 16602, RPC: https://evmrpc-testnet.0g.ai'
      )
    }
  }

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

/* ── Build the Agent ID payload ─────────────────────── */
function buildAgentPayload(walletAddress, score) {
  return JSON.stringify({
    type:       'POD_AGENT_ID',
    version:    '1.0',
    wallet:     walletAddress,
    score:      score.value,
    maxScore:   score.max,
    percentile: score.percentile,
    breakdown:  score.breakdown,
    proofs:     score.totalProjects,
    earned:     score.totalEarned,
    source:     score.source,
    mintedAt:   new Date().toISOString(),
  })
}

/**
 * Mint an Agent ID on-chain.
 * Encodes the wallet + POD Score as calldata and sends
 * a transaction to the Agent Registry address on 0G Galileo.
 *
 * @param {string} walletAddress
 * @param {object} score — full score object from computePodScore
 * @returns {Promise<{ txHash: string, agentId: string, mintedAt: string }>}
 */
export async function mintAgentId(walletAddress, score) {
  if (!window.ethereum) {
    throw new Error('No wallet found. Please install a browser wallet extension.')
  }

  await ensureGalileoNetwork()

  const accounts = await window.ethereum.request({ method: 'eth_accounts' })
  if (!accounts || accounts.length === 0) {
    throw new Error('No wallet account found. Please connect your wallet.')
  }

  const payload = buildAgentPayload(walletAddress, score)
  const hexData = '0x' + Array.from(new TextEncoder().encode(payload))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const txHash = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from:  accounts[0],
      to:    AGENT_REGISTRY,
      value: '0x0',
      data:  hexData,
      gas:   '0x30D40',  // 200,000
    }],
  })

  const mintedAt = new Date().toISOString()

  /* Generate a short Agent ID from the tx hash */
  const agentId = `POD-${txHash.slice(2, 10).toUpperCase()}`

  /* Persist locally */
  const record = {
    agentId,
    txHash,
    wallet:    walletAddress,
    score:     score.value,
    mintedAt,
  }
  saveAgentRecord(walletAddress, record)

  return record
}

/* ── localStorage persistence ──────────────────────── */

function saveAgentRecord(walletAddress, record) {
  const all = getAllAgentRecords()
  all[walletAddress.toLowerCase()] = record
  localStorage.setItem(AGENT_ID_KEY, JSON.stringify(all))
}

function getAllAgentRecords() {
  try {
    return JSON.parse(localStorage.getItem(AGENT_ID_KEY) || '{}')
  } catch {
    return {}
  }
}

/**
 * Get the minted Agent ID for a wallet, if one exists.
 * @param {string} walletAddress
 * @returns {object|null}
 */
export function getAgentId(walletAddress) {
  if (!walletAddress) return null
  const all = getAllAgentRecords()
  return all[walletAddress.toLowerCase()] || null
}
