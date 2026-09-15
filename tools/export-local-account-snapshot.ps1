param(
    [string]$BaseUrl = 'http://127.0.0.1:8173',
    [string]$ReleaseRoot = (Split-Path -Parent $PSScriptRoot),
    [switch]$CopyAssets
)

$ErrorActionPreference = 'Stop'

$sourceRoot = 'F:\CodexProjects\confideline-nebula\implementation\nebula-gpt'
$assetSource = Join-Path $sourceRoot 'host\yii2\web\assets'
$assetTarget = Join-Path $ReleaseRoot 'assets'
$htmlTarget = Join-Path $ReleaseRoot 'nebula-account'

if ($CopyAssets) {
    New-Item -ItemType Directory -Force -Path $assetTarget | Out-Null
    $hashes = @('1afd7040','1fcb51d','26673cb2','26cf1e05','3fe51ac8','431cad45','46a5959a','6531e1a1','7d412407','9c3604ba','c18bc218','f2ce81c5','fece512a')
    foreach ($hash in $hashes) {
        $source = Join-Path $assetSource $hash
        $target = Join-Path $assetTarget $hash
        if (Test-Path $target) { Remove-Item -LiteralPath $target -Recurse -Force }
        Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
    }
    $conversationList = Join-Path $ReleaseRoot 'yii2\modules\nebulaAccount\resources\css\conversation-list.css'
    Copy-Item -LiteralPath (Join-Path $assetSource '3f6bda43\css\conversation-list.css') -Destination $conversationList -Force
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

$results = @()
foreach ($route in $routes) {
    $response = Invoke-WebRequest -UseBasicParsing -Uri ($BaseUrl + $route.path) -TimeoutSec 20
    $html = $response.Content
    $html = $html.Replace('/assets/3f6bda43/', '../yii2/modules/nebulaAccount/resources/')
    foreach ($hash in @('1afd7040','1fcb51d','26673cb2','26cf1e05','3fe51ac8','431cad45','46a5959a','6531e1a1','7d412407','9c3604ba','c18bc218','f2ce81c5','fece512a')) {
        $html = $html.Replace('/assets/' + $hash + '/', '../assets/' + $hash + '/')
    }
    $html = $html.Replace('data-asset-base="/assets/3f6bda43"', 'data-asset-base="../yii2/modules/nebulaAccount/resources"')
    # The loopback source intentionally exposes the integration sandbox for local QA.
    # GitHub Pages is a static projection, so retain no local API metadata/assets there.
    $html = [regex]::Replace($html, '(?is)<meta\s+name="nebula-integration-config"[^>]*>\s*', '')
    $html = [regex]::Replace($html, '(?is)<link\s+[^>]*integration-sandbox\.css[^>]*>\s*', '')
    $html = [regex]::Replace($html, '(?is)<script\s+[^>]*integration-sandbox\.js[^>]*></script>\s*', '')
    $html = [regex]::Replace($html, '(?i)(href=")(/nebula-account[^"#]*)', { param($match) $match.Groups[1].Value + (Convert-InternalHref $match.Groups[2].Value) })
    $output = Join-Path $htmlTarget $route.file
    [System.IO.File]::WriteAllText($output, $html, (New-Object System.Text.UTF8Encoding($false)))
    $title = ([regex]::Match($html, '<title[^>]*>(.*?)</title>', 'IgnoreCase')).Groups[1].Value
    $results += [pscustomobject]@{ route=$route.path; file=$route.file; status=[int]$response.StatusCode; bytes=$html.Length; title=$title }
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
