@echo off
chcp 65001 >nul
title Envio da telemetria no WhatsApp
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo Node.js nao encontrado. Instale em https://nodejs.org  e tente de novo.
    echo.
    pause
    exit /b 1
)

rem Verifica se o modulo existe de verdade (e nao so a pasta node_modules)
node -e "require.resolve('whatsapp-web.js')" >nul 2>nul
if errorlevel 1 (
    echo Dependencias ausentes ou incompletas. Instalando... pode demorar alguns minutos.
    echo (precisa de internet nesta maquina)
    echo.
    call npm install
    node -e "require.resolve('whatsapp-web.js')" >nul 2>nul
    if errorlevel 1 (
        echo.
        echo NAO foi possivel instalar as dependencias.
        echo - Se esta maquina NAO tem internet: copie a pasta "node_modules" inteira
        echo   do PC onde funcionou para dentro desta pasta e rode de novo.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Iniciando o envio. Na primeira vez, escaneie o QR Code que aparecer.
echo Para parar, feche esta janela.
echo.
node index.js

pause
