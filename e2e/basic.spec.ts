import { test, expect } from "@playwright/test"

test.describe("Public Pages", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("body")).toContainText("PsicoFlow")
  })

  test("booking page loads", async ({ page }) => {
    await page.goto("/agendar")
    await expect(page.locator("h1")).toContainText("Agende")
  })

  test("terms page loads", async ({ page }) => {
    await page.goto("/termos")
    await expect(page.locator("body")).toContainText("Termos de Uso")
  })

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacidade")
    await expect(page.locator("body")).toContainText("Política de Privacidade")
  })

  test("health API returns 200", async ({ page }) => {
    const response = await page.goto("/api/health")
    expect(response?.ok()).toBe(true)
  })
})

test.describe("Auth Pages", () => {
  test("login page has form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator("h1")).toContainText("PsicoFlow")
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible()
  })

  test("patient login page", async ({ page }) => {
    await page.goto("/paciente/login")
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible()
  })

  test("patient registration page", async ({ page }) => {
    await page.goto("/paciente/cadastro")
    await expect(page.locator("h1")).toContainText("Criar conta")
  })

  test("forgot password page", async ({ page }) => {
    await page.goto("/paciente/recuperar-senha")
    await expect(page.getByRole("button", { name: /enviar|recuperar/i })).toBeVisible()
  })
})

test.describe("Virtual Room", () => {
  test("entrance page loads with room code input", async ({ page }) => {
    await page.goto("/sala-virtual/entrar")
    await expect(page.locator("body")).toContainText("Sala Virtual")
  })

  test("direct room code shows prejoin view", async ({ page }) => {
    await page.goto("/sala-virtual/entrar?room=test-123")
    await expect(page.locator("body")).toContainText("Pronto")
  })
})

test.describe("Patient Portal Pages (unauthenticated)", () => {
  test("questionarios page shows login prompt", async ({ page }) => {
    await page.goto("/paciente/questionarios")
    await expect(page.locator("body")).toContainText(/Questionários|Faça login/)
  })

  test("anamnese page shows login prompt", async ({ page }) => {
    await page.goto("/paciente/anamnese")
    await expect(page.locator("body")).toContainText(/Anamnese|Faça login/)
  })

  test("crisis protocols page shows login prompt", async ({ page }) => {
    await page.goto("/paciente/protocolos-crise")
    await expect(page.locator("body")).toContainText(/Emergência|Faça login/)
  })
})

test.describe("Help Page", () => {
  test("help page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/ajuda")
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain("/login")
  })
})

test.describe("Dashboard Routes Redirect to Login", () => {
  const protectedRoutes = [
    "/dashboard",
    "/agenda",
    "/pacientes",
    "/cobrancas",
    "/sessoes",
    "/prontuarios",
    "/relatorios",
    "/notificacoes",
    "/configuracoes",
    "/comunicacao",
    "/diario-emocoes",
    "/disponibilidade",
    "/financeiro",
    "/questionarios",
    "/recursos-terapeuticos",
    "/tarefas",
    "/sala-virtual",
  ]

  for (const route of protectedRoutes) {
    test(`${route} redirects to login`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain("/login")
    })
  }
})

test.describe("API Tests", () => {
  test("/api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health")
    expect(response.ok()).toBe(true)
  })

  test("/api/disponibilidade/public returns ok", async ({ request }) => {
    const response = await request.get("/api/disponibilidade/public")
    expect(response.ok()).toBe(true)
  })
})
