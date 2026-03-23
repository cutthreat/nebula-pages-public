param(
  [string]$QueuePath = "H:\Nebula\GPT\figma-manifest\implementation-queue.json",
  [string]$OutputPath = "H:\Nebula\GPT\figma-manifest\code-implementation-plan.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $QueuePath)) {
  throw "Queue not found: $QueuePath"
}

$queue = Get-Content -LiteralPath $QueuePath -Raw | ConvertFrom-Json

$rules = [ordered]@{
  home = [ordered]@{
    html = "H:\Nebula\GPT\_unzipped\home.html"
    css = "H:\Nebula\GPT\_unzipped\home.css"
    js = "H:\Nebula\GPT\_unzipped\home.js"
    baseline = "Approved Home baseline"
  }
  "home-popup-open" = [ordered]@{
    html = "H:\Nebula\GPT\_unzipped\home-popup-open.html"
    css = "H:\Nebula\GPT\_unzipped\home.css"
    js = "H:\Nebula\GPT\_unzipped\home.js"
    baseline = "Approved Home modal/offcanvas variant"
  }
  "psychic-reading-new" = [ordered]@{
    html = "H:\Nebula\GPT\_unzipped\psychic-reading-new.html"
    css = "H:\Nebula\GPT\_unzipped\psychic-reading-new.css"
    js = "H:\Nebula\GPT\_unzipped\psychic-reading-new.js"
    baseline = "Approved PRN page variant"
  }
  "signup-step-1" = [ordered]@{
    html = "H:\Nebula\GPT\_unzipped\signup-step-1.html"
    css = "H:\Nebula\GPT\_unzipped\figma-auth.css"
    js = "H:\Nebula\GPT\_unzipped\figma-auth.js"
    baseline = "Auth flow step 1"
  }
  "signup-step-2" = [ordered]@{
    html = "H:\Nebula\GPT\_unzipped\signup-step-2.html"
    css = "H:\Nebula\GPT\_unzipped\figma-auth.css"
    js = "H:\Nebula\GPT\_unzipped\figma-auth.js"
    baseline = "Auth flow step 2"
  }
}

$plan = foreach ($item in $queue) {
  $slug = [IO.Path]::GetFileNameWithoutExtension($item.page_file)
  $ruleKey = if ($rules.Contains($slug)) { $slug } else { "home" }
  $rule = $rules[$ruleKey]

  [ordered]@{
    page_file = $item.page_file
    screen_order = $item.screen_order
    screen_name = $item.screen_name
    spec_path = $item.spec_path
    implemented = [bool]$item.implemented
    implementation_target = [ordered]@{
      html = $rule.html
      css = $rule.css
      js = $rule.js
      baseline = $rule.baseline
    }
    action = if ($item.implemented) { "verify_and_harden" } else { "implement" }
    notes = if ($item.implemented) { "Compare against spec, fix drift only." } else { "Build from spec and baseline." }
  }
}

$summary = [ordered]@{
  total = $plan.Count
  implemented = ($plan | Where-Object { $_.implemented }).Count
  to_implement = ($plan | Where-Object { -not $_.implemented }).Count
}

$out = [ordered]@{
  summary = $summary
  plan = $plan
}

$out | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Code implementation plan written to $OutputPath"
