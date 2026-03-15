@echo off
echo Uninstalling Valorant Strategy Overlay...
echo.

REM Remove from startup if added
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "ValorantStrategyOverlay" /f 2>nul

echo.
echo To complete uninstall:
echo 1. Close Valorant Strategy Overlay if it's running
echo 2. Delete this folder (where uninstall.bat is located)
echo.
echo Uninstall complete.
pause
