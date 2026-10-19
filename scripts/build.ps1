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
$packageFiles = @("bootstrap.js", "LICENSE", "manifest.json")
$fixedTimestamp = [DateTimeOffset]::new(2026, 1, 1, 0, 0, 0, [TimeSpan]::Zero)

New-Item -ItemType Directory -Force -Path $resolvedOutputDirectory | Out-Null

if (Test-Path -LiteralPath $packagePath) {
    Remove-Item -LiteralPath $packagePath
}

Add-Type -AssemblyName System.IO.Compression
$packageStream = [System.IO.File]::Open($packagePath, [System.IO.FileMode]::CreateNew)

try {
    $archive = [System.IO.Compression.ZipArchive]::new(
        $packageStream,
        [System.IO.Compression.ZipArchiveMode]::Create,
        $false
    )

    try {
        foreach ($file in $packageFiles) {
            $sourcePath = Join-Path $projectRoot $file
            $entry = $archive.CreateEntry($file, [System.IO.Compression.CompressionLevel]::NoCompression)
            $entry.LastWriteTime = $fixedTimestamp
            $entryStream = $entry.Open()
            $sourceStream = [System.IO.File]::OpenRead($sourcePath)

            try {
                $sourceStream.CopyTo($entryStream)
            }
            finally {
                $sourceStream.Dispose()
                $entryStream.Dispose()
            }
        }
    }
    finally {
        $archive.Dispose()
    }
}
finally {
    $packageStream.Dispose()
}

$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $packagePath).Hash.ToLowerInvariant()
Write-Host "Built: $packagePath"
Write-Host "SHA-256: $hash"

