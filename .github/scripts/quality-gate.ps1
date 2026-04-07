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

function Invoke-ReviewSurfacePhase {
    $boards = Get-ChildItem -Path $repoRoot -File -Filter "*-review-board.html" -ErrorAction SilentlyContinue
    if ($null -eq $boards -or $boards.Count -eq 0) {
        Write-Host "Review surface phase skipped: no review boards found."
        return
    }

    $checked = 0
    foreach ($board in $boards) {
        $html = Get-Content -LiteralPath $board.FullName -Raw
        if ($html -notmatch 'manifestUrl') {
            continue
        }

        $manifestBase = $board.Name -replace '-review-board\.html$', '-review-manifest.json'
        $manifestPath = Join-Path $repoRoot $manifestBase
        Assert (Test-Path -LiteralPath $manifestPath) "Missing review manifest for $($board.Name): $manifestBase"

        $manifestRaw = Get-Content -LiteralPath $manifestPath -Raw
        try {
            $manifest = $manifestRaw | ConvertFrom-Json -Depth 100
        }
        catch {
            throw "Invalid review manifest JSON: $manifestPath"
        }

        foreach ($prop in @('reference', 'prototype', 'live')) {
            $entry = $manifest.PSObject.Properties[$prop]
            if ($null -ne $entry -and $null -ne $entry.Value -and $entry.Value.src) {
                $assetPath = Resolve-LocalReference -HtmlPath $manifestPath -Reference $entry.Value.src
                Assert (Test-Path -LiteralPath $assetPath) "Missing review asset in ${manifestBase}: $($entry.Value.src)"
            }
        }

        if ($null -ne $manifest.columns) {
            foreach ($column in $manifest.columns) {
                $layersProp = $column.PSObject.Properties['layers']
                if ($null -ne $layersProp -and $null -ne $layersProp.Value) {
                    foreach ($layer in $layersProp.Value) {
                        if ($null -ne $layer -and $layer.src) {
                            $assetPath = Resolve-LocalReference -HtmlPath $manifestPath -Reference $layer.src
                            Assert (Test-Path -LiteralPath $assetPath) "Missing review layer asset in ${manifestBase}: $($layer.src)"
                        }
                    }
                }
            }
        }

        $checked += 1
    }

    Write-Host "Review surface phase passed for $checked manifest-driven boards."
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

    Invoke-ReviewSurfacePhase

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
