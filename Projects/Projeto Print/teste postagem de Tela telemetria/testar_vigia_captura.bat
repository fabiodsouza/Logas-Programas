@echo off
chcp 65001 >nul
title TESTE do vigia da captura
cd /d "%~dp0"
echo Rodando o vigia uma vez (visivel) para testar...
echo Se a captura estiver fechada, ele deve reabrir agora.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0vigia_captura.ps1"
echo.
echo --- Conteudo do log: ---
if exist "%~dp0vigia_captura_log.txt" type "%~dp0vigia_captura_log.txt"
echo.
echo Tambem confere abaixo se a tarefa agendada existe e o ultimo resultado:
echo.
schtasks /query /tn "Vigia Captura Telemetria" /v /fo LIST 2>nul | findstr /i "TaskName Status Resultado Result Próxima Next Última Last"
echo.
pause
