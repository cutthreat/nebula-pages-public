param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$OutputDir = "H:\Nebula\GPT\figma-manifest"
)

$ErrorActionPreference = "Stop"

function Get-PageInfo {
  param([string]$Path)

  $html = Get-Content -LiteralPath $Path -Raw
  $title = [regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value
  $sectionMatches = [regex]::Matches($html, '(?s)<section class="([^"]+)".*?</section>')
  $classes = [regex]::Matches($html, 'class="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

  $sectionObjects = @()
  for ($i = 0; $i -lt $sectionMatches.Count; $i++) {
    $sectionHtml = $sectionMatches[$i].Value
    $sectionClass = $sectionMatches[$i].Groups[1].Value
    $sectionHeadings = [regex]::Matches($sectionHtml, '<h[12][^>]*>(.*?)</h[12]>') | ForEach-Object {
      ($_.Groups[1].Value -replace '<[^>]+>', '').Trim()
    } | Where-Object { $_ }
    $sectionImgs = [regex]::Matches($sectionHtml, '<img[^>]+src="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    $sectionLinks = [regex]::Matches($sectionHtml, '<a[^>]+href="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    $sectionTexts = [regex]::Matches($sectionHtml, '>([^<>]{18,})<') | ForEach-Object {
      ($_.Groups[1].Value -replace '\s+', ' ').Trim()
    } | Where-Object { $_ } | Select-Object -Unique | Select-Object -First 6

    $sectionObjects += [ordered]@{
      order = $i + 1
      class = $sectionClass
      headings = @($sectionHeadings)
      image_sources = @($sectionImgs)
      links = @($sectionLinks)
      text_samples = @($sectionTexts)
    }
  }

  [ordered]@{
    file = [IO.Path]::GetFileName($Path)
    title = $title
    sections = $sectionObjects
    headings = @(
      [regex]::Matches($html, '<h[12][^>]*>(.*?)</h[12]>') | ForEach-Object {
        ($_.Groups[1].Value -replace '<[^>]+>', '').Trim()
      } | Where-Object { $_ }
    )
    image_sources = @(
      [regex]::Matches($html, '<img[^>]+src="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    )
    links = @(
      [regex]::Matches($html, '<a[^>]+href="([^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
    )
    class_names = $classes
  }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$htmlFiles = Get-ChildItem -LiteralPath (Join-Path $WorkspaceRoot "_unzipped") -Filter *.html | Sort-Object Name
$pages = foreach ($file in $htmlFiles) { Get-PageInfo -Path $file.FullName }

$assetDir = Join-Path $WorkspaceRoot "_unzipped\img"
$assets = @()
if (Test-Path $assetDir) {
  $assets = Get-ChildItem -LiteralPath $assetDir -File | Sort-Object Name | ForEach-Object {
    [ordered]@{
      name = $_.Name
      path = $_.FullName
      size = $_.Length
      extension = $_.Extension
    }
  }
}

$legacyExportDir = Join-Path $WorkspaceRoot "Export НЕБУЛА 1200+"
$latestBrowserExportPackage = Get-ChildItem -LiteralPath (Join-Path $WorkspaceRoot "figma-export") -Directory -ErrorAction SilentlyContinue |
  Where-Object {
    $exportsPath = Join-Path $_.FullName 'exports'
    (Test-Path -LiteralPath $exportsPath) -and (Get-ChildItem -LiteralPath $exportsPath -File -ErrorAction SilentlyContinue | Select-Object -First 1)
  } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$exports = @()
if ($latestBrowserExportPackage) {
  $browserExportDir = Join-Path $latestBrowserExportPackage.FullName 'exports'
  $exports = Get-ChildItem -LiteralPath $browserExportDir -File | Sort-Object Name | ForEach-Object {
    [ordered]@{
      name = $_.Name
      path = $_.FullName
      size = $_.Length
      extension = $_.Extension
    }
  }
} elseif (Test-Path $legacyExportDir) {
  $exports = Get-ChildItem -LiteralPath $legacyExportDir -File | Sort-Object Name | ForEach-Object {
    [ordered]@{
      name = $_.Name
      path = $_.FullName
      size = $_.Length
      extension = $_.Extension
    }
  }
}

$browserLayerIndexPath = Get-ChildItem -LiteralPath (Join-Path $WorkspaceRoot "figma-export") -Recurse -File -Filter browser-layer-index.json -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
$browserLayerIndex = @()
if ($browserLayerIndexPath) {
  try {
    $browserLayerIndex = Get-Content -LiteralPath $browserLayerIndexPath.FullName -Raw | ConvertFrom-Json
  } catch {
    $browserLayerIndex = @()
  }
}

$manifest = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  source_of_truth = [ordered]@{
    baseline_home = "H:\Nebula\GPT\_unzipped\home.html"
    baseline_release = "https://github.com/pavlo-bondarchuk/neuro/releases/tag/1.0"
    figma_mcp_blocker = "Figma MCP quota exhausted on initial root pass"
  }
  pages = $pages
  assets = $assets
  export_assets = $exports
  browser_layer_index_source = if ($browserLayerIndexPath) { $browserLayerIndexPath.FullName } else { $null }
  browser_layer_index = $browserLayerIndex
  browser_export_package = if ($latestBrowserExportPackage) { $latestBrowserExportPackage.FullName } else { $null }
}

$manifestPath = Join-Path $OutputDir "figma-manifest.local.json"
$manifest | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

$linksCsv = Join-Path $OutputDir "figma-links.local.csv"
$rows = foreach ($page in $pages) {
  foreach ($section in $page.sections) {
    [pscustomobject]@{
      page = $page.file
      title = $page.title
      order = $section.order
      section_class = $section.class
      headings = ($section.headings -join " | ")
      image_count = $section.image_sources.Count
      link_count = $section.links.Count
      text_samples = ($section.text_samples -join " | ")
    }
  }
}
$rows | Export-Csv -LiteralPath $linksCsv -NoTypeInformation -Encoding UTF8

Write-Host "Manifest written to $manifestPath"
Write-Host "Links CSV written to $linksCsv"
