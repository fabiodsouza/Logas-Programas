# Vigia do ENVIO. Faz duas coisas:
#   1) Se o "node index.js" NAO estiver rodando, reabre oculto.
#   2) Se ESTIVER rodando porem TRAVADO VIVO (sem batimento ha varios minutos),
#      encerra para o programa reiniciar limpo (a auto-limpeza roda no arranque).
$ErrorActionPreference = 'SilentlyContinue'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Definition

$proc = Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
        Where-Object { $_.CommandLine -like '*index.js*' } |
        Select-Object -First 1

# Caso 1: nao ha processo -> inicia oculto e termina.
if (-not $proc) {
    Start-Process -FilePath 'node.exe' -ArgumentList 'index.js' `
        -WorkingDirectory $dir -WindowStyle Hidden
    return
}

# Folga de 10 min apos iniciar: tempo de conectar / escanear QR sem ser morto.
$idadeProcMin = ((Get-Date) - $proc.CreationDate).TotalMinutes
if ($idadeProcMin -lt 10) { return }

# Verifica o batimento: heartbeat.txt deve ter sido atualizado ha menos de 8 min.
$hb = Join-Path $dir 'heartbeat.txt'
$batimentoOk = $false
if (Test-Path $hb) {
    $idadeHbMin = ((Get-Date) - (Get-Item $hb).LastWriteTime).TotalMinutes
    if ($idadeHbMin -lt 8) { $batimentoOk = $true }
}

# Caso 2: processo vivo mas sem batimento -> travou. Encerra e reabre limpo.
if (-not $batimentoOk) {
    Stop-Process -Id $proc.ProcessId -Force
    Start-Sleep -Seconds 2
    Start-Process -FilePath 'node.exe' -ArgumentList 'index.js' `
        -WorkingDirectory $dir -WindowStyle Hidden
}
