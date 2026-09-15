param(
    [string]$BaseUrl = 'http://127.0.0.1:8173',
    [string]$ReleaseRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$SourceRoot = '',
    [string]$AssetSource = '',
    [string]$ModuleResourceSource = '',
    [string]$SnapshotVersion = '20260915',
    [switch]$CopyAssets
)

$ErrorActionPreference = 'Stop'

$releaseRootResolved = (Resolve-Path -LiteralPath $ReleaseRoot).Path
if ([string]::IsNullOrWhiteSpace($SourceRoot)) {
    $SourceRoot = Join-Path (Split-Path -Parent (Split-Path -Parent $releaseRootResolved)) 'implementation\nebula-gpt'
}
$sourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
if ([string]::IsNullOrWhiteSpace($AssetSource)) {
    $AssetSource = Join-Path $sourceRoot 'host\yii2\web\assets'
}
if ([string]::IsNullOrWhiteSpace($ModuleResourceSource)) {
    $ModuleResourceSource = Join-Path $sourceRoot 'experiments\nebula-account-chat-live-20260809\yii2\modules\nebulaAccount\resources'
}
$assetSource = (Resolve-Path -LiteralPath $AssetSource).Path
$moduleResourceSource = (Resolve-Path -LiteralPath $ModuleResourceSource).Path
$assetTarget = Join-Path $releaseRootResolved 'assets'
$moduleResourceTarget = Join-Path $releaseRootResolved 'yii2\modules\nebulaAccount\resources'
$htmlTarget = Join-Path $releaseRootResolved 'nebula-account'

foreach ($requiredPath in @($assetSource, $moduleResourceSource, $htmlTarget)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Required exporter path was not found: $requiredPath"
    }
}

$routes = @(
    @{ path='/nebula-account/profile'; file='profile.html' },
    @{ path='/nebula-account/psychics'; file='psychics.html' },
    @{ path='/nebula-account/psychics/margo-lover'; file='psychic-margo-lover.html' },
    @{ path='/nebula-account/psychics/mia-jacomo'; file='psychic-mia-jacomo.html' },
    @{ path='/nebula-account/favorites'; file='favorites.html' },
    @{ path='/nebula-account/chatroom?expert=mia-jacomo&entry=catalogue'; file='chatroom.html' },
    @{ path='/nebula-account/chatroom/notify'; file='chatroom-notify.html' },
    @{ path='/nebula-account/chatroom/expert-offline'; file='expert-offline.html' },
    @{ path='/nebula-account/chatroom/consultation-support'; file='consultation-support.html' },
    @{ path='/nebula-account/static/question-topics'; file='question-topics.html' },
    @{ path='/nebula-account/static/astrological-details'; file='astrological-details.html' },
    @{ path='/nebula-account/static/video-preview'; file='video-preview-static.html' },
    @{ path='/nebula-account/horoscope'; file='horoscope.html' },
    @{ path='/nebula-account/settings'; file='settings.html' },
    @{ path='/nebula-account/settings/support'; file='support.html' },
    @{ path='/nebula-account/settings/notifications'; file='notifications.html' },
    @{ path='/nebula-account/settings/support/billing'; file='billing.html' },
    @{ path='/nebula-account/settings/support/plans'; file='plans.html' },
    @{ path='/nebula-account/settings/support/help'; file='support-help.html' },
    @{ path='/nebula-account/settings/support/helper'; file='helper-bot.html' },
    @{ path='/nebula-account/settings/support/faq'; file='faq.html' },
    @{ path='/nebula-account/settings/astrology'; file='astrology.html' },
    @{ path='/nebula-account/settings/notifications/daily-horoscope'; file='daily-horoscope.html' },
    @{ path='/nebula-account/settings/account'; file='account-information.html' },
    @{ path='/nebula-account/settings/legal'; file='legal.html' },
    @{ path='/nebula-account/settings/legal/privacy-policy'; file='privacy-policy.html' },
    @{ path='/nebula-account/settings/legal/personal-data'; file='personal-data.html' },
    @{ path='/nebula-account/settings/legal/center'; file='legal-center.html' },
    @{ path='/nebula-account/settings/legal/consent'; file='consent-settings.html' },
    @{ path='/nebula-account/settings/notifications/messages'; file='messages-from-psychics.html' },
    @{ path='/nebula-account/settings/notifications/offers'; file='special-offers.html' },
    @{ path='/nebula-account/settings/notifications/system'; file='system-messages.html' }
)

$routeMap = @{}
foreach ($route in $routes) { $routeMap[$route.path.Split('?')[0]] = $route.file }

function Convert-InternalHref([string]$href) {
    try {
        $uri = [System.Uri]('http://local' + $href)
        $path = $uri.AbsolutePath
        $query = $uri.Query
    } catch { return $href }
    if ($routeMap.ContainsKey($path)) { return $routeMap[$path] + $query }
    # The local catalogue contains more expert cards than the static snapshot.
    # Keep unknown catalogue profiles inside the published surface instead of emitting a 404 root route.
    if ($path -match '^/nebula-account/psychics/') { return 'psychics.html' + $query }
    return $href
}

$captured = @{}
$statuses = @{}
$assetNames = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($route in $routes) {
    $response = Invoke-WebRequest -UseBasicParsing -Uri ($BaseUrl + $route.path) -TimeoutSec 20
    $captured[$route.file] = $response.Content
    $statuses[$route.file] = [int]$response.StatusCode
    $assetScanHtml = [regex]::Replace($response.Content, '(?is)<meta\s+name="nebula-integration-config"[^>]*>\s*', '')
    $assetScanHtml = [regex]::Replace($assetScanHtml, '(?is)<link\s+[^>]*integration-sandbox\.css[^>]*>\s*', '')
    $assetScanHtml = [regex]::Replace($assetScanHtml, '(?is)<script\s+[^>]*integration-sandbox\.js[^>]*></script>\s*', '')
    foreach ($match in [regex]::Matches($assetScanHtml, '/assets/(?<name>[a-z0-9]+)/')) {
        [void]$assetNames.Add($match.Groups['name'].Value)
    }
}
# The module's Yii asset bundle is rewritten to the release resource tree.
[void]$assetNames.Add('3f6bda43')

if ($CopyAssets) {
    $stagingRoot = Join-Path $releaseRootResolved ('.snapshot-staging-' + [guid]::NewGuid().ToString('N'))
    $backupRoot = Join-Path $releaseRootResolved ('.snapshot-backup-' + [guid]::NewGuid().ToString('N'))
    $stageAssets = Join-Path $stagingRoot 'assets'
    $stageModuleResources = Join-Path $stagingRoot 'yii2\modules\nebulaAccount\resources'
    $records = @()
    New-Item -ItemType Directory -Force -Path $stageAssets, $stageModuleResources | Out-Null
    try {
        foreach ($assetName in $assetNames) {
            $assetSourcePath = Join-Path $assetSource $assetName
            if (-not (Test-Path -LiteralPath $assetSourcePath -PathType Container)) {
                throw "Referenced Yii asset bundle was not found: $assetSourcePath"
            }
            Copy-Item -LiteralPath $assetSourcePath -Destination (Join-Path $stageAssets $assetName) -Recurse -Force
        }
        Copy-Item -Path (Join-Path $moduleResourceSource '*') -Destination $stageModuleResources -Recurse -Force
        $generatedConversationCss = Join-Path $assetSource '3f6bda43\css\conversation-list.css'
        if (Test-Path -LiteralPath $generatedConversationCss) {
            Copy-Item -LiteralPath $generatedConversationCss -Destination (Join-Path $stageModuleResources 'css\conversation-list.css') -Force
        }
        foreach ($requiredStaged in @(
            (Join-Path $stageModuleResources 'css\chatroom.css'),
            (Join-Path $stageModuleResources 'css\chat-overlays.css'),
            (Join-Path $stageModuleResources 'css\expert-picker-details.css')
        )) {
            if (-not (Test-Path -LiteralPath $requiredStaged -PathType Leaf)) {
                throw "Staged module resource is missing: $requiredStaged"
            }
        }

        New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
        foreach ($install in @(
            [pscustomobject]@{ stage = $stageAssets; target = $assetTarget; name = 'assets' },
            [pscustomobject]@{ stage = $stageModuleResources; target = $moduleResourceTarget; name = 'module-resources' }
        )) {
            $record = [pscustomobject]@{
                stage = $install.stage
                target = $install.target
                backup = Join-Path $backupRoot $install.name
                hadExisting = Test-Path -LiteralPath $install.target
            }
            $records += $record
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $install.target) | Out-Null
            if ($record.hadExisting) {
                Move-Item -LiteralPath $install.target -Destination $record.backup
            }
            Move-Item -LiteralPath $install.stage -Destination $install.target
        }
        Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
        foreach ($record in @($records | Sort-Object target -Descending)) {
            if (Test-Path -LiteralPath $record.target) {
                Remove-Item -LiteralPath $record.target -Recurse -Force
            }
            if ($record.hadExisting -and (Test-Path -LiteralPath $record.backup)) {
                Move-Item -LiteralPath $record.backup -Destination $record.target
            }
        }
        throw
    } finally {
        if (Test-Path -LiteralPath $stagingRoot) {
            Remove-Item -LiteralPath $stagingRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path -LiteralPath $backupRoot) {
            Remove-Item -LiteralPath $backupRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
}

$results = @()
foreach ($route in $routes) {
    $html = [string]$captured[$route.file]
    $html = $html.Replace('/assets/3f6bda43/', '../yii2/modules/nebulaAccount/resources/')
    foreach ($assetName in $assetNames) {
        $html = $html.Replace('/assets/' + $assetName + '/', '../assets/' + $assetName + '/')
    }
    $html = $html.Replace('data-asset-base="/assets/3f6bda43"', 'data-asset-base="../yii2/modules/nebulaAccount/resources"')
    # The loopback source intentionally exposes the integration sandbox for local QA.
    # GitHub Pages is a static projection, so retain no local API metadata/assets there.
    $html = [regex]::Replace($html, '(?is)<meta\s+name="nebula-integration-config"[^>]*>\s*', '')
    $html = [regex]::Replace($html, '(?is)<link\s+[^>]*integration-sandbox\.css[^>]*>\s*', '')
    $html = [regex]::Replace($html, '(?is)<script\s+[^>]*integration-sandbox\.js[^>]*></script>\s*', '')
    # A static projection must not publish a live Yii CSRF token or a volatile asset timestamp.
    $html = [regex]::Replace($html, '(?i)(<meta\s+name="csrf-token"\s+content=")[^"]*(")', ('$1static-preview-csrf-token$2'))
    $html = [regex]::Replace($html, '(?i)(\.(?:css|js))\?v=\d+', ('$1?v=' + $SnapshotVersion))
    if ($route.file -eq 'expert-offline.html') {
        $html = [regex]::Replace($html, '(?is)<title>\s*</title>', '<title>Expert offline — Neuro</title>', 1)
    }
    if ($html -notmatch '(?i)<link\s+[^>]*rel="icon"') {
        $iconMarkup = '<link rel="icon" href="../favicon.ico"><link rel="shortcut icon" href="../favicon.ico">'
        $html = $html.Replace('<head>', '<head>' + [Environment]::NewLine + $iconMarkup)
    }
    $html = [regex]::Replace($html, '(?i)(href=")(/nebula-account[^"#]*)', { param($match) $match.Groups[1].Value + (Convert-InternalHref $match.Groups[2].Value) })
    $html = [regex]::Replace($html, '(?i)(data-[a-z0-9_-]+=")(/nebula-account[^"#]*)', { param($match) $match.Groups[1].Value + (Convert-InternalHref $match.Groups[2].Value) })
    $output = Join-Path $htmlTarget $route.file
    [System.IO.File]::WriteAllText($output, $html, (New-Object System.Text.UTF8Encoding($false)))
    $title = ([regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase')).Groups[1].Value
    $results += [pscustomobject]@{ route=$route.path; file=$route.file; status=[int]$statuses[$route.file]; bytes=$html.Length; title=$title }
}

$manifest = [ordered]@{
    schema='nebula.local-layout-snapshot.v1'
    generatedAt=(Get-Date).ToUniversalTime().ToString('o')
    sourceBaseUrl=$BaseUrl
    sourceModuleRoot='experiments/nebula-account-chat-live-20260809/yii2/modules/nebulaAccount'
    sourceConfig='host/yii2/config/web.php'
    routeCount=$results.Count
    routes=$results
}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $htmlTarget 'latest-routes.json') -Encoding utf8
$results | ForEach-Object { Write-Output ("{0}`t{1}`t{2}`t{3}" -f $_.file, $_.status, $_.bytes, $_.title) }
