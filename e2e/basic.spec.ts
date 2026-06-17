import { test, expect } from "@playwright/test"

test("login page has expected form", async ({ page }) => {
  await page.goto("/login")
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
  await expect(page.locator("body")).toContainText("Faça login para acessar o sistema")
})

test("login page features section is visible", async ({ page }) => {
  await page.goto("/login")
  await expect(page.locator("body")).toContainText("Sua clínica na palma da sua mão")
  await expect(page.locator("body")).toContainText("Agenda Online")
  await expect(page.locator("body")).toContainText("Sala Virtual")
})

test("patient login page loads correctly", async ({ page }) => {
  await page.goto("/paciente/login")
  await expect(page.locator("body")).toContainText("Acesse sua área do paciente")
  await expect(page.locator("body")).toContainText("Cadastre-se")
})

test("patient registration page loads", async ({ page }) => {
  await page.goto("/paciente/cadastro")
  await expect(page.locator("h1")).toHaveText("Criar conta")
})

test("virtual room entrance page loads", async ({ page }) => {
  await page.goto("/sala-virtual/entrar")
  await expect(page.getByPlaceholder("Digite o código fornecido pelo psicólogo")).toBeVisible()
})

test("virtual room with direct room code param", async ({ page }) => {
  await page.goto("/sala-virtual/entrar?room=sala-teste-123")
  await expect(page.locator("body")).toContainText("Pronto para sua")
})

test("appointment booking page loads", async ({ page }) => {
  await page.goto("/agendar")
  await expect(page.locator("h1")).toContainText("Agende sua consulta")
})

test("health API returns ok", async ({ page }) => {
  const response = await page.goto("/api/health")
  expect(response?.ok()).toBeTruthy()
})

test("dashboard redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/login/)
})

test("agenda redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/agenda")
  await expect(page).toHaveURL(/\/login/)
})

test("cobrancas redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/cobrancas")
  await expect(page).toHaveURL(/\/login/)
})

test("sessoes redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/sessoes")
  await expect(page).toHaveURL(/\/login/)
})

test("pacientes redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/pacientes")
  await expect(page).toHaveURL(/\/login/)
})

test("configuracoes redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/configuracoes")
  await expect(page).toHaveURL(/\/login/)
})

test("sala-virtual page redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/sala-virtual")
  await expect(page).toHaveURL(/\/login/)
})

test("prontuarios redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/prontuarios")
  await expect(page).toHaveURL(/\/login/)
})

test("relatorios redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/relatorios")
  await expect(page).toHaveURL(/\/login/)
})

test("notificacoes redirects to login when unauthenticated", async ({ page }) => {
  await page.goto("/notificacoes")
  await expect(page).toHaveURL(/\/login/)
})
