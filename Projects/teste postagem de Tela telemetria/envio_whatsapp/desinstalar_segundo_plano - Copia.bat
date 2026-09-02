@echo off
chcp 65001 >nul
title Desinstalar segundo plano - Envio WhatsApp

net session >nul 2>nul
if errorlevel 1 (
    echo Execute como ADMINISTRADOR (botao direito ^> Executar como administrador).
    pause
    exit /b 1
)

schtasks /Delete /TN "Envio Telemetria WhatsApp" /F >nul 2>nul
rem Remove tambem a tarefa antiga, se existir
schtasks /Delete /TN "Vigia Envio Telemetria" /F >nul 2>nul

echo.
echo Segundo plano DESLIGADO. A tarefa agendada foi removida.
echo.
echo O envio que ainda estiver rodando oculto continua ate o PC
echo reiniciar. Para parar agora, abra o Gerenciador de Tarefas
echo e finalize o processo "node.exe".
echo.
pause
