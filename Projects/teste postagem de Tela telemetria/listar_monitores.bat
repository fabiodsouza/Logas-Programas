@echo off
chcp 65001 >nul
title Listar monitores
cd /d "%~dp0"
python -m pip install --quiet mss
python "captura_telemetria.py" --listar
echo.
pause
