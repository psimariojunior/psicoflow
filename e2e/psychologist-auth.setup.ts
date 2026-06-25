import { test as setup, expect } from "@playwright/test"
import fs from "fs"
import path from "path"

const PSYCHOLOGIST_EMAIL = "teste@psihumanis.com.br"
const PSYCHOLOGIST_PASSWORD = "Teste123!"
const authDir = path.join("test-results", ".auth")
const authFile = path.join(authDir, "psychologist.json")

setup("authenticate as psychologist", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })

  await page.goto("/login")
  await page.locator('input[type="email"]').fill(PSYCHOLOGIST_EMAIL)
  await page.locator('input[type="password"]').fill(PSYCHOLOGIST_PASSWORD)
  await page.getByRole("button", { name: /entrar/i }).click()
  await page.waitForURL("**/dashboard", { timeout: 20000 })
  await page.waitForTimeout(2000)

  await page.context().storageState({ path: authFile })
})
