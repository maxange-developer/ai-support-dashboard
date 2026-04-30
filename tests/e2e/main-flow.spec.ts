import { test, expect } from '@playwright/test'

// Requires a live app + verified test account.
// Set TEST_EMAIL, TEST_PASSWORD, TEST_ORG_SLUG in .env.test.local before running.
// Run: pnpm test:e2e
const EMAIL = process.env.TEST_EMAIL ?? ''
const PASSWORD = process.env.TEST_PASSWORD ?? ''
const ORG_SLUG = process.env.TEST_ORG_SLUG ?? 'acme-demo'

test.describe('Main flow', () => {
  test.skip(!EMAIL, 'Set TEST_EMAIL, TEST_PASSWORD, TEST_ORG_SLUG in .env.test.local')

  test('login → documents list', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', EMAIL)
    await page.fill('[name=password]', PASSWORD)
    await page.click('button[type=submit]')
    await expect(page).toHaveURL(new RegExp(`/app/${ORG_SLUG}`), { timeout: 10_000 })
  })

  test('upload document → appears in list', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', EMAIL)
    await page.fill('[name=password]', PASSWORD)
    await page.click('button[type=submit]')
    await page.waitForURL(new RegExp(`/app/${ORG_SLUG}`))

    await page.goto(`/app/${ORG_SLUG}/documents/new`)
    const docTitle = `Test doc ${Date.now()}`
    await page.fill('[name=title]', docTitle)

    // Upload a small markdown file
    const buffer = Buffer.from('# FAQ\n\nQ: What is the return policy?\nA: 30 days.')
    await page.setInputFiles('[name=file]', {
      name: 'faq.md',
      mimeType: 'text/markdown',
      buffer,
    })
    await page.click('button[type=submit]')

    // Should redirect to /documents after successful upload
    await expect(page).toHaveURL(new RegExp(`/app/${ORG_SLUG}/documents`), { timeout: 30_000 })
    await expect(page.getByText(docTitle)).toBeVisible()
  })

  test('playground chat returns answer with source citation', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name=email]', EMAIL)
    await page.fill('[name=password]', PASSWORD)
    await page.click('button[type=submit]')
    await page.waitForURL(new RegExp(`/app/${ORG_SLUG}`))

    await page.goto(`/app/${ORG_SLUG}/playground`)

    const input = page.getByPlaceholder(/scrivi un messaggio/i)
    await input.fill('What is the return policy?')
    await input.press('Enter')

    // Wait for assistant response (streaming may take a few seconds)
    const assistant = page.locator('[data-role=assistant]').last()
    await expect(assistant).toBeVisible({ timeout: 30_000 })

    // Citation marker [1] should appear somewhere in the response area
    await expect(page.getByText(/\[1\]/)).toBeVisible({ timeout: 30_000 })
  })
})
