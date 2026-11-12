import { expect, test, type Page } from '@playwright/test'

// 画面 → nginx → API → PostgreSQL まで、ぜんぶつながった状態で確かめるテスト。
// 画面はサンプルデータでも動いてしまうので、最初に「API につながっています」を必ず確かめる
// （つながっていないのに、サンプルデータで通ってしまうのを防ぐ）。

const cards = (page: Page) => page.locator('ul h3')

async function openConnected(page: Page, path = '/') {
  await page.goto(path)
  await expect(page.getByText('API につながっています')).toBeVisible({ timeout: 15_000 })
}

test('API につながっていて、初期データ 15 件が実現度の高い順に並ぶ', async ({ page }) => {
  await openConnected(page)

  await expect(cards(page)).toHaveCount(15)
  await expect(cards(page).first()).toHaveText('シビラシステム')
  await expect(cards(page).last()).toHaveText('タイムマシン')
  // 集計（/api/v1/stats）も API から来ている
  await expect(page.getByText('46.9')).toBeVisible()
})

test('検索すると、API が絞り込んだ結果が出て、URL にも残る', async ({ page }) => {
  await openConnected(page)

  await page.getByRole('searchbox').fill('通信')
  await expect(cards(page)).toHaveText(['量子暗号通信', 'ホログラム通信'])
  await expect(page.getByText('15 件のうち 2 件')).toBeVisible()
  await expect(page).toHaveURL(/\?q=/)

  // その URL を開き直しても、同じ状態に戻る
  await openConnected(page, page.url())
  await expect(cards(page)).toHaveText(['量子暗号通信', 'ホログラム通信'])
})

test('段階と並び順を変えると、そのとおりに並ぶ', async ({ page }) => {
  await openConnected(page, '/?level=fiction&sort=score')

  await expect(cards(page)).toHaveText(['タイムマシン', 'テレポーテーション', '反重力エンジン', 'AI人格移植', 'フォトン魚雷'])

  await page.getByLabel('並び順').selectOption('name')
  await expect(cards(page).first()).toHaveText('AI人格移植')
})

test('カードを押すと、計器がその技術を指す', async ({ page }) => {
  await openConnected(page)

  await page.getByRole('button', { name: /^タイムマシン/ }).click()
  await expect(page.getByRole('img', { name: 'タイムマシンの実現度は 1。まだ SF' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('タイムマシン')
})

test('「ほかの技術を引く」で、API がどれか 1 件を返す', async ({ page }) => {
  await openConnected(page)

  const answered = page.waitForResponse((response) => response.url().includes('/api/v1/techs/random') && response.ok())
  await page.getByRole('button', { name: 'ほかの技術を引く' }).click()
  const drawn = (await (await answered).json()) as { name: string; score: number }

  await expect(page.getByRole('heading', { level: 2 })).toHaveText(drawn.name)
  await expect(page.getByRole('img', { name: new RegExp(`^${drawn.name}の実現度は ${drawn.score}。`) })).toBeVisible()
})
