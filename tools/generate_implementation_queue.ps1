param(
  [string]$ScreenSpecsDir = "H:\Nebula\GPT\figma-manifest\screen-specs",
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$OutputPath = "H:\Nebula\GPT\figma-manifest\implementation-queue.json"
)

$ErrorActionPreference = "Stop"

function Get-ImplementedSections {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return @()
  }

  $html = Get-Content -LiteralPath $Path -Raw
  return [regex]::Matches($html, '<section class="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
}

$htmlFiles = Get-ChildItem -LiteralPath (Join-Path $WorkspaceRoot "_unzipped") -Filter *.html | Sort-Object Name
$implementedMap = @{}
foreach ($html in $htmlFiles) {
  $implementedMap[$html.Name] = Get-ImplementedSections -Path $html.FullName
}

$queue = @()
$specFiles = Get-ChildItem -LiteralPath $ScreenSpecsDir -Recurse -Filter *.json | Sort-Object FullName

foreach ($specFile in $specFiles) {
  $spec = Get-Content -LiteralPath $specFile.FullName -Raw | ConvertFrom-Json
  $pageFile = $spec.identity.page_file
  $screenName = $spec.identity.screen_name
  $screenOrder = $spec.identity.screen_order
  $implemented = $false
  $implementedSections = @()

  if ($implementedMap.ContainsKey($pageFile)) {
    $implementedSections = $implementedMap[$pageFile]
    foreach ($candidate in $implementedSections) {
      if ($candidate -eq $screenName) {
        $implemented = $true
        break
      }
    }
  }

  $queue += [ordered]@{
    page_file = $pageFile
    screen_order = $screenOrder
    screen_name = $screenName
    spec_path = $specFile.FullName
    implemented = $implemented
    implemented_sections = @($implementedSections)
    target_viewport = $spec.identity.target_viewport
    image_count = @($spec.assets.images).Count
    note = if ($implemented) { "Already present in _unzipped baseline or variant." } else { "Needs implementation or verification." }
  }
}

$queue | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Implementation queue written to $OutputPath"
