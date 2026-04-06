param(
    [ValidateSet("syntax", "structure", "publish", "all")]
    [string]$Phase = "all"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Assert {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-RepoFiles {
    param(
        [string]$Pattern
    )

    Get-ChildItem -Path $repoRoot -File -Filter $Pattern -ErrorAction SilentlyContinue
}

function Test-JavaScriptSyntax {
    $node = Get-Command node -ErrorAction SilentlyContinue
    $jsFiles = Get-RepoFiles -Pattern "*.js"
    if ($null -eq $node) {
        foreach ($file in $jsFiles) {
            Assert ((Get-Item $file.FullName).Length -gt 0) "JavaScript file is empty: $($file.FullName)"
        }
        return
    }

    foreach ($file in $jsFiles) {
        & $node.Source --check $file.FullName
        if ($LASTEXITCODE -ne 0) {
            throw "JavaScript syntax check failed: $($file.FullName)"
        }
    }
}

function Get-LocalReferences {
    param(
        [string]$Html
    )

    $matches = [regex]::Matches($Html, '(?i)(?:src|href)\s*=\s*["'']([^"'']+)["'']')
    foreach ($match in $matches) {
        $value = $match.Groups[1].Value.Trim()
        if ([string]::IsNullOrWhiteSpace($value)) { continue }
        if ($value.StartsWith("#")) { continue }
        if ($value.StartsWith("http://") -or $value.StartsWith("https://")) { continue }
        if ($value.StartsWith("//")) { continue }
        if ($value.StartsWith("mailto:")) { continue }
        if ($value.StartsWith("tel:")) { continue }
        if ($value.StartsWith("javascript:")) { continue }
        if ($value.StartsWith("data:")) { continue }
        if ($value.Contains('${')) { continue }
        $value
    }
}

function Resolve-LocalReference {
    param(
        [string]$HtmlPath,
        [string]$Reference
    )

    $normalized = $Reference.Split("?")[0].Split("#")[0]
    if ([string]::IsNullOrWhiteSpace($normalized)) {
        return $null
    }

    if ($normalized.StartsWith("/")) {
        return Join-Path $repoRoot $normalized.TrimStart("/")
    }

    return Join-Path (Split-Path -Parent $HtmlPath) $normalized
}

function Invoke-SyntaxPhase {
    Test-JavaScriptSyntax

    $cssFiles = Get-RepoFiles -Pattern "*.css"
    foreach ($file in $cssFiles) {
        Assert ((Get-Item $file.FullName).Length -gt 0) "CSS file is empty: $($file.FullName)"
    }

    Write-Host "Syntax phase passed."
}

function Invoke-StructurePhase {
    $htmlFiles = Get-RepoFiles -Pattern "*.html"
    Assert ($htmlFiles.Count -gt 0) "No HTML files found in repository root"

    foreach ($file in $htmlFiles) {
        $html = Get-Content -LiteralPath $file.FullName -Raw
        Assert (($html -match '<!doctype html>') -or ($html -match '<html')) "HTML file does not look like a page: $($file.FullName)"

        foreach ($reference in (Get-LocalReferences -Html $html)) {
            $target = Resolve-LocalReference -HtmlPath $file.FullName -Reference $reference
            if ($null -eq $target) { continue }
            Assert (Test-Path -LiteralPath $target) "Broken local reference in $($file.Name): $reference"
        }
    }

    Write-Host "Structure phase passed."
}

function Invoke-PublishPhase {
    foreach ($required in @("README.md", ".nojekyll", "index.html", "home.html")) {
        $path = Join-Path $repoRoot $required
        Assert (Test-Path -LiteralPath $path) "Missing publish artifact: $path"
    }

    $pngFiles = Get-ChildItem -Path (Join-Path $repoRoot "img") -File -Filter "*.png" -ErrorAction SilentlyContinue
    Assert ($pngFiles.Count -gt 0) "No PNG publish assets found under img/"
    foreach ($file in $pngFiles) {
        Assert ((Get-Item $file.FullName).Length -gt 0) "PNG artifact is empty: $($file.FullName)"
    }

    Write-Host "Publish phase passed."
}

switch ($Phase) {
    "syntax" { Invoke-SyntaxPhase; break }
    "structure" { Invoke-StructurePhase; break }
    "publish" { Invoke-PublishPhase; break }
    "all" {
        Invoke-SyntaxPhase
        Invoke-StructurePhase
        Invoke-PublishPhase
        break
    }
}
