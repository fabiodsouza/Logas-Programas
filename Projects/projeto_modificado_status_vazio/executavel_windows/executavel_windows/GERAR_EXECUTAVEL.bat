@echo off
chcp 65001 >nul
title Gerar Executavel - Sistema de Gestao de Manutencao
color 0B

REM --- Garante que estamos rodando NA PASTA DO PROPRIO ARQUIVO .bat ---
cd /d "%~dp0"

REM --- Auto-elevacao: pede permissao de administrador (necessaria para o electron-builder) ---
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Este gerador precisa de permissao de administrador do Windows.
    echo Vou solicitar agora: clique em "SIM" na janela que aparecer.
    echo.
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs" 2>nul
    if errorlevel 1 (
        echo.
        echo [ERRO] Nao foi possivel obter permissao de administrador.
        echo Clique com o botao direito neste arquivo e escolha
        echo "Executar como administrador".
        echo.
        pause
    )
    exit /b
)

REM --- Ja estamos como administrador; volta para a pasta do arquivo ---
cd /d "%~dp0"

echo ============================================================
echo   GERADOR DO EXECUTAVEL (.exe)
echo   Sistema de Gestao de Manutencao
echo ============================================================
echo.
echo Pasta atual: %CD%
echo.

REM --- Verifica se os arquivos do projeto estao presentes ---
if not exist "%~dp0package.json" (
    echo [ERRO] Nao encontrei o arquivo "package.json" nesta pasta.
    echo.
    echo Isso normalmente acontece quando o .bat foi aberto de DENTRO do arquivo .zip.
    echo.
    echo COMO RESOLVER:
    echo    1. Feche esta janela.
    echo    2. Clique com o botao direito no arquivo "executavel_windows.zip".
    echo    3. Escolha "Extrair Tudo..." e confirme.
    echo    4. Entre na pasta extraida "executavel_windows".
    echo    5. De duplo clique no GERAR_EXECUTAVEL.bat de dentro dela.
    echo.
    pause
    exit /b 1
)
if not exist "%~dp0app\index.html" (
    echo [ERRO] Nao encontrei a pasta "app" com o programa nesta pasta.
    echo Extraia o .zip completo antes de rodar ^(veja as instrucoes no Word^).
    echo.
    pause
    exit /b 1
)

REM --- Verifica se o Node.js esta instalado ---
where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] O Node.js nao foi encontrado no seu computador.
    echo.
    echo Instale o Node.js primeiro:
    echo    1. Acesse https://nodejs.org
    echo    2. Baixe a versao "LTS" e instale ^(basta ir clicando em Avancar^).
    echo    3. Reinicie o computador e rode este arquivo novamente.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado:
call node --version
echo.

echo [1/2] Instalando os componentes necessarios ^(so na primeira vez, pode demorar alguns minutos^)...
echo.
call npm install
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar os componentes. Verifique sua conexao com a internet e tente de novo.
    echo.
    pause
    exit /b 1
)

REM --- Limpa cache incompleto de tentativas anteriores (evita erro de symbolic link) ---
if exist "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" (
    echo Limpando cache anterior incompleto...
    rmdir /s /q "%LOCALAPPDATA%\electron-builder\Cache\winCodeSign" 2>nul
)

echo.
echo [2/2] Gerando o executavel...
echo.
call npm run dist
if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao gerar o executavel.
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   PRONTO! O executavel foi gerado na pasta "dist".
echo   Arquivo: dist\GestaoManutencao.exe
echo ============================================================
echo.
echo Abrindo a pasta com o executavel...
start "" "%~dp0dist"
echo.
pause
