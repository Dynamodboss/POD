import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Required by @0glabs/0g-ts-sdk in browser builds
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream', 'util', 'events'],
    }),
  ],
  optimizeDeps: {
    include: [
      'viem',
      'wagmi',
      '@rainbow-me/rainbowkit',
      '@tanstack/react-query',
    ],
  },
  resolve: {
    dedupe: ['viem', 'wagmi'],
  },
})
