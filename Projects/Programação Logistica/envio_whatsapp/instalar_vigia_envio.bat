@echo off
chcp 65001 >nul
title Instalar vigia - Envio WhatsApp
cd /d "%~dp0"

set "VBS=%~dp0vigia_oculto_envio.vbs"

schtasks /Create /TN "Vigia Envio Telemetria" /SC MINUTE /MO 5 /F ^
  /TR "wscript.exe \"%VBS%\""

schtasks /Run /TN "Vigia Envio Telemetria"

echo.
echo ============================================================
echo  Vigia do ENVIO instalado.
echo  - Verifica a cada 5 minutos e reabre o envio (oculto) se cair.
echo  - Ja iniciou agora em segundo plano.
echo.
echo  Agora pode FECHAR a janela visivel do envio (se ainda estiver
echo  aberta). O vigia mantem tudo rodando escondido.
echo  Para remover: rode  remover_vigia_envio.bat
echo ============================================================
echo.
pause
