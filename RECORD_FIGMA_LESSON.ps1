param(
    [Parameter(Mandatory = $true)][string]$Screen,
    [Parameter(Mandatory = $true)][string]$Observed,
    [Parameter(Mandatory = $true)][string]$RuleAdded,
    [string]$NodeId = "",
    [string]$Status = "active"
)

$entry = [ordered]@{
    date = (Get-Date).ToString('yyyy-MM-dd')
    screen = $Screen
    node_id = $NodeId
    observed = $Observed
    rule_added = $RuleAdded
    status = $Status
} | ConvertTo-Json -Compress

$path = Join-Path $PSScriptRoot 'FIGMA_LESSONS.jsonl'
Add-Content -Path $path -Value $entry
Write-Host $entry

