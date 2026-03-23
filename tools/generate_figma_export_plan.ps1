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
$publishablesFile = Join-Path $WorkspaceRoot "figma-manifest\figma-publishables.local.json"

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

$publishables = $null
if (Test-Path -LiteralPath $publishablesFile) {
  try {
    $publishables = Get-Content -LiteralPath $publishablesFile -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    $publishables = $null
  }
}

$plan = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  source_manifest = $manifestFile
  source_publishables = if ($publishables) { $publishablesFile } else { $null }
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

if ($publishables) {
  foreach ($item in @($publishables.publishable_symbols) + @($publishables.publishable_state_groups)) {
    $name = [string]$item.name
    $kind = if ([string]$item.nodeId -and $item.isPublishable) { "publishable" } else { "unknown" }
    $exportMode = if ($name -match 'Button|Component|Frame|Sing|TABS|ASKED|NEXT|CANCEL') { "SVG" } else { "PNG" }
    $plan.nodes += [ordered]@{
      kind = $kind
      node_id = [string]$item.nodeId
      node_name = $name
      version_hash = [string]$item.versionHash
      user_facing_version = [string]$item.userFacingVersion
      export_mode = $exportMode
      status = "pending"
      notes = "Use live browser copy/export path and persist clipboard payload."
    }
  }
}
else {
  foreach ($name in $layerIndex) {
    $plan.nodes += [ordered]@{
      kind = "name_only"
      node_id = ""
      node_name = $name
      version_hash = ""
      user_facing_version = ""
      export_mode = if ($name -match 'Button|Component|Frame') { "SVG" } else { "PNG" }
      status = "pending"
      notes = "Use live browser copy/export path and persist clipboard payload."
    }
  }
}

$plan | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Export plan written to $OutputPath"
