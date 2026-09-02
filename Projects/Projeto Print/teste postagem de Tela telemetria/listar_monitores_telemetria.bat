@echo off
chcp 65001 >nul
title Listar monitores - telemetria
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0captura_telemetria.ps1" -Listar
echo.
pause
