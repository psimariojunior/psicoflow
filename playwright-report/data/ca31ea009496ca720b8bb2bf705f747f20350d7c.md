# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: psychologist-auth.setup.ts >> authenticate as psychologist
- Location: e2e\psychologist-auth.setup.ts:10:6

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- main [ref=e3]:
  - paragraph [ref=e4]:
    - generic [ref=e5]:
      - strong [ref=e6]: "404"
      - text: ": NOT_FOUND"
    - generic [ref=e7]:
      - text: "Code:"
      - code [ref=e8]: "`DEPLOYMENT_NOT_FOUND`"
    - generic [ref=e9]:
      - text: "ID:"
      - code [ref=e10]: "`gru1::dnfhz-1782417490860-a58a413065a1`"
  - link "This deployment cannot be found. For more information and troubleshooting, see our documentation." [ref=e11] [cursor=pointer]:
    - /url: https://vercel.com/docs/errors/DEPLOYMENT_NOT_FOUND
    - generic [ref=e12]: This deployment cannot be found. For more information and troubleshooting, see our documentation.
```

# Test source

```ts
  1  | import { test as setup, expect } from "@playwright/test"
  2  | import fs from "fs"
  3  | import path from "path"
  4  | 
  5  | const PSYCHOLOGIST_EMAIL = "teste@psihumanis.com.br"
  6  | const PSYCHOLOGIST_PASSWORD = "Teste123!"
  7  | const authDir = path.join("test-results", ".auth")
  8  | const authFile = path.join(authDir, "psychologist.json")
  9  | 
  10 | setup("authenticate as psychologist", async ({ page }) => {
  11 |   fs.mkdirSync(authDir, { recursive: true })
  12 | 
  13 |   await page.goto("/login")
> 14 |   await page.locator('input[type="email"]').fill(PSYCHOLOGIST_EMAIL)
     |                                             ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  15 |   await page.locator('input[type="password"]').fill(PSYCHOLOGIST_PASSWORD)
  16 |   await page.getByRole("button", { name: /entrar/i }).click()
  17 |   await page.waitForURL("**/dashboard", { timeout: 20000 })
  18 |   await page.waitForTimeout(2000)
  19 | 
  20 |   await page.context().storageState({ path: authFile })
  21 | })
  22 | 
```