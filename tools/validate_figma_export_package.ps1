param(
  [string]$PackageRoot
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($PackageRoot)) {
  $latest = Get-ChildItem -LiteralPath (Join-Path $PWD "figma-export") -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $latest) {
    throw "No package root found. Pass -PackageRoot explicitly."
  }
  $PackageRoot = $latest.FullName
}

if (-not (Test-Path -LiteralPath $PackageRoot)) {
  throw "Package root not found: $PackageRoot"
}

$required = @(
  "package.json",
  "review.md",
  "data\figma-manifest.local.json",
  "data\figma-links.local.csv",
  "data\implementation-queue.json",
  "data\code-implementation-plan.json",
  "data\figma-export-plan.json",
  "browser-capture.json"
)

$optional = @(
  "screenshots\nebula-selected-frame.png",
  "screenshots\nebula-selected-frame.pdf",
  "screenshots\nebula-selected-frame.review.svg",
  "exports",
  "references\reference-export",
  "browser-layer-index.json"
)

$missing = @()
foreach ($item in $required) {
  if (-not (Test-Path -LiteralPath (Join-Path $PackageRoot $item))) {
    $missing += $item
  }
}

$presentOptional = @()
foreach ($item in $optional) {
  if (Test-Path -LiteralPath (Join-Path $PackageRoot $item)) {
    $presentOptional += $item
  }
}

$result = [ordered]@{
  package_root = $PackageRoot
  ok = ($missing.Count -eq 0)
  required = $required
  missing = $missing
  optional_present = $presentOptional
  summary = if ($missing.Count -eq 0) {
    "Package has the required handoff artifacts."
  } else {
    "Package is incomplete; missing required artifacts."
  }
}

$result | ConvertTo-Json -Depth 8
