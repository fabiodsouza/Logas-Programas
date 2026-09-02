@echo off
chcp 65001 >nul
title Captura de tela da telemetria - de hora em hora
cd /d "%~dp0"
echo Iniciando captura... (para parar, feche esta janela)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0captura_telemetria.ps1" %*
pause
