import { test, expect } from "@playwright/test"

test("home page shows login form", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()
})

test("patient login page loads correctly", async ({ page }) => {
  await page.goto("/paciente/login")
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible()
})

test("patient registration page loads", async ({ page }) => {
  await page.goto("/paciente/cadastro")
  await expect(page.locator("h1")).toHaveText("Criar conta")
})

test("virtual room entrance page loads", async ({ page }) => {
  await page.goto("/sala-virtual/entrar")
  await expect(page.locator("text=Sala Virtual")).toBeVisible()
})

test("appointment booking page loads", async ({ page }) => {
  await page.goto("/agendar")
  await expect(page.locator("h1")).toContainText("Agende sua consulta")
})
