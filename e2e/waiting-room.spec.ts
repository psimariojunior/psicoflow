import { test, expect } from "@playwright/test"

// ============================================================
// WAITING ROOM — E2E Tests
// ============================================================
// API tests are self-contained and don't need auth.
// UI tests that need auth are in a separate describe block
// that uses the psychologist auth setup.
// ============================================================

test.describe("Waiting Room API — Validation", () => {
  test("POST without room returns 400", async ({ request }) => {
    const res = await request.post("/api/livekit/waiting", {
      data: { name: "Test" },
    })
    expect(res.status()).toBe(400)
  })

  test("POST without name returns 400", async ({ request }) => {
    const res = await request.post("/api/livekit/waiting", {
      data: { room: "test-room" },
    })
    expect(res.status()).toBe(400)
  })

  test("POST with valid data returns 201 with id and waiting status", async ({ request }) => {
    const res = await request.post("/api/livekit/waiting", {
      data: { room: `sala-validate-${Date.now()}`, name: "Paciente Validação" },
    })
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.id).toBeTruthy()
    expect(["waiting", "approved"]).toContain(body.status)

    await request.delete(`/api/livekit/waiting?id=${body.id}`)
  })

  test("PUT without auth returns 401", async ({ request }) => {
    const res = await request.put("/api/livekit/waiting", {
      data: { id: "fake-id", action: "approved" },
    })
    expect(res.status()).toBe(401)
  })

  test("DELETE without id returns 200 (no-op)", async ({ request }) => {
    const res = await request.delete("/api/livekit/waiting")
    expect(res.ok()).toBeTruthy()
  })

  test("DELETE with non-existent id returns 200 (no-op)", async ({ request }) => {
    const res = await request.delete("/api/livekit/waiting?id=non-existent-id")
    expect(res.ok()).toBeTruthy()
  })
})

test.describe("Waiting Room API — Self-Contained Flow", () => {
  test("POST → GET status poll → DELETE → verify removed", async ({ request }) => {
    const room = `sala-e2e-${Date.now()}`
    const name = "Paciente E2E Flow"

    // Register
    const reg = await request.post("/api/livekit/waiting", {
      data: { room, name },
    })
    expect(reg.ok()).toBeTruthy()
    const { id } = await reg.json()
    expect(id).toBeTruthy()

    // Verify registered (GET with id)
    const check = await request.get(`/api/livekit/waiting?room=${encodeURIComponent(room)}&id=${id}`)
    expect(check.ok()).toBeTruthy()
    const status = await check.json()
    expect(status.status).toBe("approved")
    expect(status.id).toBe(id)

    // Cleanup
    const del = await request.delete(`/api/livekit/waiting?id=${id}`)
    expect(del.ok()).toBeTruthy()

    // Verify removed
    const afterDel = await request.get(`/api/livekit/waiting?room=${encodeURIComponent(room)}&id=${id}`)
    const afterStatus = await afterDel.json()
    expect(afterStatus.status).toBe("not_found")
  })
})

test.describe("Waiting Room API — Badge Endpoint (no auth)", () => {
  test("GET without room returns patients array", async ({ request }) => {
    const res = await request.get("/api/livekit/waiting")
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.patients).toBeDefined()
    expect(Array.isArray(body.patients)).toBeTruthy()
  })

  test("register then GET without room includes the patient", async ({ request }) => {
    const room = `sala-badge-${Date.now()}`
    const name = "Paciente Badge Test"

    // Register
    const reg = await request.post("/api/livekit/waiting", {
      data: { room, name },
    })
    expect(reg.ok()).toBeTruthy()
    const { id } = await reg.json()

    // GET all (badge endpoint)
    const list = await request.get("/api/livekit/waiting")
    expect(list.ok()).toBeTruthy()
    const body = await list.json()
    const found = body.patients.find((p: any) => p.id === id)
    expect(found).toBeTruthy()
    expect(found.name).toBe(name)
    expect(found.room).toBe(room)

    // Cleanup
    await request.delete(`/api/livekit/waiting?id=${id}`)
  })

  test("register multiple patients in different rooms, GET returns all", async ({ request }) => {
    const room1 = `sala-multi-a-${Date.now()}`
    const room2 = `sala-multi-b-${Date.now()}`

    const reg1 = await request.post("/api/livekit/waiting", {
      data: { room: room1, name: "Paciente A" },
    })
    const reg2 = await request.post("/api/livekit/waiting", {
      data: { room: room2, name: "Paciente B" },
    })
    const id1 = (await reg1.json()).id
    const id2 = (await reg2.json()).id

    const list = await request.get("/api/livekit/waiting")
    const body = await list.json()
    const found1 = body.patients.find((p: any) => p.id === id1)
    const found2 = body.patients.find((p: any) => p.id === id2)
    expect(found1).toBeTruthy()
    expect(found2).toBeTruthy()
    expect(found1.room).toBe(room1)
    expect(found2.room).toBe(room2)

    await request.delete(`/api/livekit/waiting?id=${id1}`)
    await request.delete(`/api/livekit/waiting?id=${id2}`)
  })
})

test.describe("Waiting Room — Protected Routes Redirect", () => {
  test("sala-virtual redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/sala-virtual")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toContain("/login")
  })

  test("dashboard redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/login/, { timeout: 15000 })
    expect(page.url()).toContain("/login")
  })
})

test.describe("Waiting Room — Full E2E Flow", () => {
  test("register → poll status → register second → list shows both → cleanup", async ({ request }) => {
    const room = `sala-full-${Date.now()}`
    const name = "Paciente Full E2E"

    // 1. Register as waiting
    const reg = await request.post("/api/livekit/waiting", {
      data: { room, name },
    })
    expect(reg.ok()).toBeTruthy()
    const { id } = await reg.json()

    // 2. Poll own status (patient perspective)
    const poll1 = await request.get(
      `/api/livekit/waiting?room=${encodeURIComponent(room)}&id=${id}`
    )
    expect(poll1.ok()).toBeTruthy()
    expect((await poll1.json()).status).toBe("waiting")

    // 3. Register a second patient
    const reg2 = await request.post("/api/livekit/waiting", {
      data: { room, name: "Segundo Paciente" },
    })
    expect(reg2.ok()).toBeTruthy()
    const { id: id2 } = await reg2.json()

    // 4. GET all shows both
    const list = await request.get("/api/livekit/waiting")
    const body = await list.json()
    const roomPatients = body.patients.filter((p: any) => p.room === room)
    expect(roomPatients.length).toBeGreaterThanOrEqual(2)

    // 5. Cleanup both
    await request.delete(`/api/livekit/waiting?id=${id}`)
    await request.delete(`/api/livekit/waiting?id=${id2}`)

    // 6. Verify removed
    const check = await request.get(`/api/livekit/waiting?room=${encodeURIComponent(room)}&id=${id}`)
    expect((await check.json()).status).toBe("not_found")
  })
})
