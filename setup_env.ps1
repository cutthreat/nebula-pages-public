param(
    [switch]$SkipBrowserCheck
)

$ErrorActionPreference = 'Stop'

$python = (Get-Command python).Source
Write-Host "Python: $python"

python -m pip install --upgrade pip
python -m pip install -r "$PSScriptRoot\requirements-dev.txt"

@'
from docx import Document
from PIL import Image
import playwright
print("python-docx OK")
print("Pillow OK")
print("Playwright OK")
'@ | python -

if (-not $SkipBrowserCheck) {
    $browsers = @(
        'C:\Program Files\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    )

    $found = $browsers | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($found) {
        Write-Host "Browser OK: $found"
    }
    else {
        throw "Chrome/Edge not found. Install a Chromium-based browser or set SkipBrowserCheck."
    }
}

Write-Host "Environment ready."
