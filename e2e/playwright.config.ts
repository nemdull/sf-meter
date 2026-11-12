import { defineConfig, devices } from '@playwright/test'

// 立ち上がっている SF Meter（docker compose up のあとの http://localhost:5173）を、ブラウザーで実際に開いて確かめる。
// 別の場所で動かしているときは、SF_METER_URL で指定する。
export default defineConfig({
  testDir: '.',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.SF_METER_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
