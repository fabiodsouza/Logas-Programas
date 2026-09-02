@echo off
chcp 65001 >nul
title Instalar inicio automatico - Captura
cd /d "%~dp0"

set "ALVO=%~dp0iniciar_captura_telemetria.bat"

powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $lnk = $ws.CreateShortcut([Environment]::GetFolderPath('Startup') + '\Captura Telemetria.lnk'); ^
   $lnk.TargetPath = '%ALVO%'; ^
   $lnk.WorkingDirectory = '%~dp0'; ^
   $lnk.Save()"

echo.
echo Pronto! A captura agora inicia junto com o Windows nesta maquina.
echo (Foi criado um atalho na pasta de Inicializar.)
echo Para desfazer: apague o atalho "Captura Telemetria" da pasta que abre
echo ao digitar  shell:startup  no menu Executar (tecla Windows + R).
echo.
pause
