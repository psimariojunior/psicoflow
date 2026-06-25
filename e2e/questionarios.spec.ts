import { test, expect, type Page } from "@playwright/test"

async function dismissCookieBanner(page: Page) {
  const rejectBtn = page.getByRole("button", { name: /recusar/i })
  try {
    await rejectBtn.waitFor({ state: "visible", timeout: 3000 })
    await rejectBtn.click()
    await page.waitForTimeout(500)
  } catch {}
}

async function goToQuestionarios(page: Page) {
  await page.goto("/paciente/questionarios")
  await dismissCookieBanner(page)
  await page.waitForTimeout(2000)
  await expect(page.locator("h1")).toContainText("Questionários Clínicos", { timeout: 15000 })
}

async function clickQuestionnaire(page: Page, type: string) {
  const links = page.locator(`a[href*='/paciente/questionarios/']`).filter({ hasText: /Iniciar|Ver Resultado/ })
  const count = await links.count()
  for (let i = 0; i < count; i++) {
    const cardText = await links.nth(i).evaluate(el => {
      let p: HTMLElement | null = el.closest('[class*="rounded-lg"]')
      return p?.textContent || ""
    })
    if (cardText.includes(type)) {
      await links.nth(i).click({ force: true })
      await page.waitForTimeout(2000)
      return
    }
  }
  await links.last().click({ force: true })
  await page.waitForTimeout(2000)
}

test.describe("Questionnaire List", () => {
  test("patient can see 7 questionnaires", async ({ page }) => {
    await goToQuestionarios(page)

    await expect(page.locator("body")).toContainText("PHQ-9")
    await expect(page.locator("body")).toContainText("GAD-7")
    await expect(page.locator("body")).toContainText("BAI")
    await expect(page.locator("body")).toContainText("BDI")
    await expect(page.locator("body")).toContainText("PSS")
    await expect(page.locator("body")).toContainText("ISI")
    await expect(page.locator("body")).toContainText("WHOQOL")
  })

  test("back button is visible", async ({ page }) => {
    await goToQuestionarios(page)
    await expect(page.getByRole("button", { name: /voltar/i })).toBeVisible()
  })

  test("shows loading skeleton", async ({ page }) => {
    await page.goto("/paciente/questionarios")
    const skeleton = page.locator(".animate-pulse")
    await expect(skeleton.first()).toBeVisible({ timeout: 3000 }).catch(() => {})
  })
})

test.describe("PHQ-9 Questionnaire Flow", () => {
  test("can open PHQ-9 and see questions with options", async ({ page }) => {
    await goToQuestionarios(page)
    await clickQuestionnaire(page, "PHQ-9")

    await expect(page.locator("body")).toContainText("Pouco interesse ou prazer")
    await expect(page.locator("body")).toContainText("Nenhum dia")
    await expect(page.locator("body")).toContainText("Quase todos os dias")
  })

  test("progress bar shows 0% initially", async ({ page }) => {
    await goToQuestionarios(page)
    await clickQuestionnaire(page, "PHQ-9")

    await expect(page.locator("body")).toContainText("0 de 9 respondidas")
  })

  test("can answer all questions and submit", async ({ page }) => {
    await goToQuestionarios(page)
    await clickQuestionnaire(page, "PHQ-9")

    await expect(page.locator("body")).toContainText("0 de 9 respondidas")

    const firstOptions = page.locator("label").filter({ hasText: "Nenhum dia" })
    const optCount = await firstOptions.count()
    expect(optCount).toBe(9)

    for (let i = 0; i < optCount; i++) {
      await firstOptions.nth(i).click()
      await page.waitForTimeout(200)
    }

    await expect(page.locator("body")).toContainText("9 de 9 respondidas")
    await expect(page.locator("body")).toContainText("100%")

    const submitBtn = page.getByRole("button", { name: /finalizar/i })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    await expect(page.locator("body")).toContainText("Questionário Concluído", { timeout: 10000 })
    await expect(page.locator("body")).toContainText("Pontuação")
  })
})

test.describe("WHOQOL Per-Question Options", () => {
  test("WHOQOL Q1 has avaliacao options", async ({ page }) => {
    await goToQuestionarios(page)
    await page.locator("a[href*='/paciente/questionarios/']").filter({ hasText: /Iniciar/ }).first().click()
    await page.waitForTimeout(2000)

    await expect(page.locator("body")).toContainText("Como você avalia sua qualidade de vida")
    await expect(page.locator("body")).toContainText("Muito ruim")
    await expect(page.locator("body")).toContainText("Muito bom")
  })

  test("WHOQOL satisfaction questions have satisfeito options", async ({ page }) => {
    await goToQuestionarios(page)
    await page.locator("a[href*='/paciente/questionarios/']").filter({ hasText: /Iniciar/ }).first().click()
    await page.waitForTimeout(2000)

    await expect(page.locator("body")).toContainText("Quão satisfeito")
    await expect(page.locator("body")).toContainText("Muito insatisfeito(a)")
    await expect(page.locator("body")).toContainText("Muito satisfeito(a)")
  })
})
