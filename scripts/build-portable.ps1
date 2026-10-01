param(
  [string]$Version = "0.2.1",
  [string]$OutDir = (Join-Path $PSScriptRoot "..\release")
)

$ErrorActionPreference = "Stop"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$stage = Join-Path $OutDir "TAURIGHT-v$Version-win-x64"
$zip = "$stage.zip"

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  throw "node_modules is missing. Build from a verified TAURIGHT workspace."
}

$node = (Get-Command node.exe -ErrorAction Stop).Source
Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $zip -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Force -Path $stage, (Join-Path $stage "runtime"), (Join-Path $stage "src") | Out-Null

Copy-Item -LiteralPath (Join-Path $root "bin") -Destination $stage -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "src\core") -Destination (Join-Path $stage "src") -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "node_modules") -Destination $stage -Recurse -Force
Remove-Item -LiteralPath (Join-Path $stage "node_modules\.package-lock.json") -Force -ErrorAction SilentlyContinue

$files = @(
  "package.json",
  "README.md",
  "README.ko.md",
  "README.ja.md",
  "README.zh.md",
  "README.ru.md",
  "README.hi.md",
  "THIRD_PARTY_NOTICES.md",
  ".env.example",
  "TAURIGHT.cmd"
)

foreach ($item in $files) {
  Copy-Item -LiteralPath (Join-Path $root $item) -Destination (Join-Path $stage $item) -Force
}

Copy-Item -LiteralPath $node -Destination (Join-Path $stage "runtime\node.exe") -Force

Compress-Archive -LiteralPath $stage -DestinationPath $zip -CompressionLevel Optimal
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zip).Hash.ToLowerInvariant()
Set-Content -LiteralPath "$zip.sha256" -Value "$hash  $(Split-Path $zip -Leaf)" -Encoding ascii

Write-Output "PORTABLE=$zip"
Write-Output "SHA256=$hash"
