# Vigia da CAPTURA: reabre a captura se ela nao estiver rodando.
# A deteccao e feita pela TRAVA (porta local 53118) que a captura abre -
# isso e confiavel no Windows 8 (nao depende de ler a linha de comando).
# Funciona com a versao PowerShell (captura_telemetria.ps1) ou Python (.py).
$ErrorActionPreference = 'Stop'
$dir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$log = Join-Path $dir 'vigia_captura_log.txt'
$PORTA = 53118

function Log($m) {
    Add-Content -Path $log -Value ("[" + (Get-Date -Format "dd/MM HH:mm:ss") + "] " + $m)
}

function CapturaRodando {
    # Se conseguir conectar na porta da trava, e porque a captura esta rodando.
    try {
        $cli = New-Object System.Net.Sockets.TcpClient
        $cli.Connect('127.0.0.1', $PORTA)
        $cli.Close()
        return $true
    } catch {
        return $false
    }
}

try {
    if (CapturaRodando) {
        Log "OK: captura ja rodando."
        exit 0
    }

    $ps1 = Join-Path $dir 'captura_telemetria.ps1'
    $py  = Join-Path $dir 'captura_telemetria.py'

    if (Test-Path $ps1) {
        Log "Captura parada. Reabrindo a versao PowerShell..."
        Start-Process -FilePath 'powershell.exe' `
            -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Hidden', '-File', ('"' + $ps1 + '"') `
            -WorkingDirectory $dir -WindowStyle Hidden
        Log "Captura (PowerShell) reaberta."
        exit 0
    }

    if (Test-Path $py) {
        $pyExe = $null
        foreach ($cand in @('pythonw.exe', 'python.exe')) {
            $c = Get-Command $cand -ErrorAction SilentlyContinue
            if ($c) { $pyExe = $c.Source; break }
        }
        if (-not $pyExe) { Log "ERRO: Python nao encontrado."; exit 1 }
        Log ("Captura parada. Reabrindo a versao Python com " + $pyExe)
        Start-Process -FilePath $pyExe -ArgumentList ('"' + $py + '"') -WorkingDirectory $dir -WindowStyle Hidden
        Log "Captura (Python) reaberta."
        exit 0
    }

    Log "ERRO: nao encontrei captura_telemetria.ps1 nem .py nesta pasta."
}
catch {
    Log ("EXCECAO: " + $_.Exception.Message)
}
