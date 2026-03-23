param(
  [string]$ManifestPath = "H:\Nebula\GPT\figma-manifest\figma-manifest.local.json",
  [string]$OutputDir = "H:\Nebula\GPT\figma-manifest\screen-specs"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$index = @()

foreach ($page in $manifest.pages) {
  $pageSlug = ($page.file -replace '\.html$', '')
  $pageDir = Join-Path $OutputDir $pageSlug
  New-Item -ItemType Directory -Force -Path $pageDir | Out-Null

  foreach ($section in $page.sections) {
    $sectionSlug = ('{0:00}-{1}' -f [int]$section.order, ($section.class -replace '[^a-zA-Z0-9]+', '-').Trim('-').ToLower())
    $spec = [ordered]@{
      identity = [ordered]@{
        screen_name = $section.class
        page_file = $page.file
        screen_order = $section.order
        target_viewport = if ($page.file -eq 'signup-step-1.html' -or $page.file -eq 'signup-step-2.html') { '992x800' } else { '1200xauto' }
        reference_export_file = if ($manifest.export_assets.Count -gt 0) { $manifest.export_assets | Select-Object -First 1 | ForEach-Object { $_.path } } else { $null }
      }
      layout = [ordered]@{
        root_container = 'Bootstrap container / section wrapper'
        section_order = @($section.class)
        grid_system = 'Bootstrap 4.6 grid from reference'
        key_spacing_values = @()
        alignment_notes = 'Use the export order and the approved Home baseline; do not invent section hierarchy.'
      }
      typography = [ordered]@{
        fonts = @('Manrope')
        heading_sizes = @()
        body_sizes = @()
        line_heights = @()
        weights = @()
        letter_spacing = @()
      }
      colors = [ordered]@{
        backgrounds = @()
        text_colors = @()
        accent_colors = @()
        border_colors = @()
        shadow_effects = @()
      }
      assets = [ordered]@{
        images = @($section.image_sources)
        svgs = @()
        icons = @()
        background_patterns = @()
        export_format = 'png/webp/svg from local bundle'
      }
      interactions = [ordered]@{
        hover = @()
        active = @()
        focus = @()
        open_closed_states = @()
        carousel_slider_behavior = @()
        accordion_modal_behavior = @()
      }
      responsive = [ordered]@{
        desktop_behavior = 'Follow approved Home / export behavior for 1200px desktop.'
        tablet_behavior = 'Use Bootstrap 4.6 breakpoints and preserve order.'
        mobile_behavior = 'Stack cards and collapse complex multi-column content as in the reference.'
        breakpoint_specific_differences = @()
      }
      notes = [ordered]@{
        anything_not_obvious_from_export = @($section.text_samples)
        baseline_reuse_requirements = 'Reuse the approved Home and existing patterns first.'
        do_not_change_rules = 'Do not introduce new libraries, new versions, or image-based substitutes.'
      }
    }

    $specPath = Join-Path $pageDir ($sectionSlug + '.json')
    $spec | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $specPath -Encoding UTF8

    $index += [pscustomobject]@{
      page = $page.file
      screen_name = $section.class
      screen_order = $section.order
      spec_path = $specPath
      image_count = @($section.image_sources).Count
      link_count = @($section.links).Count
    }
  }
}

$indexPath = Join-Path $OutputDir "_index.csv"
$index | Export-Csv -LiteralPath $indexPath -NoTypeInformation -Encoding UTF8
Write-Host "Screen specs written to $OutputDir"
Write-Host "Index written to $indexPath"
