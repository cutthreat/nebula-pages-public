param(
  [string]$PublishablesPath = "H:\Nebula\GPT\figma-manifest\figma-publishables.local.json",
  [string]$OutputJson = "H:\Nebula\GPT\figma-manifest\figma-components-map.json",
  [string]$OutputCsv = "H:\Nebula\GPT\figma-manifest\figma-components-map.csv"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PublishablesPath)) {
  throw "Publishables file not found: $PublishablesPath"
}

$publishables = Get-Content -LiteralPath $PublishablesPath -Raw -Encoding UTF8 | ConvertFrom-Json

function Get-ComponentGroup {
  param([string]$Name)
  $n = ""
  if ($null -ne $Name) { $n = [string]$Name }
  $n = $n.ToLowerInvariant()
  if ($n -match 'button|sing in|get started|see more|next|previous|cancel|language|choose') { return "controls/buttons" }
  if ($n -match 'auth|step 1|step 2|create an account|field|form') { return "forms/auth" }
  if ($n -match 'card|review|client|psy-|avatar') { return "content/cards" }
  if ($n -match 'tab|tabs|hover|click|default|variant|defolt|asked') { return "states/variants" }
  if ($n -match 'step|steps') { return "content/steps" }
  if ($n -match 'compatibility|palm reading|zodiac|tarot|love reading|all psychic|blog|asked') { return "content/reading-catalog" }
  if ($n -match 'video|play') { return "media/video" }
  return "other/unmapped"
}

function Get-ScreenTarget {
  param([string]$Name)
  $n = ""
  if ($null -ne $Name) { $n = [string]$Name }
  $n = $n.ToLowerInvariant()
  if ($n -match 'signup|create an account|auth|field|step 1|step 2') { return "signup" }
  if ($n -match 'review|client|psychic reading|love reading|palm reading|zodiac|tarot|all psychic|asked') { return "psychic-reading-new" }
  if ($n -match 'video|play') { return "home-popup-open" }
  if ($n -match 'button|get started|sing in|language|tabs|hover|click|default|variant') { return "home-popup-open" }
  if ($n -match 'card|avatar|psy-') { return "home" }
  return "unmapped"
}

$rows = @()
foreach ($item in @($publishables.publishable_symbols)) {
  $rows += [ordered]@{
    kind = "symbol"
    node_id = $item.nodeId
    name = $item.name
    component_group = Get-ComponentGroup -Name $item.name
    screen_target = Get-ScreenTarget -Name $item.name
    width = $item.width
    height = $item.height
    version_hash = $item.versionHash
    user_facing_version = $item.userFacingVersion
    is_template = $item.isTemplate
    page_id = ($item.containingFrame | ForEach-Object { $_.pageId })
    page_name = ($item.containingFrame | ForEach-Object { $_.pageName })
  }
}

foreach ($item in @($publishables.publishable_state_groups)) {
  $rows += [ordered]@{
    kind = "state_group"
    node_id = $item.nodeId
    name = $item.name
    component_group = Get-ComponentGroup -Name $item.name
    screen_target = Get-ScreenTarget -Name $item.name
    width = $item.width
    height = $item.height
    version_hash = $item.versionHash
    user_facing_version = $item.userFacingVersion
    is_template = $item.isTemplate
    page_id = ($item.containingFrame | ForEach-Object { $_.pageId })
    page_name = ($item.containingFrame | ForEach-Object { $_.pageName })
  }
}

$payload = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  source_publishables = $PublishablesPath
  totals = [ordered]@{
    all = $rows.Count
    mapped = (@($rows | Where-Object { $_.component_group -ne 'other/unmapped' })).Count
    unmapped = (@($rows | Where-Object { $_.component_group -eq 'other/unmapped' })).Count
  }
  rows = $rows
}

$payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputJson -Encoding UTF8
$rows | Export-Csv -LiteralPath $OutputCsv -NoTypeInformation -Encoding UTF8
Write-Host "Components map written to $OutputJson"
