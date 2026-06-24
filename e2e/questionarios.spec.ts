import { test, expect } from "@playwright/test"

const PATIENT_EMAIL = "paciente.teste@email.com"
const PATIENT_PASSWORD = "Teste123!"

async function loginAsPatient(page: import("@playwright/test").Page) {
  await page.goto("/paciente/login")
  await page.locator('input[type="email"]').fill(PATIENT_EMAIL)
  await page.locator('input[type="password"]').fill(PATIENT_PASSWORD)
  await page.getByRole("button", { name: /entrar/i }).click()
  await page.waitForURL(/\/paciente(?!\/login)/, { timeout: 10000 })
}

test.describe("Questionnaire List", () => {
  test("patient can see 7 questionnaires", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")
    await expect(page.locator("body")).toContainText("Questionários")

    const cards = page.locator("[class*='card']")
    await expect(cards.first()).toBeVisible({ timeout: 5000 })

    await expect(page.locator("body")).toContainText("PHQ-9")
    await expect(page.locator("body")).toContainText("GAD-7")
    await expect(page.locator("body")).toContainText("BAI")
    await expect(page.locator("body")).toContainText("BDI")
    await expect(page.locator("body")).toContainText("PSS")
    await expect(page.locator("body")).toContainText("ISI")
    await expect(page.locator("body")).toContainText("WHOQOL")
  })

  test("back button is visible", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")
    await expect(page.getByRole("button", { name: /voltar/i })).toBeVisible()
  })
})

test.describe("PHQ-9 Questionnaire Flow", () => {
  test("can open PHQ-9 and see questions", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")

    const phq9Link = page.getByRole("link", { name: /PHQ-9/i }).first()
    await phq9Link.click()
    await page.waitForLoadState("networkidle")

    await expect(page.locator("h1")).toContainText("PHQ-9")
    await expect(page.locator("body")).toContainText("Pouco interesse ou prazer")
    await expect(page.locator("body")).toContainText("Nenhum dia")
    await expect(page.locator("body")).toContainText("Quase todos os dias")
  })

  test("can answer all questions and submit PHQ-9", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")

    await page.getByRole("link", { name: /PHQ-9/i }).first().click()
    await page.waitForLoadState("networkidle")

    const radioButtons = page.locator("[role='radiogroup']")
    const count = await radioButtons.count()
    expect(count).toBe(9)

    for (let i = 0; i < count; i++) {
      const group = radioButtons.nth(i)
      const firstRadio = group.locator("[role='radio']").first()
      await firstRadio.click()
    }

    const submitBtn = page.getByRole("button", { name: /finalizar/i })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    await expect(page.locator("body")).toContainText("Questionário Concluído", { timeout: 10000 })
    await expect(page.locator("body")).toContainText("Pontuação")
  })
})

test.describe("WHOQOL Per-Question Options", () => {
  test("WHOQOL Q1 has avaliacao options", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")

    await page.getByRole("link", { name: /WHOQOL/i }).first().click()
    await page.waitForLoadState("networkidle")

    await expect(page.locator("h1")).toContainText("WHOQOL")
    await expect(page.locator("body")).toContainText("Como você avalia sua qualidade de vida")
    await expect(page.locator("body")).toContainText("Muito ruim")
    await expect(page.locator("body")).toContainText("Muito bom")
  })

  test("WHOQOL satisfaction questions have satisfeito options", async ({ page }) => {
    await loginAsPatient(page)
    await page.goto("/paciente/questionarios")

    await page.getByRole("link", { name: /WHOQOL/i }).first().click()
    await page.waitForLoadState("networkidle")

    await expect(page.locator("body")).toContainText("Quão satisfeito")
    await expect(page.locator("body")).toContainText("Muito insatisfeito(a)")
    await expect(page.locator("body")).toContainText("Muito satisfeito(a)")
  })
})

test.describe("Unauthenticated Access", () => {
  test("questionarios page shows login prompt when not logged in", async ({ page }) => {
    await page.goto("/paciente/questionarios")
    await expect(page.locator("body")).toContainText(/Faça login/)
  })

  test("questionnaire detail redirects when no token", async ({ page }) => {
    await page.goto("/paciente/questionarios/fake-id")
    await page.waitForTimeout(2000)
    await expect(page.locator("body")).toContainText(/login|Login/)
  })
})
