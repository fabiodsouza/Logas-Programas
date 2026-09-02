@echo off
chcp 65001 >nul
title Listar grupos do WhatsApp
cd /d "%~dp0"
echo Conectando para listar os grupos deste WhatsApp...
echo.
node index.js grupos
echo.
pause
