@echo off
setlocal
cd /d "%~dp0"

rem Git checkout: fast-forward to the latest verified TAURIGHT runtime before launch.
rem Portable ZIPs have no .git directory and simply run as-is.
if exist "%~dp0.git" (
  where git >nul 2>nul
  if not errorlevel 1 (
    1>&2 echo [TAURIGHT] Checking GitHub for updates...
    git -C "%~dp0." pull --ff-only --quiet 1>nul
    if errorlevel 1 1>&2 echo [TAURIGHT] Update skipped; launching the current verified runtime.
  )
)

if exist "%~dp0runtime\node.exe" (
  "%~dp0runtime\node.exe" "%~dp0bin\tauright-mcp.mjs" %*
) else (
  node "%~dp0bin\tauright-mcp.mjs" %*
)
