param(
  [Parameter(Mandatory = $true)]
  [string] $TargetDirectory
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$staging = Join-Path $env:TEMP ("getme-engines-" + [Guid]::NewGuid().ToString("N"))
$extractDirectory = Join-Path $staging "ffmpeg"
$ytDlpPath = Join-Path $TargetDirectory "yt-dlp.exe"
$ffmpegPath = Join-Path $TargetDirectory "ffmpeg.exe"
$ffprobePath = Join-Path $TargetDirectory "ffprobe.exe"

function Test-Executable($Path, $Arguments) {
  if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $false }
  try {
    & $Path @Arguments *> $null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

try {
  if ((Test-Executable $ytDlpPath @("--version")) -and
      (Test-Executable $ffmpegPath @("-version")) -and
      (Test-Executable $ffprobePath @("-version"))) {
    exit 0
  }

  New-Item -ItemType Directory -Path $staging -Force | Out-Null
  New-Item -ItemType Directory -Path $extractDirectory -Force | Out-Null

  $ytDlpDownload = Join-Path $staging "yt-dlp.exe"
  $ytDlpChecksums = Join-Path $staging "yt-dlp-SHA2-256SUMS"
  $ffmpegArchive = Join-Path $staging "ffmpeg-release-essentials.zip"
  $ffmpegChecksum = Join-Path $staging "ffmpeg-release-essentials.zip.sha256"

  Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe" -OutFile $ytDlpDownload -UseBasicParsing -TimeoutSec 1800
  Invoke-WebRequest -Uri "https://github.com/yt-dlp/yt-dlp/releases/latest/download/SHA2-256SUMS" -OutFile $ytDlpChecksums -UseBasicParsing -TimeoutSec 1800
  $ytDlpChecksumLine = Get-Content -LiteralPath $ytDlpChecksums | Where-Object { $_ -match "(?i)\*?yt-dlp\.exe\s*$" } | Select-Object -First 1
  $expectedYtDlpHash = [Regex]::Match([string] $ytDlpChecksumLine, "(?i)\b[0-9a-f]{64}\b").Value
  if (-not $expectedYtDlpHash) { throw "Não encontrei o checksum oficial do yt-dlp." }
  $actualYtDlpHash = (Get-FileHash -LiteralPath $ytDlpDownload -Algorithm SHA256).Hash
  if ($actualYtDlpHash -ne $expectedYtDlpHash) { throw "A verificação do yt-dlp não correspondeu." }
  if (-not (Test-Executable $ytDlpDownload @("--version"))) { throw "O executável yt-dlp baixado não passou na verificação." }

  Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip" -OutFile $ffmpegArchive -UseBasicParsing -TimeoutSec 1800
  Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip.sha256" -OutFile $ffmpegChecksum -UseBasicParsing -TimeoutSec 1800
  $expectedFfmpegHash = [Regex]::Match((Get-Content -LiteralPath $ffmpegChecksum -Raw), "(?i)\b[0-9a-f]{64}\b").Value
  if (-not $expectedFfmpegHash) { throw "Não encontrei o checksum do pacote FFmpeg." }
  $actualFfmpegHash = (Get-FileHash -LiteralPath $ffmpegArchive -Algorithm SHA256).Hash
  if ($actualFfmpegHash -ne $expectedFfmpegHash) { throw "A verificação do pacote FFmpeg não correspondeu." }

  Expand-Archive -LiteralPath $ffmpegArchive -DestinationPath $extractDirectory -Force
  $downloadedFfmpeg = Get-ChildItem -LiteralPath $extractDirectory -Filter "ffmpeg.exe" -File -Recurse | Select-Object -First 1
  if (-not $downloadedFfmpeg) { throw "Não encontrei ffmpeg.exe no pacote." }
  $downloadedFfprobe = Join-Path $downloadedFfmpeg.DirectoryName "ffprobe.exe"
  if (-not (Test-Path -LiteralPath $downloadedFfprobe -PathType Leaf)) { throw "Não encontrei ffprobe.exe no pacote." }
  if (-not (Test-Executable $downloadedFfmpeg.FullName @("-version"))) { throw "O executável FFmpeg baixado não passou na verificação." }
  if (-not (Test-Executable $downloadedFfprobe @("-version"))) { throw "O executável FFprobe baixado não passou na verificação." }

  New-Item -ItemType Directory -Path $TargetDirectory -Force | Out-Null
  Copy-Item -LiteralPath $ytDlpDownload -Destination $ytDlpPath -Force
  Copy-Item -LiteralPath $downloadedFfmpeg.FullName -Destination $ffmpegPath -Force
  Copy-Item -LiteralPath $downloadedFfprobe -Destination $ffprobePath -Force
  exit 0
} catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
} finally {
  if (Test-Path -LiteralPath $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force -ErrorAction SilentlyContinue
  }
}
