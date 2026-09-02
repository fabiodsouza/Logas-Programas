# ============================================================
#  Captura de tela - de hora em hora  (versao PowerShell)
#  Nao precisa instalar nada: usa o que ja vem no Windows.
#
#  Exemplos:
#    powershell -ExecutionPolicy Bypass -File captura_telemetria.ps1 -Listar
#    powershell -ExecutionPolicy Bypass -File captura_telemetria.ps1
#    powershell -ExecutionPolicy Bypass -File captura_telemetria.ps1 -Monitor 1 -UmaVez
#
#  Mais facil: use o atalho  iniciar_captura_telemetria.bat
# ============================================================

param(
    [int]$Monitor = 1,            # 1 = primeiro monitor, 2 = segundo... (veja -Listar). 0 = todos juntos.
    [string]$Pasta = "",         # pasta de saida (padrao: subpasta 'capturas' ao lado deste script)
    [int]$Intervalo = 0,         # segundos entre capturas; 0 = alinhar na hora cheia (xx:00)
    [switch]$UmaVez,             # captura uma vez e sai
    [switch]$Listar             # lista os monitores e sai
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

if ($Pasta -eq "") {
    $Pasta = Join-Path $PSScriptRoot "capturas"
}

function Listar-Monitores {
    Write-Host "Monitores detectados:"
    Write-Host "  [0] TODOS os monitores juntos (area virtual)"
    $i = 1
    foreach ($s in [System.Windows.Forms.Screen]::AllScreens) {
        $b = $s.Bounds
        $principal = if ($s.Primary) { " (principal)" } else { "" }
        Write-Host ("  [{0}] monitor {0}{1}: {2}x{3} posicao ({4}, {5})" -f `
            $i, $principal, $b.Width, $b.Height, $b.X, $b.Y)
        $i++
    }
    Write-Host ""
    Write-Host "Use o numero entre colchetes em -Monitor (ex.: -Monitor 2)."
}

function Get-Bounds([int]$mon) {
    if ($mon -eq 0) {
        return [System.Windows.Forms.SystemInformation]::VirtualScreen
    }
    $telas = [System.Windows.Forms.Screen]::AllScreens
    if ($mon -lt 1 -or $mon -gt $telas.Count) {
        throw "Monitor $mon nao existe. Rode com -Listar para ver as opcoes."
    }
    return $telas[$mon - 1].Bounds
}

function Capturar([int]$mon, [string]$pastaSaida) {
    # Cria uma subpasta por dia: capturas\AAAA-MM-DD\
    $pastaDia = Join-Path $pastaSaida (Get-Date -Format "yyyy-MM-dd")
    if (-not (Test-Path $pastaDia)) {
        New-Item -ItemType Directory -Path $pastaDia -Force | Out-Null
    }
    $b = Get-Bounds $mon
    $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.CopyFromScreen($b.Location, [System.Drawing.Point]::Empty, $b.Size)
    $nome = "telemetria_" + (Get-Date -Format "yyyy-MM-dd_HH-mm-ss") + ".png"
    $caminho = Join-Path $pastaDia $nome
    $bmp.Save($caminho, [System.Drawing.Imaging.ImageFormat]::Png)
    $gfx.Dispose()
    $bmp.Dispose()
    return $caminho
}

function Seg-AteHoraCheia {
    $a = Get-Date
    return (59 - $a.Minute) * 60 + (60 - $a.Second)
}

# -------------------- execucao --------------------
if ($Listar) {
    Listar-Monitores
    return
}

# ---- TRAVA DE INSTANCIA UNICA (so no modo continuo) ----
# Impede que rodem duas capturas ao mesmo tempo. Se ja houver uma,
# esta copia se encerra na hora (antes de tirar qualquer print).
if (-not $UmaVez) {
    try {
        $script:travaCaptura = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 53118)
        $script:travaCaptura.Start()
    } catch {
        Write-Host "Ja existe uma captura rodando neste PC. Encerrando esta copia."
        return
    }
}

Write-Host "============================================================"
Write-Host " Captura de tela - de hora em hora"
Write-Host "============================================================"
Write-Host " Monitor : $Monitor"
Write-Host " Pasta   : $Pasta"
if ($Intervalo -gt 0) {
    Write-Host " Intervalo: a cada $Intervalo s (intervalo fixo)"
} else {
    Write-Host " Intervalo: na hora cheia (xx:00)"
}
Write-Host " Para parar: feche esta janela ou pressione Ctrl+C"
Write-Host "============================================================"

# Primeira captura imediata
try {
    $c = Capturar $Monitor $Pasta
    Write-Host ("[{0}] salvo: {1}" -f (Get-Date -Format "dd/MM HH:mm:ss"), $c)
} catch {
    Write-Host ("[{0}] ERRO: {1}" -f (Get-Date -Format "dd/MM HH:mm:ss"), $_.Exception.Message)
}

if ($UmaVez) { return }

while ($true) {
    try {
        if ($Intervalo -gt 0) {
            Start-Sleep -Seconds $Intervalo
        } else {
            Start-Sleep -Seconds (Seg-AteHoraCheia)
        }
        $c = Capturar $Monitor $Pasta
        Write-Host ("[{0}] salvo: {1}" -f (Get-Date -Format "dd/MM HH:mm:ss"), $c)
    } catch {
        Write-Host ("[{0}] ERRO: {1}" -f (Get-Date -Format "dd/MM HH:mm:ss"), $_.Exception.Message)
        Start-Sleep -Seconds 60
    }
}
