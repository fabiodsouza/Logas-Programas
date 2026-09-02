@echo off
chcp 65001 >nul
title Remover vigia - Envio WhatsApp
schtasks /Delete /TN "Vigia Envio Telemetria" /F
echo.
echo Vigia do envio removido. (O envio que ja estiver rodando oculto
echo continua ate o PC reiniciar; para parar agora, use o Gerenciador
echo de Tarefas e finalize o processo "node.exe".)
echo.
pause
