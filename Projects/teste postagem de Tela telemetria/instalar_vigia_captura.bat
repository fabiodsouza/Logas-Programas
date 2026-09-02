@echo off
chcp 65001 >nul
title Instalar vigia - Captura
cd /d "%~dp0"

set "VBS=%~dp0vigia_oculto_captura.vbs"

echo Criando a tarefa agendada (verifica a cada 5 minutos)...
schtasks /Create /TN "Vigia Captura Telemetria" /SC MINUTE /MO 5 /F /TR "wscript.exe \"%VBS%\""

echo.
echo Liberando para rodar tambem na bateria e sem limite de tempo...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "try { $s = Get-ScheduledTask -TaskName 'Vigia Captura Telemetria'; $st = $s.Settings; $st.DisallowStartIfOnBatteries=$false; $st.StopIfGoingOnBatteries=$false; $st.ExecutionTimeLimit='PT0S'; Set-ScheduledTask -TaskName 'Vigia Captura Telemetria' -Settings $st | Out-Null; Write-Host 'Ajuste de energia: OK' } catch { Write-Host ('Aviso (ignore se a tarefa foi criada): ' + $_.Exception.Message) }"

echo.
echo Rodando agora uma vez...
schtasks /Run /TN "Vigia Captura Telemetria"

echo.
echo ===================== STATUS DA TAREFA =====================
schtasks /query /tn "Vigia Captura Telemetria" /v /fo LIST
echo ============================================================
echo.
echo Pronto. Confira o arquivo  vigia_captura_log.txt  daqui a uns
echo minutos: ele deve ganhar UMA LINHA NOVA a cada 5 minutos.
echo Se ganhar, o vigia esta ativo e vai reabrir a captura se cair.
echo.
pause
