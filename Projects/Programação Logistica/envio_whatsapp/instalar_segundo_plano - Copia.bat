@echo off
chcp 65001 >nul
title Instalar segundo plano - Envio WhatsApp
cd /d "%~dp0"

rem ============================================================
rem  Instala o ENVIO para rodar OCULTO (sem janela de cmd) e:
rem   - iniciar sozinho quando o PC liga e faz login;
rem   - reabrir em ate 3 minutos se for fechado/derrubado.
rem  Precisa ser executado como ADMINISTRADOR.
rem ============================================================

net session >nul 2>nul
if errorlevel 1 (
    echo.
    echo Este instalador precisa ser executado como ADMINISTRADOR.
    echo Clique com o botao direito neste arquivo e escolha
    echo "Executar como administrador".
    echo.
    pause
    exit /b 1
)

set "VBS=%~dp0vigia_oculto_envio.vbs"
set "TASK=Envio Telemetria WhatsApp"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$vbs = '%VBS%';" ^
  "$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument ('\"' + $vbs + '\"');" ^
  "$t1 = New-ScheduledTaskTrigger -AtLogOn;" ^
  "$t2 = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1);" ^
  "$t2.Repetition = (New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 3)).Repetition;" ^
  "$set = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero);" ^
  "Register-ScheduledTask -TaskName '%TASK%' -Action $action -Trigger $t1,$t2 -Settings $set -User $env:USERNAME -Force | Out-Null;" ^
  "Start-ScheduledTask -TaskName '%TASK%';" ^
  "Write-Host 'Tarefa criada e iniciada.'"

if errorlevel 1 (
    echo.
    echo Falha ao criar a tarefa. Verifique se rodou como administrador.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo  PRONTO. O envio agora roda em SEGUNDO PLANO (oculto):
echo   - inicia sozinho quando o PC liga e faz login;
echo   - reabre em ate 3 minutos se alguem fechar;
echo   - NAO mostra janela de cmd (ninguem fecha por engano).
echo.
echo  Pode fechar qualquer janela visivel do envio que ainda
echo  estiver aberta.
echo.
echo  Para DESLIGAR: rode  desinstalar_segundo_plano.bat
echo ============================================================
echo.
pause
