import { test as setup } from "@playwright/test"
import fs from "fs"
import path from "path"

const PATIENT_EMAIL = "paciente.teste@email.com"
const PATIENT_PASSWORD = "Teste123!"
const authDir = path.join("test-results", ".auth")
const authFile = path.join(authDir, "patient.json")

setup("authenticate as patient", async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })

  await page.goto("/paciente/login")
  await page.locator('input[type="email"]').fill(PATIENT_EMAIL)
  await page.locator('input[type="password"]').fill(PATIENT_PASSWORD)
  await page.getByRole("button", { name: /entrar/i }).click()
  await page.waitForURL("**/paciente", { timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.context().storageState({ path: authFile })
})
