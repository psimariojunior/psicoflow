var fs = require("fs")
var files = [
  "src/app/api/relatorios/pdf/route.ts",
  "src/app/api/relatorios/route.ts",
  "src/app/api/tarefas/route.ts",
]
files.forEach(function(f) {
  try {
    var c = fs.readFileSync(f, "utf8")
    if (!c.includes("force-dynamic")) {
      c = "export const dynamic = \"force-dynamic\"\n" + c
      fs.writeFileSync(f, c)
      console.log("Fixed: " + f)
    }
  } catch(e) {}
})
