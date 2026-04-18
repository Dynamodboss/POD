import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rabbyWallet,
  zerionWallet,
  rainbowWallet,
  phantomWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

/* =====================================================
   0G Galileo Testnet — custom chain definition
   chainId 16601 | https://0g.ai
   ===================================================== */
const ogGalileoTestnet = {
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan-galileo.0g.ai' },
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
      /* injectedWallet catches ANY browser-extension wallet (MetaMask, Rabby,
         Phantom, Brave Wallet, etc.) via window.ethereum directly — this is
         the most reliable path for desktop Chrome extensions.             */
      groupName: 'Browser Wallet',
      wallets: [injectedWallet],
    },
    {
      groupName: 'Popular',
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        phantomWallet,
        zerionWallet,
        coinbaseWallet,
        rainbowWallet,
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
  chains: [ogGalileoTestnet, mainnet],
  connectors,
  transports: {
    [ogGalileoTestnet.id]: http('https://evmrpc-testnet.0g.ai'),
    [mainnet.id]: http(),
  },
})
