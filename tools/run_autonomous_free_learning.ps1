param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [switch]$SkipBrowserCheck
)

$ErrorActionPreference = "Stop"

$outDir = Join-Path $WorkspaceRoot "learning-reports"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $outDir "autonomous-free-learning-$stamp.log"
$reportPath = Join-Path $outDir "autonomous-free-learning-latest.json"
$mdPath = Join-Path $outDir "autonomous-free-learning-latest.md"
$tgPath = Join-Path $outDir "autonomous-free-learning-telegram.txt"

function Log([string]$msg) {
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value ("[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $msg)
}

function Run-Step([string]$label, [scriptblock]$script) {
  Log $label
  & $script
}

try {
  Log "Autonomous free learning started."

  if (-not $SkipBrowserCheck) {
    Run-Step "Bootstrap environment" { powershell -ExecutionPolicy Bypass -File (Join-Path $WorkspaceRoot "setup_env.ps1") | Out-Null }
  }

  Run-Step "Generate local Figma manifest" {
    powershell -ExecutionPolicy Bypass -File (Join-Path $WorkspaceRoot "tools\generate_figma_manifest.ps1") -WorkspaceRoot $WorkspaceRoot -OutputDir (Join-Path $WorkspaceRoot "figma-manifest") | Out-Null
  }

  Run-Step "Generate screen specs" {
    powershell -ExecutionPolicy Bypass -File (Join-Path $WorkspaceRoot "tools\generate_screen_specs.ps1") -ManifestPath (Join-Path $WorkspaceRoot "figma-manifest\figma-manifest.local.json") -OutputDir (Join-Path $WorkspaceRoot "figma-manifest\screen-specs") | Out-Null
  }

  Run-Step "Generate implementation queue" {
    powershell -ExecutionPolicy Bypass -File (Join-Path $WorkspaceRoot "tools\generate_implementation_queue.ps1") -ScreenSpecsDir (Join-Path $WorkspaceRoot "figma-manifest\screen-specs") -WorkspaceRoot $WorkspaceRoot -OutputPath (Join-Path $WorkspaceRoot "figma-manifest\implementation-queue.json") | Out-Null
  }

  Run-Step "Generate code implementation plan" {
    powershell -ExecutionPolicy Bypass -File (Join-Path $WorkspaceRoot "tools\generate_code_implementation_plan.ps1") -QueuePath (Join-Path $WorkspaceRoot "figma-manifest\implementation-queue.json") -OutputPath (Join-Path $WorkspaceRoot "figma-manifest\code-implementation-plan.json") | Out-Null
  }

  $queue = Get-Content -LiteralPath (Join-Path $WorkspaceRoot "figma-manifest\implementation-queue.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  $plan = Get-Content -LiteralPath (Join-Path $WorkspaceRoot "figma-manifest\code-implementation-plan.json") -Raw -Encoding UTF8 | ConvertFrom-Json
  $validated = @($queue | Where-Object { $_.implemented -eq $true }).Count
  $missing = @($queue | Where-Object { $_.implemented -ne $true }).Count

  $report = [ordered]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    workflow = "local free-first autonomous learning"
    summary = [ordered]@{
      total = @($queue).Count
      implemented = $validated
      missing = $missing
      queued_for_verify = @($plan.plan | Where-Object { $_.action -eq "verify_and_harden" }).Count
      queued_for_implement = @($plan.plan | Where-Object { $_.action -eq "implement" }).Count
    }
    source = [ordered]@{
      manifest = (Join-Path $WorkspaceRoot "figma-manifest\figma-manifest.local.json")
      specs = (Join-Path $WorkspaceRoot "figma-manifest\screen-specs")
      queue = (Join-Path $WorkspaceRoot "figma-manifest\implementation-queue.json")
      plan = (Join-Path $WorkspaceRoot "figma-manifest\code-implementation-plan.json")
      lessons = (Join-Path $WorkspaceRoot "FIGMA_LESSONS.jsonl")
    }
    next_actions = @(
      "Use Telegram as the only operator UI.",
      "Run local render checks against the reference Home.",
      "Record lessons for any reusable rule discovered during verification."
    )
  }

  $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportPath -Encoding UTF8

  $md = @()
  $md += "# Autonomous Free Learning"
  $md += ""
  $md += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  $md += ""
  $md += "## Summary"
  $md += "- Total screens: $($report.summary.total)"
  $md += "- Implemented: $($report.summary.implemented)"
  $md += "- Missing: $($report.summary.missing)"
  $md += "- Verify queue: $($report.summary.queued_for_verify)"
  $md += "- Implement queue: $($report.summary.queued_for_implement)"
  $md += ""
  $md += "## Source"
  $md += "- Manifest: $($report.source.manifest)"
  $md += "- Specs: $($report.source.specs)"
  $md += "- Queue: $($report.source.queue)"
  $md += "- Plan: $($report.source.plan)"
  $md += ""
  $md += "## Next Actions"
  foreach ($a in $report.next_actions) { $md += "- $a" }
  $md | Set-Content -LiteralPath $mdPath -Encoding UTF8

  $tg = @(
    "Nebula autonomous learning is running locally."
    "Total screens: $($report.summary.total)"
    "Implemented: $($report.summary.implemented)"
    "Missing: $($report.summary.missing)"
    "Verify queue: $($report.summary.queued_for_verify)"
    "Implement queue: $($report.summary.queued_for_implement)"
    "Report: $reportPath"
  ) -join "`n"
  $tg | Set-Content -LiteralPath $tgPath -Encoding UTF8

  Log "Autonomous free learning finished successfully."
  Write-Output $reportPath
}
catch {
  Log ("FAILED: " + $_.Exception.Message)
  throw
}
