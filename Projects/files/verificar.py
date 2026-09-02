"""
Confere se o portal está lendo o dados.js e mostra o que encontrou.

    python verificar.py
"""

import sys

from app import FALTANDO, caminho_dados, clientes, ler_dados


def main():
    if FALTANDO:
        print("ARQUIVOS FALTANDO na pasta static:")
        for nome in FALTANDO:
            print(f"  static/{nome}")
        print("Copie a pasta 'static' inteira (com a subpasta 'vendor') para junto")
        print("do app.py. Sem eles o portal sobe, mas nao mostra tela nenhuma.\n")

    arq = caminho_dados()
    print(f"dados.js: {arq}")
    if not arq.exists():
        print("  ARQUIVO NAO ENCONTRADO — ajuste 'dados_js' no config.json.")
        return 1

    d = ler_dados()
    nomes = [k for k in d.get("leituras", {}) if not k.startswith("?@")]
    ilegiveis = len(d.get("leituras", {})) - len(nomes)
    print(f"  {len(nomes)} pontos legiveis, {ilegiveis} sem nome identificado pelo OCR")
    print(f"  ultima leitura registrada: {d.get('atualizado')}")

    cli = clientes()
    if cli:
        print(f"\n{len(cli)} cliente(s) cadastrado(s):")
        for login, reg in cli.items():
            faltando = [p for p in reg.get("pontos", []) if p not in nomes]
            aviso = f"   <-- nao existe(m) no dados.js: {', '.join(faltando)}" if faltando else ""
            print(f"  {login}: {', '.join(reg.get('pontos', []))}{aviso}")
    else:
        print("\nNenhum cliente cadastrado ainda.")

    return 0 if (nomes and not FALTANDO) else 1


if __name__ == "__main__":
    sys.exit(main())
