import { test, expect } from "@playwright/test"

test.describe("Psychologist Dashboard", () => {
  test("dashboard loads with key metrics", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("body")).toContainText("PsiHumanis", { timeout: 15000 })
  })

  test("can navigate to patients page", async ({ page }) => {
    await page.goto("/pacientes")
    await expect(page.locator("h2")).toContainText("Pacientes", { timeout: 15000 })
  })

  test("can navigate to agenda page", async ({ page }) => {
    await page.goto("/agenda")
    await expect(page.locator("body")).toContainText("Agenda", { timeout: 15000 })
  })

  test("can navigate to settings", async ({ page }) => {
    await page.goto("/configuracoes")
    await expect(page.locator("body")).toContainText("Configurações", { timeout: 15000 })
  })
})
