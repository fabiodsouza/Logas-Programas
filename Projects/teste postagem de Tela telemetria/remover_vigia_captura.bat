@echo off
chcp 65001 >nul
title Remover vigia - Captura
schtasks /Delete /TN "Vigia Captura Telemetria" /F
echo.
echo Vigia da captura removido. (A captura que ja estiver rodando oculta
echo continua ate o PC reiniciar; para parar agora, use o Gerenciador de
echo Tarefas e finalize o processo "pythonw.exe" ou "python.exe".)
echo.
pause
