# Cadastra um cliente ou troca a senha de um cliente existente.
#
#     powershell -ExecutionPolicy Bypass -File .\cadastrar.ps1
#
# A senha e digitada sem aparecer na tela e nao fica gravada em nenhum lugar:
# o clientes.json guarda apenas o salt e o hash.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "Ambiente nao instalado. Rode primeiro: .\instalar.ps1" -ForegroundColor Red
    exit 1
}

& ".\.venv\Scripts\python.exe" .\criar_usuario.py

if (Test-Path ".\clientes.json") {
    # Tira a heranca de permissoes e deixa so o seu usuario e os administradores.
    try {
        icacls .\clientes.json /inheritance:r /grant:r "$env:USERNAME:(R,W)" /grant:r "Administrators:(F)" | Out-Null
        Write-Host "clientes.json protegido para o seu usuario." -ForegroundColor Green
    } catch {
        Write-Host "Nao consegui ajustar as permissoes do clientes.json — confira manualmente." -ForegroundColor Yellow
    }
}
