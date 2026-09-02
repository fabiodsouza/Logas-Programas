@echo off
chcp 65001 >nul
title Recuperar Envio - Telemetria WhatsApp
cd /d "%~dp0"

echo ============================================================
echo   RECUPERACAO DO ENVIO DA TELEMETRIA NO WHATSAPP
echo ============================================================
echo.
echo 1) Encerrando processos travados (node e Chrome desta sessao)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*index.js*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*sessao_whatsapp*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
timeout /t 2 >nul

echo 2) Limpando travas do navegador (inclui o lockfile que prende a sessao)...
del /q "sessao_whatsapp\session\SingletonLock"      2>nul
del /q "sessao_whatsapp\session\SingletonCookie"    2>nul
del /q "sessao_whatsapp\session\SingletonSocket"    2>nul
del /q "sessao_whatsapp\session\DevToolsActivePort" 2>nul
del /q "sessao_whatsapp\session\lockfile"           2>nul

echo 3) Liberando o estado para reenviar o print mais recente na largada...
> estado_envio.json echo {"ultimoHash": null, "ultimoArquivo": null}

echo.
echo 4) Iniciando em PRIMEIRO PLANO (janela visivel)...
echo    - Se aparecer um QR Code, escaneie com o celular:
echo      WhatsApp ^> Aparelhos conectados ^> Conectar um aparelho.
echo    - Quando aparecer "WhatsApp conectado!" e depois "ENVIADO",
echo      esta resolvido. Pode FECHAR esta janela: o segundo plano
echo      assume sozinho em ate 3 minutos.
echo.
node index.js
echo.
pause
