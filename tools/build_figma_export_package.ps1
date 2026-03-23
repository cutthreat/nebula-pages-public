param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$ExportRoot = "H:\Nebula\GPT\figma-export"
)

$ErrorActionPreference = "Stop"

function Ensure-Directory {
  param([string]$Path)
  New-Item -ItemType Directory -Force -Path $Path | Out-Null
}

function Copy-IfExists {
  param(
    [string]$Source,
    [string]$Destination
  )

  if (Test-Path -LiteralPath $Source) {
    $parent = Split-Path -Parent $Destination
    if ($parent) { Ensure-Directory -Path $parent }
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
    return $true
  }

  return $false
}

function Copy-TreeIfExists {
  param(
    [string]$Source,
    [string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    return $false
  }

  Ensure-Directory -Path $Destination
  Copy-Item -Path (Join-Path $Source '*') -Destination $Destination -Recurse -Force
  return $true
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageRoot = Join-Path $ExportRoot $timestamp
$packageData = Join-Path $packageRoot "data"
$packageScreens = Join-Path $packageRoot "screen-specs"
$packageScreenshots = Join-Path $packageRoot "screenshots"
$packageExports = Join-Path $packageRoot "exports"
$packageAssets = Join-Path $packageRoot "assets"
$packageRefs = Join-Path $packageRoot "references"
$packageLogs = Join-Path $packageRoot "logs"

Ensure-Directory -Path $packageRoot
Ensure-Directory -Path $packageData
Ensure-Directory -Path $packageScreens
Ensure-Directory -Path $packageScreenshots
Ensure-Directory -Path $packageExports
Ensure-Directory -Path $packageAssets
Ensure-Directory -Path $packageRefs
Ensure-Directory -Path $packageLogs

$latestBrowserCapture = Get-ChildItem -LiteralPath $ExportRoot -Recurse -File -Filter browser-capture.json -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$latestBrowserLayerIndex = Get-ChildItem -LiteralPath $ExportRoot -Recurse -File -Filter browser-layer-index.json -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$latestBrowserScreenshot = Get-ChildItem -LiteralPath $ExportRoot -Recurse -File -Filter nebula-selected-frame.png -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$latestBatchSummary = Get-ChildItem -LiteralPath $ExportRoot -Recurse -File -Filter batch-summary.json -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$latestExportPackage = Get-ChildItem -LiteralPath $ExportRoot -Directory -ErrorAction SilentlyContinue |
  Where-Object {
    $exportsPath = Join-Path $_.FullName 'exports'
    (Test-Path -LiteralPath $exportsPath) -and (Get-ChildItem -LiteralPath $exportsPath -File -ErrorAction SilentlyContinue | Select-Object -First 1)
  } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$copied = @()

$manifestDir = Join-Path $WorkspaceRoot "figma-manifest"
$learningDir = Join-Path $WorkspaceRoot "learning-reports"
$legacyExportDir = @(
  Get-ChildItem -LiteralPath $WorkspaceRoot -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like 'Export*1200*' } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
).FullName

$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "figma-manifest.local.json"
  target = Join-Path $packageData "figma-manifest.local.json"
  copied = Copy-IfExists -Source (Join-Path $manifestDir "figma-manifest.local.json") -Destination (Join-Path $packageData "figma-manifest.local.json")
}
$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "figma-links.local.csv"
  target = Join-Path $packageData "figma-links.local.csv"
  copied = Copy-IfExists -Source (Join-Path $manifestDir "figma-links.local.csv") -Destination (Join-Path $packageData "figma-links.local.csv")
}
$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "implementation-queue.json"
  target = Join-Path $packageData "implementation-queue.json"
  copied = Copy-IfExists -Source (Join-Path $manifestDir "implementation-queue.json") -Destination (Join-Path $packageData "implementation-queue.json")
}
$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "code-implementation-plan.json"
  target = Join-Path $packageData "code-implementation-plan.json"
  copied = Copy-IfExists -Source (Join-Path $manifestDir "code-implementation-plan.json") -Destination (Join-Path $packageData "code-implementation-plan.json")
}
$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "figma-export-plan.json"
  target = Join-Path $packageData "figma-export-plan.json"
  copied = Copy-IfExists -Source (Join-Path $manifestDir "figma-export-plan.json") -Destination (Join-Path $packageData "figma-export-plan.json")
}
$copied += [pscustomobject]@{
  source = Join-Path $manifestDir "screen-specs"
  target = $packageScreens
  copied = Copy-TreeIfExists -Source (Join-Path $manifestDir "screen-specs") -Destination $packageScreens
}
$copied += [pscustomobject]@{
  source = Join-Path $WorkspaceRoot "FIGMA_LESSONS.jsonl"
  target = Join-Path $packageLogs "FIGMA_LESSONS.jsonl"
  copied = Copy-IfExists -Source (Join-Path $WorkspaceRoot "FIGMA_LESSONS.jsonl") -Destination (Join-Path $packageLogs "FIGMA_LESSONS.jsonl")
}
$copied += [pscustomobject]@{
  source = Join-Path $learningDir "autonomous-free-learning-latest.json"
  target = Join-Path $packageLogs "autonomous-free-learning-latest.json"
  copied = Copy-IfExists -Source (Join-Path $learningDir "autonomous-free-learning-latest.json") -Destination (Join-Path $packageLogs "autonomous-free-learning-latest.json")
}
$copied += [pscustomobject]@{
  source = Join-Path $learningDir "autonomous-free-learning-latest.md"
  target = Join-Path $packageLogs "autonomous-free-learning-latest.md"
  copied = Copy-IfExists -Source (Join-Path $learningDir "autonomous-free-learning-latest.md") -Destination (Join-Path $packageLogs "autonomous-free-learning-latest.md")
}
$copied += [pscustomobject]@{
  source = $legacyExportDir
  target = Join-Path $packageRefs "reference-export"
  copied = if ([string]::IsNullOrWhiteSpace($legacyExportDir)) { $false } else { Copy-TreeIfExists -Source $legacyExportDir -Destination (Join-Path $packageRefs "reference-export") }
}

if ($latestBrowserCapture) {
  $copied += [pscustomobject]@{
    source = $latestBrowserCapture.FullName
    target = Join-Path $packageRoot "browser-capture.json"
    copied = Copy-IfExists -Source $latestBrowserCapture.FullName -Destination (Join-Path $packageRoot "browser-capture.json")
  }
  $copied += [pscustomobject]@{
    source = $latestBrowserCapture.FullName
    target = Join-Path $packageLogs "browser-capture.json"
    copied = Copy-IfExists -Source $latestBrowserCapture.FullName -Destination (Join-Path $packageLogs "browser-capture.json")
  }
}
if ($latestBrowserLayerIndex) {
  $copied += [pscustomobject]@{
    source = $latestBrowserLayerIndex.FullName
    target = Join-Path $packageRoot "browser-layer-index.json"
    copied = Copy-IfExists -Source $latestBrowserLayerIndex.FullName -Destination (Join-Path $packageRoot "browser-layer-index.json")
  }
  $copied += [pscustomobject]@{
    source = $latestBrowserLayerIndex.FullName
    target = Join-Path $packageLogs "browser-layer-index.json"
    copied = Copy-IfExists -Source $latestBrowserLayerIndex.FullName -Destination (Join-Path $packageLogs "browser-layer-index.json")
  }
}
if ($latestBrowserScreenshot) {
  $browserScreenshotPng = $latestBrowserScreenshot.FullName
  $browserScreenshotPdf = [IO.Path]::ChangeExtension($browserScreenshotPng, ".pdf")
  $browserScreenshotSvg = [IO.Path]::Combine([IO.Path]::GetDirectoryName($browserScreenshotPng), ([IO.Path]::GetFileNameWithoutExtension($browserScreenshotPng) + ".review.svg"))
  $copied += [pscustomobject]@{
    source = $browserScreenshotPng
    target = Join-Path $packageScreenshots (Split-Path $browserScreenshotPng -Leaf)
    copied = Copy-IfExists -Source $browserScreenshotPng -Destination (Join-Path $packageScreenshots (Split-Path $browserScreenshotPng -Leaf))
  }
  if (Test-Path -LiteralPath $browserScreenshotPdf) {
    $copied += [pscustomobject]@{
      source = $browserScreenshotPdf
      target = Join-Path $packageScreenshots (Split-Path $browserScreenshotPdf -Leaf)
      copied = Copy-IfExists -Source $browserScreenshotPdf -Destination (Join-Path $packageScreenshots (Split-Path $browserScreenshotPdf -Leaf))
    }
  }
  if (Test-Path -LiteralPath $browserScreenshotSvg) {
    $copied += [pscustomobject]@{
      source = $browserScreenshotSvg
      target = Join-Path $packageScreenshots (Split-Path $browserScreenshotSvg -Leaf)
      copied = Copy-IfExists -Source $browserScreenshotSvg -Destination (Join-Path $packageScreenshots (Split-Path $browserScreenshotSvg -Leaf))
    }
  }
}
if ($latestExportPackage) {
  $latestExportsDir = Join-Path $latestExportPackage.FullName 'exports'
  $copied += [pscustomobject]@{
    source = $latestExportsDir
    target = $packageExports
    copied = Copy-TreeIfExists -Source $latestExportsDir -Destination $packageExports
  }
}
if ($latestBatchSummary) {
  $copied += [pscustomobject]@{
    source = $latestBatchSummary.FullName
    target = Join-Path $packageLogs "batch-summary.json"
    copied = Copy-IfExists -Source $latestBatchSummary.FullName -Destination (Join-Path $packageLogs "batch-summary.json")
  }
}

$package = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  export_root = $ExportRoot
  package_root = $packageRoot
  mode = "browser-backed figma export package"
  sources = [ordered]@{
    manifest_dir = $manifestDir
    learning_dir = $learningDir
  legacy_export_dir = $legacyExportDir
  }
  contents = $copied
  notes = @(
    "Use this package as the handoff bundle after live browser capture or offline manifest generation.",
    "PNG/PDF/SVG exports should be dropped into screenshots/assets before packaging when available.",
    "Any live-browser node exports should be copied into exports/ so they are preserved as first-class package artifacts.",
    "If Figma export is blocked by account permissions, keep the blocker in package notes and continue with the local manifest.",
    "When a previous live-browser capture exists anywhere in figma-export, copy its browser-capture, browser-layer-index, and screenshots forward automatically."
  )
}

$package | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $packageRoot "package.json") -Encoding UTF8

$review = @()
$review += "# Figma Export Package"
$review += ""
$review += "- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$review += "- Workspace root: $WorkspaceRoot"
$review += "- Package root: $packageRoot"
$review += ""
$review += "## Included"
foreach ($item in $copied) {
  $status = if ($item.copied) { "copied" } else { "missing" }
  $review += "- [$status] $($item.source) -> $($item.target)"
}
$review += ""
$review += "## Next Checks"
$review += "- Verify manifest completeness."
$review += "- Verify per-screen screenshots or exports are present."
$review += "- Verify any blocker from live browser capture is recorded."

$review | Set-Content -LiteralPath (Join-Path $packageRoot "review.md") -Encoding UTF8

Write-Host "Export package written to $packageRoot"
