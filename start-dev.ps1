$port = 3000
$log = Join-Path $env:TEMP "psicoflow-dev.log"

# Kill any existing process on port 3000
$existing = netstat -ano | Select-String ":${port} " | Select-String LISTENING
if ($existing) {
  $pid = ($existing -replace '.*\s+(\d+)\s*$','$1')
  Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
}

# Start dev server via WScript (truly detached)
$ws = New-Object -ComObject WScript.Shell
$ws.Run("cmd.exe /c cd /d `"$PSScriptRoot`" && npm run dev > `"$log`" 2>&1", 0, $false)

Write-Host "Starting PsicoFlow dev server at http://localhost:${port}..."
Start-Sleep -Seconds 10

# Wait until server is ready
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:${port}/" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
  Start-Sleep -Seconds 2
}

if ($ready) {
  Write-Host "Server is ready! Open http://localhost:${port}/ in your browser."
} else {
  Write-Host "Server may not be ready yet. Check the log: $log"
}
