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
    # $($env:USERNAME) com parenteses: sem eles o PowerShell engole o segundo ":"
    # no nome da variavel e o icacls recebe o argumento partido.
    # *S-1-5-32-544 e o SID do grupo de administradores, que funciona em qualquer
    # idioma do Windows ("Administrators" nao existe no Windows em portugues).
    icacls ".\clientes.json" /inheritance:r /grant:r "$($env:USERNAME):(R,W)" /grant:r "*S-1-5-32-544:(F)" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "clientes.json protegido: so o seu usuario e os administradores leem." -ForegroundColor Green
    } else {
        Write-Host "Nao consegui restringir as permissoes do clientes.json." -ForegroundColor Yellow
        Write-Host "O portal funciona igual; no servidor, confira quem tem acesso a pasta."
    }
}
