@echo off
chcp 65001 >nul
title Diagnostico do Envio - Telemetria
cd /d "%~dp0"
node diagnostico.js
echo.
pause
