param(
  [string]$BackupDir = "C:\Users\miche\Desktop\PsicoFlow-Completo\backups",
  [string]$At = "03:00"
)

$taskName = "PsicoFlow Backup"
$scriptPath = "C:\Users\miche\Desktop\PsicoFlow-Completo\scripts\backup.ps1"

# Create scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -BackupDir `"$BackupDir`""
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
  Write-Host "[OK] Tarefa agendada '$taskName' criada para diario as $At"
  
  # Also configure Docker Desktop to start with Windows
  $dockerPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if (Test-Path $dockerPath) {
    $startupFolder = [Environment]::GetFolderPath("Startup")
    $shortcutPath = Join-Path $startupFolder "Docker Desktop.lnk"
    if (-not (Test-Path $shortcutPath)) {
      $shell = New-Object -ComObject WScript.Shell
      $shortcut = $shell.CreateShortcut($shortcutPath)
      $shortcut.TargetPath = $dockerPath
      $shortcut.Save()
      Write-Host "[OK] Docker Desktop adicionado a inicializacao do Windows"
    }
  }

  Write-Host ""
  Write-Host "===== RESUMO ====="
  Write-Host "Backup automatico: $Interval as $At"
  Write-Host "Docker Desktop: inicia com o Windows"
  Write-Host "PsicoFlow: inicia automaticamente quando Docker estiver pronto"
  Write-Host ""
  Write-Host "Para testar o backup agora:"
  Write-Host "  powershell -File `"$scriptPath`""
} catch {
  Write-Host "[ERRO] $($_.Exception.Message)"
  Write-Host "Execute o PowerShell como Administrador e tente novamente."
}
