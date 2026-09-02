@echo off
chcp 65001 >nul
title Instalar inicio automatico - Envio WhatsApp
cd /d "%~dp0"

set "ALVO=%~dp0iniciar_envio_whatsapp.bat"

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $lnk = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\Envio Telemetria WhatsApp.lnk'); ^
   $lnk.TargetPath = '%ALVO%'; ^
   $lnk.WorkingDirectory = '%~dp0'; ^
   $lnk.Save()"

echo.
echo Pronto! O envio agora inicia junto com o Windows neste PC.
echo (Foi criado um atalho na pasta de Inicializar.)
echo Para desfazer: apague o atalho "Envio Telemetria WhatsApp" da pasta
echo que abre ao digitar  shell:startup  no menu Executar (tecla Windows + R).
echo.
pause
