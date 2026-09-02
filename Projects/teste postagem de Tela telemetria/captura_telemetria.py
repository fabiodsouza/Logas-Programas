"""
Captura de tela de hora em hora -> salva PNG numa pasta.

Uso rapido:
    python captura_telemetria.py --listar        # mostra os monitores disponiveis
    python captura_telemetria.py                 # captura o monitor configurado, de hora em hora
    python captura_telemetria.py --monitor 2     # escolhe qual monitor capturar
    python captura_telemetria.py --uma-vez       # captura uma unica vez e sai (teste)

Opcoes:
    --monitor N        Qual monitor capturar (use --listar para ver os numeros). 0 = todos juntos.
    --pasta CAMINHO    Onde salvar as imagens (padrao: subpasta 'capturas' ao lado deste arquivo).
    --intervalo SEG    Intervalo fixo em segundos entre capturas (desliga o alinhamento na hora cheia).
    --uma-vez          Captura so uma vez e encerra.
    --listar           Lista os monitores e sai.

Por padrao, captura imediatamente ao iniciar e depois sempre na hora cheia (xx:00).
Os arquivos sao salvos como: telemetria_AAAA-MM-DD_HH-MM-SS.png
"""

import argparse
import os
import sys
import time
from datetime import datetime

try:
    import mss
    import mss.tools
except ImportError:
    print("O modulo 'mss' nao esta instalado.")
    print("Instale com:  pip install mss")
    print("(ou use o arquivo iniciar_captura.bat, que instala automaticamente)")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Configuracao padrao (pode mudar aqui ou pelos argumentos da linha de comando)
# ---------------------------------------------------------------------------
PASTA_PADRAO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "capturas")
MONITOR_PADRAO = 2          # 1 = monitor principal, 2 = segundo monitor, 0 = todos juntos
INTERVALO_PADRAO = 3600     # segundos (3600 = 1 hora)


def listar_monitores():
    with mss.mss() as sct:
        print("Monitores detectados:")
        for i, m in enumerate(sct.monitors):
            if i == 0:
                rotulo = "TODOS os monitores juntos (area virtual)"
            else:
                rotulo = f"monitor {i}"
            print(f"  [{i}] {rotulo}: {m['width']}x{m['height']} "
                  f"posicao ({m['left']}, {m['top']})")
        print("\nUse o numero entre colchetes em --monitor (ex.: --monitor 2).")


def capturar(monitor, pasta):
    # Cria uma subpasta por dia: capturas/AAAA-MM-DD/
    pasta_dia = os.path.join(pasta, datetime.now().strftime("%Y-%m-%d"))
    os.makedirs(pasta_dia, exist_ok=True)
    with mss.mss() as sct:
        if monitor < 0 or monitor >= len(sct.monitors):
            raise ValueError(
                f"Monitor {monitor} nao existe. Rode com --listar para ver as opcoes."
            )
        imagem = sct.grab(sct.monitors[monitor])
        nome = datetime.now().strftime("telemetria_%Y-%m-%d_%H-%M-%S.png")
        caminho = os.path.join(pasta_dia, nome)
        mss.tools.to_png(imagem.rgb, imagem.size, output=caminho)
        return caminho


def segundos_ate_hora_cheia():
    agora = datetime.now()
    return (59 - agora.minute) * 60 + (60 - agora.second)


def main():
    parser = argparse.ArgumentParser(
        description="Captura uma tela de hora em hora e salva em uma pasta."
    )
    parser.add_argument("--monitor", type=int, default=MONITOR_PADRAO,
                        help="Qual monitor capturar (veja --listar). 0 = todos juntos.")
    parser.add_argument("--pasta", default=PASTA_PADRAO,
                        help="Pasta onde salvar as imagens.")
    parser.add_argument("--intervalo", type=int, default=None,
                        help="Intervalo fixo em segundos (desliga o alinhamento na hora cheia).")
    parser.add_argument("--uma-vez", action="store_true",
                        help="Captura uma unica vez e encerra.")
    parser.add_argument("--listar", action="store_true",
                        help="Lista os monitores e sai.")
    args = parser.parse_args()

    if args.listar:
        listar_monitores()
        return

    # Trava de instancia unica (so no modo continuo): impede duas capturas juntas.
    if not args.uma_vez:
        import socket
        try:
            global _trava_captura
            _trava_captura = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            _trava_captura.bind(("127.0.0.1", 53118))
            _trava_captura.listen(1)
        except OSError:
            print("Ja existe uma captura rodando neste PC. Encerrando esta copia.")
            return

    print("=" * 60)
    print(" Captura de tela - de hora em hora")
    print("=" * 60)
    print(f" Monitor : {args.monitor}")
    print(f" Pasta   : {args.pasta}")
    if args.intervalo:
        print(f" Intervalo: a cada {args.intervalo} s (intervalo fixo)")
    else:
        print(" Intervalo: na hora cheia (xx:00)")
    print(" Para parar: feche esta janela ou pressione Ctrl+C")
    print("=" * 60)

    # Primeira captura imediata (confirma que esta funcionando)
    try:
        caminho = capturar(args.monitor, args.pasta)
        print(f"[{datetime.now():%d/%m %H:%M:%S}] salvo: {caminho}")
    except Exception as e:
        print(f"[{datetime.now():%d/%m %H:%M:%S}] ERRO: {e}")
        if args.uma_vez:
            return

    if args.uma_vez:
        return

    # Loop continuo
    while True:
        try:
            if args.intervalo:
                time.sleep(args.intervalo)
            else:
                time.sleep(segundos_ate_hora_cheia())
            caminho = capturar(args.monitor, args.pasta)
            print(f"[{datetime.now():%d/%m %H:%M:%S}] salvo: {caminho}")
        except KeyboardInterrupt:
            print("\nEncerrado pelo usuario.")
            break
        except Exception as e:
            print(f"[{datetime.now():%d/%m %H:%M:%S}] ERRO: {e}")
            # espera 1 min e tenta de novo, para nao travar o loop
            time.sleep(60)


if __name__ == "__main__":
    main()
