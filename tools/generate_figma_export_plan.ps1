param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$OutputPath = "H:\Nebula\GPT\figma-manifest\figma-export-plan.json"
)

$ErrorActionPreference = "Stop"

function Get-LatestFile {
  param(
    [string]$Root,
    [string]$Filter
  )

  Get-ChildItem -LiteralPath $Root -Recurse -File -Filter $Filter -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
}

$browserLayerIndexFile = Get-LatestFile -Root (Join-Path $WorkspaceRoot "figma-export") -Filter "browser-layer-index.json"
$manifestFile = Join-Path $WorkspaceRoot "figma-manifest\figma-manifest.local.json"

$layerIndex = @()
if ($browserLayerIndexFile) {
  try {
    $layerIndex = Get-Content -LiteralPath $browserLayerIndexFile.FullName -Raw | ConvertFrom-Json
  } catch {
    $layerIndex = @()
  }
}

$manifest = $null
if (Test-Path -LiteralPath $manifestFile) {
  try {
    $manifest = Get-Content -LiteralPath $manifestFile -Raw | ConvertFrom-Json
  } catch {
    $manifest = $null
  }
}

$plan = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  source_manifest = $manifestFile
  source_browser_layer_index = if ($browserLayerIndexFile) { $browserLayerIndexFile.FullName } else { $null }
  strategy = [ordered]@{
    primary = "export publishable nodes one by one"
    raster = "PNG"
    vector = "SVG"
    fallback_pdf = "local PDF assembly from exported PNG/SVG"
    note = "Large selections are not trusted; prefer node-level copy/export."
  }
  nodes = @()
}

foreach ($name in $layerIndex) {
  $plan.nodes += [ordered]@{
    node_name = $name
    export_mode = if ($name -match 'Button|Component|Frame') { "SVG" } else { "PNG" }
    status = "pending"
    notes = "Use live browser copy/export path and persist clipboard payload."
  }
}

$plan | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Export plan written to $OutputPath"
