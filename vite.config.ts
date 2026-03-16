import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // App 統合テストは numRuns=500 × full render で重いため余裕を持たせる
    testTimeout: 60000,
    // CI では junit レポーターで XML を出力、ローカルでは verbose のみ
    reporters: process.env.CI
      ? [['verbose'], ['junit', { outputFile: 'test-results/junit.xml', suiteName: 'PBT Suite' }]]
      : ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
