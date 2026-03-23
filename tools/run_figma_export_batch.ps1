param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$PlanPath = "H:\Nebula\GPT\figma-manifest\figma-export-plan.json",
  [string]$OutputRoot = "H:\Nebula\GPT\figma-export"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PlanPath)) {
  throw "Export plan not found: $PlanPath"
}

$plan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
$batchStamp = Get-Date -Format "yyyyMMdd-HHmmss"
$batchRoot = Join-Path $OutputRoot ("batch-" + $batchStamp)
$jobsDir = Join-Path $batchRoot "jobs"
$logsDir = Join-Path $batchRoot "logs"
$statusDir = Join-Path $batchRoot "status"

New-Item -ItemType Directory -Force -Path $jobsDir | Out-Null
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
New-Item -ItemType Directory -Force -Path $statusDir | Out-Null

$jobs = @()
$index = 0
foreach ($node in @($plan.nodes)) {
  $index++
  $jobId = ("{0:000}-{1}" -f $index, (($node.node_name -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLower()))
  $jobPath = Join-Path $jobsDir ($jobId + ".json")
  $job = [ordered]@{
    job_id = $jobId
    node_name = $node.node_name
    export_mode = $node.export_mode
    status = "pending"
    source_plan = $PlanPath
    expected_artifacts = @(
      ("exports\" + $jobId + ".png"),
      ("exports\" + $jobId + ".svg"),
      ("exports\" + $jobId + ".pdf")
    )
    notes = $node.notes
  }
  $job | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $jobPath -Encoding UTF8
  $jobs += $job
}

$summary = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  plan_path = $PlanPath
  batch_root = $batchRoot
  total_jobs = $jobs.Count
  pending_jobs = $jobs.Count
  completed_jobs = 0
  failed_jobs = 0
  note = "This batch runner prepares repeatable node-level export jobs. A browser executor can consume jobs/*.json and write artifacts into exports/."
}

$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $batchRoot "batch-summary.json") -Encoding UTF8

$runbook = @()
$runbook += "# Figma Batch Export"
$runbook += ""
$runbook += "- Batch root: $batchRoot"
$runbook += "- Total jobs: $($jobs.Count)"
$runbook += ""
$runbook += "## Execution Contract"
$runbook += "1. Consume jobs/*.json in order."
$runbook += "2. Export each node via the live browser session."
$runbook += "3. Persist PNG/SVG/PDF into exports/ under the same batch root."
$runbook += "4. Update job status files in status/."
$runbook += "5. Rebuild the package after completion."
$runbook += ""
$runbook += "## Stop Conditions"
$runbook += "- If browser session is unavailable, stop before mutating jobs."
$runbook += "- If a node copy/export fails, record the failure in status/ and continue to the next job only if the failure is isolated."
$runbook += "- If clipboard size is exceeded, downgrade to smaller publishable nodes."

$runbook | Set-Content -LiteralPath (Join-Path $batchRoot "runbook.md") -Encoding UTF8

Write-Host "Batch export jobs written to $batchRoot"
