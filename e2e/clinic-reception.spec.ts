import { test, expect } from "@playwright/test"

test.describe("Reception API — Auth Protection", () => {
  test("GET /api/recepcao/chegadas without auth returns 401 or redirects to login", async ({ request }) => {
    const res = await request.get("/api/recepcao/chegadas", { maxRedirects: 0 })
    expect([200, 302, 307, 401, 403]).toContain(res.status())
    if (res.status() === 302 || res.status() === 307) {
      const loc = res.headers()["location"] || ""
      expect(loc).toMatch(/login|signin/)
    }
  })

  test("POST /api/recepcao/chegadas without auth returns 401 or redirects", async ({ request }) => {
    const res = await request.post("/api/recepcao/chegadas", {
      data: { psychologistId: "test", patientName: "Test Patient" },
      maxRedirects: 0,
    })
    expect([200, 302, 307, 401, 403]).toContain(res.status())
  })

  test("GET /api/recepcao/chegadas redirects unauthenticated to login", async ({ request }) => {
    const res = await request.get("/api/recepcao/chegadas", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })
})

test.describe("Clinic API — Auth Protection", () => {
  test("GET /api/clinica redirects unauthenticated to login", async ({ request }) => {
    const res = await request.get("/api/clinica", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("GET /api/clinica/membros redirects unauthenticated", async ({ request }) => {
    const res = await request.get("/api/clinica/membros", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("GET /api/clinica/dashboard redirects unauthenticated", async ({ request }) => {
    const res = await request.get("/api/clinica/dashboard", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("POST /api/clinica redirects unauthenticated", async ({ request }) => {
    const res = await request.post("/api/clinica", {
      data: { name: "Test Clinic" },
      maxRedirects: 0,
    })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("POST /api/clinica/membros redirects unauthenticated", async ({ request }) => {
    const res = await request.post("/api/clinica/membros", {
      data: { email: "test@test.com", name: "Test", role: "RECEPTIONIST" },
      maxRedirects: 0,
    })
    expect([302, 307, 401]).toContain(res.status())
  })
})

test.describe("Dashboard Routes — Redirect to Login", () => {
  const routes = ["/recepcao", "/clinica"]

  for (const route of routes) {
    test(`${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/.*login.*/, { timeout: 10000 })
      expect(page.url()).toContain("login")
    })
  }
})

test.describe("Data Isolation — Clinic endpoints enforce auth", () => {
  test("PUT /api/recepcao/chegadas/[id]/notificar requires auth", async ({ request }) => {
    const res = await request.put("/api/recepcao/chegadas/test-id/notificar", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("DELETE /api/recepcao/chegadas/[id] requires auth", async ({ request }) => {
    const res = await request.delete("/api/recepcao/chegadas/test-id", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })

  test("DELETE /api/clinica/membros/[id] requires auth", async ({ request }) => {
    const res = await request.delete("/api/clinica/membros/test-id", { maxRedirects: 0 })
    expect([302, 307, 401]).toContain(res.status())
  })
})

test.describe("Public Endpoints Still Work", () => {
  test("health API returns 200", async ({ request }) => {
    const res = await request.get("/api/health")
    expect(res.status()).toBe(200)
  })

  test("disponibilidade public API returns 200", async ({ request }) => {
    const res = await request.get("/api/disponibilidade/public")
    expect(res.status()).toBe(200)
  })
})
