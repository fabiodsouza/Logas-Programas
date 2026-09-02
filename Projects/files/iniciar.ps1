# Sobe o Portal do Cliente. Deixe esta janela aberta enquanto estiver testando.
#
#     powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
#
# Parametros:
#   -Porta 8100        porta local (padrao 8100)
#   -Local             modo teste: aceita HTTP em http://localhost:8100
#
# Sem -Local, o cookie de sessao exige HTTPS, ou seja, o portal precisa estar
# atras do Cloudflare Tunnel ou de um proxy com certificado.

param(
    [int]$Porta = 8100,
    [switch]$Local
)

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Ambiente nao instalado. Rode primeiro: .\instalar.ps1" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path ".\clientes.json")) {
    Write-Host "Nenhum cliente cadastrado ainda. Rode: .\cadastrar.ps1" -ForegroundColor Yellow
}

if ($Local) {
    $env:LOGAS_COOKIE_SECURE = "0"
    Write-Host "MODO TESTE: HTTP liberado. Nao use assim com cliente de verdade." -ForegroundColor Yellow
    Write-Host ("Abra no navegador: http://localhost:{0}/" -f $Porta) -ForegroundColor Cyan
} else {
    $env:LOGAS_COOKIE_SECURE = "1"
}

Write-Host ("Portal escutando em 127.0.0.1:{0} — Ctrl+C para parar." -f $Porta) -ForegroundColor Green
& ".\.venv\Scripts\python.exe" -m uvicorn app:app --host 127.0.0.1 --port $Porta
