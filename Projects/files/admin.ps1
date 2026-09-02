# Cria o primeiro administrador do painel (ou troca a senha de um existente).
#
#     powershell -ExecutionPolicy Bypass -File .\admin.ps1
#
# Depois disso, todo o cadastro de clientes acontece pela tela, em /admin.
# Este script so e necessario para o primeiro acesso ou para recuperar a senha
# do administrador.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Ambiente nao instalado. Rode primeiro: .\instalar.ps1" -ForegroundColor Red
    exit 1
}

& ".\.venv\Scripts\python.exe" .\criar_admin.py

if (Test-Path ".\admins.json") {
    try {
        icacls .\admins.json /inheritance:r /grant:r "$env:USERNAME:(R,W)" /grant:r "Administrators:(F)" | Out-Null
        Write-Host "admins.json protegido para o seu usuario." -ForegroundColor Green
    } catch {
        Write-Host "Nao consegui ajustar as permissoes do admins.json — confira manualmente." -ForegroundColor Yellow
    }
}
