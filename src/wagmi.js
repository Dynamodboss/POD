import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rabbyWallet,
  zerionWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

/* =====================================================
   0G Newton Testnet — custom chain definition
   chainId 16600 | https://0g.ai
   ===================================================== */
const ogNewtonTestnet = {
  id: 16600,
  name: '0G Newton Testnet',
  nativeCurrency: { name: '0G', symbol: 'A0GI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-newton.0g.ai' },
  },
  testnet: true,
}

/* =====================================================
   WalletConnect Project ID
   Get yours at https://cloud.walletconnect.com
   Set VITE_WALLETCONNECT_PROJECT_ID in your .env file
   ===================================================== */
const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'placeholder_get_yours_at_cloud_walletconnect_com'

/* ── Custom wallet list ──────────────────────────── */
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        rainbowWallet,
        coinbaseWallet,
        zerionWallet,
        rabbyWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: 'POD — Part of Dreams',
    projectId: WALLETCONNECT_PROJECT_ID,
  }
)

/* ── Wagmi config ────────────────────────────────── */
export const config = createConfig({
  chains: [ogNewtonTestnet, mainnet],
  connectors,
  transports: {
    [ogNewtonTestnet.id]: http('https://evmrpc-testnet.0g.ai'),
    [mainnet.id]: http(),
  },
})
