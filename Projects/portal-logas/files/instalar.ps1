# Instalacao do Portal do Cliente - Logas (Windows)
#
# Abra o PowerShell NA PASTA onde estao estes arquivos e rode:
#
#     powershell -ExecutionPolicy Bypass -File .\instalar.ps1
#
# Nao precisa de administrador.

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host ""
Write-Host "=== Portal do Cliente - Logas ===" -ForegroundColor Cyan
Write-Host ""

# --- Python -----------------------------------------------------------------
# O portal roda a partir do 3.8. Se houver mais de uma versao instalada,
# escolhemos a mais nova: o 3.8 saiu de suporte em 2024 e nao recebe mais
# correcao de seguranca, o que pesa num servico exposto para fora.
$candidatos = @()

# 1) versoes conhecidas pelo lancador "py"
try {
    $lista = & py -0p 2>&1
    foreach ($linha in $lista) {
        $l = [string]$linha
        if ($l -match "-(?:V:)?(\d+)\.(\d+)" ) {
            $maior = [int]$Matches[1]; $menor = [int]$Matches[2]
            if ($l -match "([A-Za-z]:\\[^\r\n]*python\.exe)") {
                $candidatos += [pscustomobject]@{ Maior=$maior; Menor=$menor; Exe=$Matches[1] }
            }
        }
    }
} catch { }

# 2) python que estiver no PATH
try {
    $v = & python --version 2>&1
    if ($v -match "Python (\d+)\.(\d+)") {
        $exe = (Get-Command python -ErrorAction Stop).Source
        $candidatos += [pscustomobject]@{ Maior=[int]$Matches[1]; Menor=[int]$Matches[2]; Exe=$exe }
    }
} catch { }

$validos = $candidatos | Where-Object { $_.Maior -eq 3 -and $_.Menor -ge 8 } |
           Sort-Object Menor -Descending
$escolhido = $validos | Select-Object -First 1

if (-not $escolhido) {
    Write-Host "Nao encontrei Python 3.8 ou mais novo." -ForegroundColor Red
    Write-Host "Instale de https://www.python.org/downloads/windows/ marcando"
    Write-Host "'Add python.exe to PATH', feche o PowerShell, abra de novo e rode este script outra vez."
    exit 1
}

$pyExe = $escolhido.Exe
Write-Host ("Python: " + (& $pyExe --version 2>&1) + "  [" + $pyExe + "]") -ForegroundColor Green

if ($escolhido.Menor -lt 10) {
    Write-Host ""
    Write-Host "Aviso: o Python 3.$($escolhido.Menor) nao recebe mais correcao de seguranca." -ForegroundColor Yellow
    Write-Host "O portal funciona nele, mas como o servico fica exposto para fora, vale"
    Write-Host "instalar o Python 3.12 ao lado. O 3.$($escolhido.Menor) e seus scripts atuais"
    Write-Host "(ler_painel.py, viagem_tomtom.py) continuam intactos: o portal usa ambiente"
    Write-Host "proprio na pasta .venv."
    Write-Host ""
    $resp = Read-Host "Continuar no Python 3.$($escolhido.Menor)? (s/N)"
    if (-not $resp.Trim().ToLower().StartsWith("s")) {
        Write-Host "Instale o 3.12, feche o PowerShell, abra de novo e rode este script outra vez."
        exit 1
    }
}

# --- Ambiente virtual e dependencias ---------------------------------------
if (-not (Test-Path ".\.venv")) {
    Write-Host "Criando ambiente virtual..."
    & $pyExe -m venv .venv
}
$pip = ".\.venv\Scripts\pip.exe"
Write-Host "Instalando dependencias (pode levar um minuto)..."
& $pip install --upgrade pip --quiet
& $pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao instalar dependencias. Se a rede da Logas usa proxy," -ForegroundColor Red
    Write-Host "rode: `$env:HTTPS_PROXY='http://usuario:senha@proxy:porta'  e tente de novo."
    exit 1
}
Write-Host "Dependencias instaladas." -ForegroundColor Green

# --- Onde esta o dados.js ---------------------------------------------------
$cfgPath = ".\config.json"
$cfg = Get-Content $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json
$atual = [string]$cfg.dados_js

Write-Host ""
Write-Host "Caminho do dados.js (o arquivo que o ler_painel.py gera)."
if ($atual -and (Test-Path $atual -PathType Leaf)) {
    Write-Host ("Atual: " + $atual) -ForegroundColor Green
    $novo = Read-Host "Enter para manter, ou cole outro caminho"
} else {
    if ($atual) { Write-Host ("Configurado, mas nao encontrei: " + $atual) -ForegroundColor Yellow }
    $novo = Read-Host "Cole o caminho completo (ex.: C:\painel\dados.js)"
}

if ($novo) {
    $novo = $novo.Trim([char]34).Trim([char]39)   # tira aspas se o caminho vier colado com elas

    # Se veio uma pasta, tenta o dados.js dentro dela antes de reclamar.
    if (Test-Path $novo -PathType Container) {
        $tentativa = Join-Path $novo "dados.js"
        if (Test-Path $tentativa -PathType Leaf) {
            Write-Host ("Isso e uma pasta. Usando o arquivo dentro dela: " + $tentativa) -ForegroundColor Yellow
            $novo = $tentativa
        } else {
            Write-Host "Isso e uma pasta, e nao tem dados.js dentro dela." -ForegroundColor Red
            Write-Host "O caminho tem que terminar no arquivo, por exemplo: C:\painel\dados.js"
            exit 1
        }
    }

    if (-not (Test-Path $novo -PathType Leaf)) {
        Write-Host "Esse arquivo nao existe. Confira o caminho e rode o script de novo." -ForegroundColor Red
        exit 1
    }
    $cfg.dados_js = $novo
    ($cfg | ConvertTo-Json -Depth 6) | Set-Content $cfgPath -Encoding UTF8
    Write-Host ("dados.js: " + $novo) -ForegroundColor Green
}

# --- Teste de leitura -------------------------------------------------------
Write-Host ""
Write-Host "Conferindo a instalacao..."
& ".\.venv\Scripts\python.exe" .\verificar.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nao consegui ler nenhum ponto. Confira se o caminho aponta para o dados.js certo." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Pronto. Proximos passos:" -ForegroundColor Cyan
Write-Host "  1) Crie seu acesso administrativo:  .\admin.ps1"
Write-Host "  2) Suba o portal:                   .\iniciar.ps1 -Local"
Write-Host "  3) Cadastre os clientes em:          http://localhost:8100/admin"
Write-Host ""
Write-Host "  Para publicar para fora e virar servico do Windows, veja o README."
Write-Host ""
