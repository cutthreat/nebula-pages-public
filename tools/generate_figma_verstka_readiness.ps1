param(
  [string]$WorkspaceRoot = "H:\Nebula\GPT",
  [string]$OutputPath = "H:\Nebula\GPT\figma-manifest\figma-verstka-readiness.json"
)

$ErrorActionPreference = "Stop"

$manifestPath = Join-Path $WorkspaceRoot "figma-manifest\figma-manifest.local.json"
$planPath = Join-Path $WorkspaceRoot "figma-manifest\figma-export-plan.json"
$queuePath = Join-Path $WorkspaceRoot "figma-manifest\implementation-queue.json"
$codePlanPath = Join-Path $WorkspaceRoot "figma-manifest\code-implementation-plan.json"
$publishablesPath = Join-Path $WorkspaceRoot "figma-manifest\figma-publishables.local.json"
$componentsMapPath = Join-Path $WorkspaceRoot "figma-manifest\figma-components-map.json"

function Read-Json([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  try { return Get-Content -LiteralPath $Path -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return $null }
}

$manifest = Read-Json $manifestPath
$plan = Read-Json $planPath
$queue = Read-Json $queuePath
$codePlan = Read-Json $codePlanPath
$publishables = Read-Json $publishablesPath
$componentsMap = Read-Json $componentsMapPath

$readiness = [ordered]@{
  generated_at = (Get-Date).ToString("s")
  workspace_root = $WorkspaceRoot
  counts = [ordered]@{
    screens = if ($manifest) { @($manifest.pages).Count } else { 0 }
    sections = if ($manifest) { (@($manifest.pages) | ForEach-Object { @($_.sections).Count } | Measure-Object -Sum).Sum } else { 0 }
    export_nodes = if ($plan) { @($plan.nodes).Count } else { 0 }
    implemented_sections = if ($queue) { @($queue | Where-Object { $_.implemented -eq $true }).Count } else { 0 }
    pending_sections = if ($queue) { @($queue | Where-Object { $_.implemented -ne $true }).Count } else { 0 }
    reusable_publishables = if ($publishables) { @($publishables.publishable_symbols).Count + @($publishables.publishable_state_groups).Count } else { 0 }
    reusable_components = if ($componentsMap) { @($componentsMap.rows).Count } else { 0 }
  }
  source_paths = [ordered]@{
    manifest = $manifestPath
    export_plan = $planPath
    queue = $queuePath
    code_plan = $codePlanPath
    publishables = $publishablesPath
    components_map = $componentsMapPath
  }
  targets = @()
  reusable_nodes = @()
  notes = @(
    "Use the export plan to follow node order.",
    "Use publishables to map reusable components and state groups.",
    "Use the components map to separate reusable component groups from screen-specific blocks.",
    "Use code implementation plan to map screens to source files.",
    "Only after this report is green should layout coding proceed."
  )
}

if ($codePlan) {
  foreach ($item in @($codePlan.plan)) {
    $readiness.targets += [ordered]@{
      page_file = $item.page_file
      screen_order = $item.screen_order
      screen_name = $item.screen_name
      action = $item.action
      html = $item.implementation_target.html
      css = $item.implementation_target.css
      js = $item.implementation_target.js
      spec_path = $item.spec_path
    }
  }
}

if ($publishables) {
  foreach ($item in @($publishables.publishable_symbols)) {
    $readiness.reusable_nodes += [ordered]@{
      kind = "symbol"
      node_id = $item.nodeId
      name = $item.name
      width = $item.width
      height = $item.height
      version_hash = $item.versionHash
    }
  }
  foreach ($item in @($publishables.publishable_state_groups)) {
    $readiness.reusable_nodes += [ordered]@{
      kind = "state_group"
      node_id = $item.nodeId
      name = $item.name
      width = $item.width
      height = $item.height
      version_hash = $item.versionHash
    }
  }
}

if ($componentsMap) {
  $readiness.component_groups = @()
  $groups = @{}
  foreach ($item in @($componentsMap.rows)) {
    $groupName = [string]$item.component_group
    if (-not $groups.ContainsKey($groupName)) {
      $groups[$groupName] = 0
    }
    $groups[$groupName]++
  }
  foreach ($k in ($groups.Keys | Sort-Object)) {
    $readiness.component_groups += [ordered]@{
      group = $k
      count = $groups[$k]
    }
  }
}

$readiness | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Verstka readiness written to $OutputPath"
