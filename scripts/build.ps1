[CmdletBinding()]
param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\dist")
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$manifest = Get-Content -Raw (Join-Path $projectRoot "manifest.json") | ConvertFrom-Json
$version = $manifest.version
$packageName = "zotero-excel-column-resize-$version.xpi"
$resolvedOutputDirectory = [System.IO.Path]::GetFullPath($OutputDirectory)
$packagePath = Join-Path $resolvedOutputDirectory $packageName
$temporaryDirectory = Join-Path ([System.IO.Path]::GetTempPath()) ("zotero-excel-column-resize-" + [guid]::NewGuid())

New-Item -ItemType Directory -Force -Path $resolvedOutputDirectory | Out-Null
New-Item -ItemType Directory -Path $temporaryDirectory | Out-Null

try {
    foreach ($file in @("bootstrap.js", "manifest.json", "LICENSE")) {
        Copy-Item -LiteralPath (Join-Path $projectRoot $file) -Destination $temporaryDirectory
    }

    if (Test-Path -LiteralPath $packagePath) {
        Remove-Item -LiteralPath $packagePath
    }

    Compress-Archive -Path (Join-Path $temporaryDirectory "*") -DestinationPath $packagePath -CompressionLevel Optimal
    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $packagePath).Hash.ToLowerInvariant()

    Write-Host "Built: $packagePath"
    Write-Host "SHA-256: $hash"
}
finally {
    if (Test-Path -LiteralPath $temporaryDirectory) {
        Remove-Item -LiteralPath $temporaryDirectory -Recurse -Force
    }
}
