@echo off
chcp 65001 >nul
title Status do Envio - Telemetria WhatsApp
cd /d "%~dp0"

echo ============================================================
echo   STATUS DO ENVIO DA TELEMETRIA NO WHATSAPP
echo ============================================================
echo.

rem --- 1) A tarefa de segundo plano esta instalada? ---
schtasks /Query /TN "Envio Telemetria WhatsApp" >nul 2>nul
if errorlevel 1 (
    echo [SEGUNDO PLANO] NAO instalado.
    echo                 Rode "instalar_segundo_plano.bat" como administrador.
) else (
    echo [SEGUNDO PLANO] Instalado ^(inicia no login e revigora a cada 3 min^).
)
echo.

rem --- 2) O processo node esta rodando agora? ---
set "RODANDO="
for /f "delims=" %%P in ('powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -like '*index.js*' }).ProcessId" 2^>nul') do set "RODANDO=%%P"

if defined RODANDO (
    echo [EXECUCAO]      RODANDO agora  ^(PID %RODANDO%^).
) else (
    echo [EXECUCAO]      NAO esta rodando neste momento.
    echo                 Se o segundo plano estiver instalado, ele reabre em ate 3 min.
)
echo.

rem --- 3) Quando foi o ultimo envio (pelo estado_envio.json) ---
if exist "estado_envio.json" (
    echo [ULTIMO ENVIO]  Arquivo de estado atualizado em:
    for %%F in ("estado_envio.json") do echo                 %%~tF
    echo                 Conteudo:
    type "estado_envio.json"
    echo.
) else (
    echo [ULTIMO ENVIO]  Ainda nao houve registro de envio.
)
echo.

rem --- 4) Existe algum aviso de problema? ---
if exist "queda.flag" (
    echo [AVISO]         Ha uma QUEDA registrada e ainda nao recuperada:
    type "queda.flag"
    echo.
)
if exist "ATENCAO_ENVIO_WHATSAPP.txt" (
    echo [AVISO GRAVE]   Sessao do WhatsApp pode ter caido de vez.
    echo                 Veja "ATENCAO_ENVIO_WHATSAPP.txt" ^(tambem na Area de Trabalho^).
    echo.
)
if not exist "queda.flag" if not exist "ATENCAO_ENVIO_WHATSAPP.txt" (
    echo [AVISO]         Nenhum problema registrado.
    echo.
)

echo ============================================================
echo  Resumo rapido:
echo   - SEGUNDO PLANO instalado + EXECUCAO rodando = tudo certo.
echo   - Se nao estiver rodando, espere ate 3 min e rode de novo.
echo ============================================================
echo.
pause
