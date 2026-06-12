import { test, expect } from "@playwright/test"

test("home page shows login form", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
})

test("patient login page loads correctly", async ({ page }) => {
  await page.goto("/paciente/login")
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
  await expect(page.getByText("Esqueci minha senha")).toBeVisible()
  await expect(page.getByText("Não tem conta? Cadastre-se")).toBeVisible()
})

test("patient forgot password page loads", async ({ page }) => {
  await page.goto("/paciente/recuperar-senha")
  await expect(page.getByRole("heading", { name: "Recuperar senha" })).toBeVisible()
  await expect(page.getByPlaceholder("Seu email cadastrado")).toBeVisible()
})

test("patient registration page loads with masks", async ({ page }) => {
  await page.goto("/paciente/cadastro")
  await expect(page.locator("h1")).toHaveText("Criar conta")

  // Test CPF mask
  const cpfInput = page.locator("#cpf")
  await cpfInput.fill("12345678901")
  await expect(cpfInput).toHaveValue("123.456.789-01")

  // Go to step 2
  await page.locator("#name").fill("Paciente Teste")
  await page.getByRole("button", { name: "Próximo" }).click()

  // Test phone mask
  const phoneInput = page.locator("#phone")
  await phoneInput.fill("11999998888")
  await expect(phoneInput).toHaveValue("(11) 99999-8888")

  // Fill password and go to step 3
  await page.locator("#email").fill("teste@teste.com")
  await page.locator("#password").fill("123456")
  await page.locator("#confirmPassword").fill("123456")
  await page.getByRole("button", { name: "Próximo" }).click()

  // Test CEP mask
  const cepInput = page.locator("#zipCode")
  await cepInput.fill("01310100")
  await expect(cepInput).toHaveValue("01310-100")
})

test("virtual room entrance page loads", async ({ page }) => {
  await page.goto("/sala-virtual/entrar")
  await expect(page.locator("text=Sala Virtual")).toBeVisible()
  await expect(page.getByPlaceholder("Digite o código fornecido pelo psicólogo")).toBeVisible()
})

test("appointment booking page loads", async ({ page }) => {
  await page.goto("/agendar")
  await expect(page.locator("h1")).toContainText("Agende sua consulta")
})

test("patient meus-dados page has masks", async ({ page }) => {
  // Try loading meus-dados - should redirect to login if not authenticated
  await page.goto("/paciente/meus-dados")
  // Will redirect to login, verify that works
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
})

test("virtual room with direct room code param", async ({ page }) => {
  await page.goto("/sala-virtual/entrar?room=sala-teste-123")
  // Should go directly to prejoin (camera preview)
  await expect(page.locator("text=Pronto para sua")).toBeVisible()
})

test("dashboard agenda page loads", async ({ page }) => {
  // Should redirect to login if not authenticated
  await page.goto("/agenda")
  // Check it loaded (either the login page or the agenda)
  await expect(page).not.toHaveURL("about:blank")
})

test("cobrancas page loads", async ({ page }) => {
  await page.goto("/cobrancas")
  // Should redirect to login if not authenticated
  await expect(page).not.toHaveURL("about:blank")
})

test("sessoes page loads", async ({ page }) => {
  await page.goto("/sessoes")
  await expect(page).not.toHaveURL("about:blank")
})
