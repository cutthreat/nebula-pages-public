param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$TaskName = "Nebula-Autonomous-Free-Learning",
  [int]$Hour = 2,
  [int]$Minute = 0
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $WorkspaceRoot "tools\run_autonomous_free_learning.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Runner not found: $scriptPath"
}

$at = [datetime]::Today.AddHours($Hour).AddMinutes($Minute)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -WorkspaceRoot `"$WorkspaceRoot`" -SkipBrowserCheck"
$trigger = New-ScheduledTaskTrigger -Daily -At $at
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

$task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings
Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force | Out-Null
Write-Output "Scheduled task installed: $TaskName"
