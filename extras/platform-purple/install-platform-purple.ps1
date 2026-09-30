# dsh-platform-purple / install-platform-purple.ps1
#
# Shut the Harness app down, wait for app.asar to be released, install the patch
# (with retries), verify, then start the app again. Everything is logged to
# install.log next to this script.
#
# IMPORTANT: keep this file pure ASCII. Windows PowerShell 5.1 reads a .ps1 file
# as ANSI when it has no UTF-8 BOM, so non-ASCII comments break the parser.
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File install-platform-purple.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File install-platform-purple.ps1 -DryRun
#   powershell -NoProfile -ExecutionPolicy Bypass -File install-platform-purple.ps1 -Exe 'C:\path\to\DeepSeek Harness.exe'
#
# The patch script reads DSH_RESOURCES from the environment when the app lives
# somewhere other than the author's default (D:\DeepSeek\resources).

param(
  [switch]$DryRun,
  [string]$Exe = 'D:\DeepSeek\DeepSeek Harness.exe'
)

$ErrorActionPreference = 'Continue'
$dir = $PSScriptRoot
$log = Join-Path $dir 'install.log'
$patch = Join-Path $dir 'patch-platform-purple.mjs'

function W($m) { "$((Get-Date).ToString('o'))  $m" | Out-File -FilePath $log -Append -Encoding utf8 }

try {
  W '=== install helper started ==='
  W ("dry run = " + $DryRun)

  if ($DryRun) {
    $st = & node $patch --status 2>&1
    W ('status: ' + ($st -join ' | '))
    W '=== dry run done (app left running) ==='
    exit 0
  }

  # Give the agent reply time to reach the user before the app goes away.
  Start-Sleep -Seconds 20

  # 1) Stop the app: graceful first, then forced. Up to 90 seconds.
  $deadline = (Get-Date).AddSeconds(90)
  while ((Get-Date) -lt $deadline) {
    $p = @(Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue)
    if ($p.Count -eq 0) { break }
    foreach ($x in $p) { try { [void]$x.CloseMainWindow() } catch {} }
    Start-Sleep -Seconds 3
    $p = @(Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue)
    if ($p.Count -gt 0) {
      W ('forcing kill: ' + (($p | ForEach-Object { $_.Id }) -join ','))
      foreach ($x in $p) { try { Stop-Process -Id $x.Id -Force -ErrorAction Stop } catch { W ('kill failed ' + $x.Id + ' ' + $_.Exception.Message) } }
      Start-Sleep -Seconds 3
    }
  }
  W ('processes left: ' + (@(Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue)).Count)
  Start-Sleep -Seconds 4

  # 2) Install the patch; the file may take a moment to be released, so retry.
  $installed = $false
  for ($i = 1; $i -le 15; $i++) {
    $out = & node $patch --install 2>&1
    W ("install try ${i}: " + ($out -join ' | '))
    if (($out -join ' ') -match 'app.asar') { $installed = $true; break }
    Start-Sleep -Seconds 4
  }
  W ('installed = ' + $installed)

  $st = & node $patch --status 2>&1
  W ('status: ' + ($st -join ' | '))

  # 3) Start the app again (always, patched or not).
  Start-Sleep -Seconds 2
  if (Test-Path $Exe) {
    Start-Process -FilePath $Exe -WorkingDirectory (Split-Path $Exe -Parent)
  } else {
    W ('exe not found, start the app yourself: ' + $Exe)
  }
  Start-Sleep -Seconds 12
  W ('relaunched, processes now: ' + (@(Get-Process 'DeepSeek Harness' -ErrorAction SilentlyContinue)).Count)
  W '=== done ==='
} catch {
  W ('FATAL: ' + $_.Exception.Message)
}
