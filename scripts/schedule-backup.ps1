param(
  [string]$TaskName = "PsicoFlow Backup",
  [string]$ScriptPath = "$PSScriptRoot\backup.ps1",
  [string]$At = "03:00"
)

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Force
  Write-Host "[OK] Tarefa agendada '$TaskName' criada para diario as $At"
} catch {
  Write-Host "[ERRO] Nao foi possivel criar a tarefa agendada: $_"
  Write-Host "Execute o PowerShell como Administrador e tente novamente."
}
