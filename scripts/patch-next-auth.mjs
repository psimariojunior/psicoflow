import { readFileSync, writeFileSync } from "fs"
const path = "node_modules/next-auth/utils/parse-url.js"
try {
  const content = readFileSync(path, "utf-8")
  const patched = content.replace(
    /const _url = new URL\(\(_url2 = url\) !== null && _url2 !== void 0 \? _url2 : defaultUrl\)/,
    "const _url = new URL(url || defaultUrl)"
  )
  if (content !== patched) {
    writeFileSync(path, patched)
    console.log("✓ patched next-auth parse-url to handle empty string URLs")
  }
} catch {}
