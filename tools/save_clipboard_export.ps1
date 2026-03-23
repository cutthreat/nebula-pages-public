param(
  [Parameter(Mandatory = $true)]
  [string]$OutputPath,

  [ValidateSet("Image", "Text")]
  [string]$Kind = "Image"
)

$ErrorActionPreference = "Stop"

$parent = Split-Path -Parent $OutputPath
if ($parent -and -not (Test-Path -LiteralPath $parent)) {
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
}

if ($Kind -eq "Image") {
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing
  $img = [System.Windows.Forms.Clipboard]::GetImage()
  if ($null -eq $img) {
    throw "No image found on the clipboard."
  }
  $img.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host "Saved clipboard image to $OutputPath"
  return
}

$text = Get-Clipboard -Raw
if ([string]::IsNullOrWhiteSpace($text)) {
  throw "No text found on the clipboard."
}
Set-Content -LiteralPath $OutputPath -Value $text -Encoding UTF8
Write-Host "Saved clipboard text to $OutputPath"
