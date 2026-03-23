param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$PublishablesPath = "H:\Nebula\GPT\figma-manifest\figma-publishables.local.json",
  [string]$OutputJson = "H:\Nebula\GPT\figma-manifest\figma-publishable-map.json",
  [string]$OutputCsv = "H:\Nebula\GPT\figma-manifest\figma-publishable-map.csv"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $PublishablesPath)) {
  throw "Publishables file not found: $PublishablesPath"
}

$publishables = Get-Content -LiteralPath $PublishablesPath -Raw -Encoding UTF8 | ConvertFrom-Json

$targets = @(
  [ordered]@{ key = "home"; match = "home|hero|what neuro|experts|clients|best reading|topics|video|steps|situation|faq" },
  [ordered]@{ key = "home-popup-open"; match = "popup|offcanvas|modal|open" },
  [ordered]@{ key = "psychic-reading-new"; match = "prn|transform|tailored|trust|review|love reading|palm reading|zodiac compatibility|tarot reading|all psychic" },
  [ordered]@{ key = "signup-step-1"; match = "step 1|auth|sign up|create an account|form" },
  [ordered]@{ key = "signup-step-2"; match = "step 2|auth|sign up|create an account|form" }
)

function Resolve-Target {
  param([string]$Name)
  $lower = ""
  if ($null -ne $Name) { $lower = [string]$Name }
  $lower = $lower.ToLowerInvariant()
  foreach ($t in $targets) {
    $parts = ($t.match -split '\|')
    foreach ($part in $parts) {
      $needle = $part.Trim().ToLowerInvariant()
      if ($needle -and $lower.Contains($needle)) {
        return $t.key
      }
    }
  }
  return "unmapped"
}

$rows = @()

foreach ($item in @($publishables.publishable_symbols)) {
  $target = Resolve-Target -Name $item.name
  $rows += [ordered]@{
    kind = "symbol"
    node_id = $item.nodeId
    name = $item.name
    screen_target = $target
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
  $target = Resolve-Target -Name $item.name
  $rows += [ordered]@{
    kind = "state_group"
    node_id = $item.nodeId
    name = $item.name
    screen_target = $target
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
  workspace_root = $WorkspaceRoot
  source_publishables = $PublishablesPath
  totals = [ordered]@{
    all = $rows.Count
    mapped = (@($rows | Where-Object { $_.screen_target -ne 'unmapped' })).Count
    unmapped = (@($rows | Where-Object { $_.screen_target -eq 'unmapped' })).Count
  }
  rows = $rows
}

$payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputJson -Encoding UTF8
$rows | Export-Csv -LiteralPath $OutputCsv -NoTypeInformation -Encoding UTF8
Write-Host "Publishable map written to $OutputJson"
