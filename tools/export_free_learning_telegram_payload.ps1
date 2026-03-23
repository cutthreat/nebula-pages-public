param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$OutputPath = "H:\Nebula\GPT\learning-reports\autonomous-free-learning-telegram.txt"
)

$ErrorActionPreference = "Stop"

$jsonPath = Join-Path $WorkspaceRoot "learning-reports\autonomous-free-learning-latest.json"
if (-not (Test-Path -LiteralPath $jsonPath)) {
  throw "Latest report not found: $jsonPath"
}

$report = Get-Content -LiteralPath $jsonPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lines = @()
$lines += "Nebula autonomous learning is running locally."
$lines += "Total screens: $($report.summary.total)"
$lines += "Implemented: $($report.summary.implemented)"
$lines += "Missing: $($report.summary.missing)"
$lines += "Verify queue: $($report.summary.queued_for_verify)"
$lines += "Implement queue: $($report.summary.queued_for_implement)"
$lines += "Report: $($report.source.manifest)"
$lines += ""
$lines += "Next actions:"
foreach ($a in @($report.next_actions)) { $lines += "- $a" }

$dir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$lines | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Output $OutputPath
