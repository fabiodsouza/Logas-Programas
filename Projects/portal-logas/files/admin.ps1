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
    # $($env:USERNAME) com parenteses: sem eles o PowerShell engole o segundo ":"
    # no nome da variavel e o icacls recebe o argumento partido.
    # *S-1-5-32-544 e o SID do grupo de administradores, que funciona em qualquer
    # idioma do Windows ("Administrators" nao existe no Windows em portugues).
    icacls ".\admins.json" /inheritance:r /grant:r "$($env:USERNAME):(R,W)" /grant:r "*S-1-5-32-544:(F)" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "admins.json protegido: so o seu usuario e os administradores leem." -ForegroundColor Green
    } else {
        Write-Host "Nao consegui restringir as permissoes do admins.json." -ForegroundColor Yellow
        Write-Host "O portal funciona igual; no servidor, confira quem tem acesso a pasta."
    }
}
