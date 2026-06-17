import { test, expect } from "@playwright/test"

test("home page shows login form", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
})

test("landing page hero section", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Cuide da sua mente")).toBeVisible()
  await expect(page.getByText("transforme sua vida")).toBeVisible()
  await expect(page.getByRole("link", { name: "Agende sua Consulta" })).toBeVisible()
})

test("landing page services section", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Terapia Individual")).toBeVisible()
  await expect(page.getByText("Terapia de Casal")).toBeVisible()
  await expect(page.getByText("Terapia Online")).toBeVisible()
})

test("landing page FAQ accordion works", async ({ page }) => {
  await page.goto("/")
  const faqQuestion = page.getByText("Como funciona a terapia online?")
  await expect(faqQuestion).toBeVisible()
  await faqQuestion.click()
  await expect(page.getByText("Tudo criptografado")).toBeVisible()
})

test("landing page footer has links", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByText("Termos de Uso")).toBeVisible()
  await expect(page.getByText("Política de Privacidade")).toBeVisible()
})

test("english landing page loads", async ({ page }) => {
  await page.goto("/en")
  await expect(page.getByText("Take care of your mind")).toBeVisible()
  await expect(page.getByRole("link", { name: "Book an Appointment" })).toBeVisible()
})

test("english landing page services", async ({ page }) => {
  await page.goto("/en")
  await expect(page.getByText("Individual Therapy")).toBeVisible()
  await expect(page.getByText("Couples Therapy")).toBeVisible()
  await expect(page.getByText("Online Therapy")).toBeVisible()
})

test("english landing page FAQ", async ({ page }) => {
  await page.goto("/en")
  const faq = page.getByText("How does online therapy work?")
  await expect(faq).toBeVisible()
  await faq.click()
  await expect(page.getByText("Everything is encrypted")).toBeVisible()
})

test("terms page loads", async ({ page }) => {
  await page.goto("/termos")
  await expect(page.getByRole("heading", { name: "Termos de Uso" })).toBeVisible()
  await expect(page.getByText("Aceitação dos Termos")).toBeVisible()
})

test("privacy page loads", async ({ page }) => {
  await page.goto("/privacidade")
  await expect(page.getByRole("heading", { name: "Política de Privacidade" })).toBeVisible()
  await expect(page.getByText("Dados Coletados")).toBeVisible()
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

  const cpfInput = page.locator("#cpf")
  await cpfInput.fill("12345678901")
  await expect(cpfInput).toHaveValue("123.456.789-01")

  await page.locator("#name").fill("Paciente Teste")
  await page.getByRole("button", { name: "Próximo" }).click()

  const phoneInput = page.locator("#phone")
  await phoneInput.fill("11999998888")
  await expect(phoneInput).toHaveValue("(11) 99999-8888")

  await page.locator("#email").fill("teste@teste.com")
  await page.locator("#password").fill("123456")
  await page.locator("#confirmPassword").fill("123456")
  await page.getByRole("button", { name: "Próximo" }).click()

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

test("booking page has date selection", async ({ page }) => {
  await page.goto("/agendar")
  await expect(page.getByText("Selecione o dia")).toBeVisible()
})

test("patient meus-dados redirects to login", async ({ page }) => {
  await page.goto("/paciente/meus-dados")
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
})

test("patient diario redirects to login", async ({ page }) => {
  await page.goto("/paciente/diario")
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
})

test("patient historico redirects to login", async ({ page }) => {
  await page.goto("/paciente/historico")
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
})

test("virtual room with direct room code param", async ({ page }) => {
  await page.goto("/sala-virtual/entrar?room=sala-teste-123")
  await expect(page.locator("text=Pronto para sua")).toBeVisible()
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

test("health API returns ok", async ({ page }) => {
  const response = await page.goto("/api/health")
  expect(response?.ok()).toBeTruthy()
})

test("public availability API is accessible", async ({ page }) => {
  const response = await page.goto("/api/disponibilidade/public")
  expect(response?.ok()).toBeTruthy()
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
