import { expect, test } from '@playwright/test'

// API を止めた状態で確かめるテスト。CI では、docker compose stop api のあとに走らせる。
// 「API が落ちても、画面は止まらない」を、実際に落として確かめる。
//
//   docker compose stop api
//   npm run test:offline
//   docker compose start api

const cards = (page: import('@playwright/test').Page) => page.locator('ul h3')

test('API が止まっていても、サンプルデータで同じ一覧が出る', async ({ page }) => {
  await page.goto('/')

  // つながらないと分かった時点で、表示が切り替わる（最大で、時間切れの 4 秒）
  await expect(page.getByText('サンプルデータを表示中')).toBeVisible({ timeout: 15_000 })
  await expect(cards(page)).toHaveCount(15)
  await expect(cards(page).first()).toHaveText('シビラシステム')
  await expect(page.getByText('46.9')).toBeVisible()
})

test('API が止まっていても、検索・絞り込み・1 件引くが動く', async ({ page }) => {
  await page.goto('/?level=reality&sort=name')
  await expect(page.getByText('サンプルデータを表示中')).toBeVisible({ timeout: 15_000 })

  // API があるときと同じ並び（sf-meter-web のテストと、API のテストで同じ期待値を使っている）
  await expect(cards(page)).toHaveText(['シビラシステム', 'ニューラルリンク', 'ホログラム通信', '量子暗号通信'])

  await page.getByRole('searchbox').fill('通信')
  await expect(cards(page)).toHaveText(['ホログラム通信', '量子暗号通信'])

  await page.getByRole('button', { name: 'ほかの技術を引く' }).click()
  await expect(page.getByRole('heading', { level: 2 })).not.toBeEmpty()
})

test('止まっている間は「つなぎ直す」を押しても、サンプルデータのまま壊れない', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('サンプルデータを表示中')).toBeVisible({ timeout: 15_000 })

  await page.getByRole('button', { name: 'API につなぎ直す' }).click()

  await expect(page.getByText('サンプルデータを表示中')).toBeVisible({ timeout: 15_000 })
  await expect(cards(page)).toHaveCount(15)
})
