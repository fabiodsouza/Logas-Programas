@echo off
chcp 65001 >nul
title Parar capturas (todas as copias)
echo Encerrando TODOS os processos de captura (captura_telemetria)...
echo.
wmic process where "commandline like '%%captura_telemetria.ps1%%'" call terminate >nul 2>nul
wmic process where "commandline like '%%captura_telemetria.py%%'" call terminate >nul 2>nul
echo Pronto. As capturas foram encerradas.
echo.
echo Observacao: se o vigia estiver ATIVO, ele reabre UMA unica captura
echo em ate 5 minutos (agora ja com a trava, sem duplicar).
echo Se quiser que NAO reabra, rode antes o  remover_vigia_captura.bat
echo.
pause
