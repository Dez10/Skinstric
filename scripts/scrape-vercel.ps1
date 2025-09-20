# Scrape Vercel pages (HTML + linked CSS + images + fonts) into _reference folder
# Usage (in CMD or PowerShell):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\scrape-vercel.ps1

$ErrorActionPreference = 'Stop'

# ---------------------------- CONFIG ----------------------------------
$BaseUrl = 'https://skinstric-wandag.vercel.app'
$Pages   = @('result','camera','select','summary')

# Output directories
$OutRoot = (Join-Path $PSScriptRoot '..' | Resolve-Path).Path
$RefRoot = Join-Path $OutRoot '_reference'
$CssDir  = Join-Path $RefRoot 'css'
$ImgDir  = Join-Path $RefRoot 'images'
$FontDir = Join-Path $RefRoot 'fonts'
$JsDir   = Join-Path $RefRoot 'js'

# Create folders
New-Item -ItemType Directory -Force -Path $RefRoot | Out-Null
New-Item -ItemType Directory -Force -Path $CssDir | Out-Null
New-Item -ItemType Directory -Force -Path $ImgDir | Out-Null
New-Item -ItemType Directory -Force -Path $FontDir | Out-Null
New-Item -ItemType Directory -Force -Path $JsDir | Out-Null

# -------------------------- ENV FIXUPS ---------------------------------
# TLS: prefer TLS1.2+ so HTTPS works on older PowerShell
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls
} catch {}

# Detect PowerShell edition to avoid using deprecated -UseBasicParsing on Core (7+)
$IsCore = $false
try { if ($PSVersionTable.PSEdition -and $PSVersionTable.PSEdition -eq 'Core') { $IsCore = $true } } catch {}

# Common headers to mimic a browser and avoid 403s
$Headers = @{
  'User-Agent'      = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
  'Accept'          = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
  'Accept-Language' = 'en-US,en;q=0.9'
}

function Resolve-AbsoluteUrl([string]$href) {
  if (-not $href) { return $null }
  if ($href -match '^(?i)https?://') { return $href }
  if ($href -match '^(?i)//') { return 'https:' + $href }
  if ($href.StartsWith('/')) { return $BaseUrl.TrimEnd('/') + $href }
  return ($BaseUrl.TrimEnd('/') + '/' + $href.TrimStart('/'))
}

function New-DirForFile([string]$path) {
  $dir = Split-Path -Parent $path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
}

function Save-RemoteFile([string]$url, [string]$destPath) {
  if (-not $url) { return }
  try {
    New-DirForFile $destPath
    if ($IsCore) {
      Invoke-WebRequest -Uri $url -OutFile $destPath -MaximumRedirection 5 -Headers $Headers -ErrorAction Stop | Out-Null
    } else {
      Invoke-WebRequest -Uri $url -OutFile $destPath -MaximumRedirection 5 -Headers $Headers -UseBasicParsing -ErrorAction Stop | Out-Null
    }
  } catch {
    Write-Warning "Failed to download: $url -> $destPath | $($_.Exception.Message)"
  }
}

# Regex patterns (allow query strings)
$rxCss    = 'href\s*=\s*"([^"]+\.css(?:\?[^\"]*)?)"'
$rxImg    = 'src\s*=\s*"([^"]+\.(?:png|jpg|jpeg|svg|webp|gif)(?:\?[^\"]*)?)"'
$rxScript = 'src\s*=\s*"([^"]+\.js(?:\?[^\"]*)?)"'
$rxUrlFun = 'url\(([^)]+)\)'

# ---------------------------- FETCH HTML --------------------------------
foreach ($page in $Pages) {
  $url = ($BaseUrl.TrimEnd('/') + '/' + $page)
  $out = Join-Path $RefRoot ($page + '.html')
  Write-Host "Downloading page: $url"
  Save-RemoteFile -url $url -destPath $out
}

# ------------------------- PARSE & DOWNLOAD -----------------------------
Get-ChildItem $RefRoot -Filter *.html | ForEach-Object {
  $htmlPath = $_.FullName
  $html     = Get-Content $htmlPath -Raw

  # 1) Linked CSS (includes rel=stylesheet and rel=preload as=style)
  $cssMatches = [System.Text.RegularExpressions.Regex]::Matches($html, $rxCss, 'IgnoreCase')
  foreach ($m in $cssMatches) {
    $href = $m.Groups[1].Value
    $cssUrl = Resolve-AbsoluteUrl $href
    if (-not $cssUrl) { continue }
    $leaf = Split-Path -Leaf $cssUrl
    $cssOut = Join-Path $CssDir $leaf
    Write-Host "  CSS: $cssUrl"
    Save-RemoteFile -url $cssUrl -destPath $cssOut

    # Parse CSS for url(...) images and fonts
    try {
      $cssContent = Get-Content $cssOut -Raw
      $urlMatches = [System.Text.RegularExpressions.Regex]::Matches($cssContent, $rxUrlFun, 'IgnoreCase')
      foreach ($um in $urlMatches) {
        $raw = $um.Groups[1].Value.Trim('"', '\', ' ')
        if ([string]::IsNullOrWhiteSpace($raw)) { continue }
        if ($raw -match '^data:') { continue }
        $resUrl = Resolve-AbsoluteUrl $raw
        if (-not $resUrl) { continue }
        $leaf   = Split-Path -Leaf $resUrl
        if ($leaf -match '\.(?:woff2|woff|ttf|otf)(?:\?.*)?$') {
          $outPath = Join-Path $FontDir $leaf
          Write-Host "    FONT: $resUrl"
          Save-RemoteFile -url $resUrl -destPath $outPath
        } elseif ($leaf -match '\.(?:png|jpg|jpeg|svg|webp|gif)(?:\?.*)?$') {
          $outPath = Join-Path $ImgDir $leaf
          Write-Host "    IMG (from CSS): $resUrl"
          Save-RemoteFile -url $resUrl -destPath $outPath
        }
      }
    } catch {}
  }

  # 2) Script files (sometimes contain asset references or CSS chunk URLS)
  $jsMatches = [System.Text.RegularExpressions.Regex]::Matches($html, $rxScript, 'IgnoreCase')
  foreach ($m in $jsMatches) {
    $href = $m.Groups[1].Value
    $jsUrl = Resolve-AbsoluteUrl $href
    if (-not $jsUrl) { continue }
    # Mirror _next static structure under js/
    try {
      $uri = [System.Uri]$jsUrl
      $relPath = $uri.AbsolutePath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $jsOut = Join-Path $JsDir $relPath
      Write-Host "  JS: $jsUrl"
      Save-RemoteFile -url $jsUrl -destPath $jsOut
    } catch {
      $leaf = Split-Path -Leaf $jsUrl
      $jsOut = Join-Path $JsDir $leaf
      Write-Host "  JS: $jsUrl"
      Save-RemoteFile -url $jsUrl -destPath $jsOut
    }
  }

  # 3) Image tags in HTML
  $imgMatches = [System.Text.RegularExpressions.Regex]::Matches($html, $rxImg, 'IgnoreCase')
  foreach ($m in $imgMatches) {
    $src = $m.Groups[1].Value
    $imgUrl = Resolve-AbsoluteUrl $src
    if (-not $imgUrl) { continue }
    try {
      $uri = [System.Uri]$imgUrl
      $relPath = $uri.AbsolutePath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
      $imgOut = Join-Path $ImgDir $relPath
      Write-Host "  IMG: $imgUrl"
      Save-RemoteFile -url $imgUrl -destPath $imgOut
    } catch {
      $leaf = Split-Path -Leaf $imgUrl
      $imgOut = Join-Path $ImgDir $leaf
      Write-Host "  IMG: $imgUrl"
      Save-RemoteFile -url $imgUrl -destPath $imgOut
    }
  }
}

Write-Host "`nDone. Files saved under: $RefRoot"