@echo off
chcp 65001 >nul
title Captura de tela - de hora em hora
cd /d "%~dp0"

echo Verificando dependencia (mss)...
python -m pip install --quiet mss
if errorlevel 1 (
    echo.
    echo Nao consegui instalar o modulo 'mss'. Verifique se o Python esta instalado.
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando a captura. Para parar, feche esta janela.
echo.
python "captura_telemetria.py" %*

pause
