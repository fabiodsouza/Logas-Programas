@echo off
REM Le os prints do painel (varrendo subpastas dia/hora) a partir de 24/06/2026 07:00.
REM Mantenha ler_painel.py e dados.js na MESMA pasta deste .bat.
cd /d "%~dp0"
set CAPTURAS=D:\Projeto Print\teste postagem de Tela telemetria\capturas
set PYTHONPYCACHEPREFIX=%TEMP%\pyc_telemetria
py ler_painel.py "%CAPTURAS%" --desde 2026-06-24T07:00:00 >> log_telemetria.txt 2>&1
REM Atualiza os tempos de viagem (TomTom) -> viagem.js, junto com a leitura
py viagem_tomtom.py >> log_telemetria.txt 2>&1
