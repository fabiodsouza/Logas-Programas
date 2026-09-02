"""
Confere se o portal está lendo o dados.js e mostra o que encontrou.

    python verificar.py
"""

import sys

from app import (FALTANDO, VERSAO, caminho_dados, clientes, estado_ponto,
                 config, ler_dados, pontos_disponiveis)


def main():
    print(f"portal versao {VERSAO}\n")
    if FALTANDO:
        print("ARQUIVOS FALTANDO na pasta static:")
        for nome in FALTANDO:
            print(f"  static/{nome}")
        print("Copie a pasta 'static' inteira (com a subpasta 'vendor') para junto")
        print("do app.py. Sem eles o portal sobe, mas nao mostra tela nenhuma.\n")

    arq = caminho_dados()
    print(f"dados.js: {arq}")
    if arq.is_dir():
        print("  ISSO E UMA PASTA, nao um arquivo. Em 'dados_js' do config.json o")
        print(f"  caminho tem que terminar no arquivo, por exemplo: {arq}\\dados.js")
        return 1
    if not arq.exists():
        print("  ARQUIVO NAO ENCONTRADO - ajuste 'dados_js' no config.json.")
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

    # Amostra de um ponto, para conferir de uma vez os campos que a tela usa.
    if nomes:
        e = estado_ponto(ler_dados(), config(), nomes[0], 24)
        ant = e.get("anterior")
        uv = e.get("ultima_variacao")
        print(f"\nAmostra do ponto {nomes[0]}:")
        print(f"  pressao atual .......... {e.get('pressao')} Bar em {e.get('medido_em')}")
        print(f"  leitura anterior ....... "
              + (f"{ant['p']} Bar em {ant['t']}" if ant else "NAO CALCULADA"))
        print(f"  variacao entre as duas . "
              + (f"{uv['bar']} Bar em {uv['horas']} h" if uv else "NAO CALCULADA"))
        print(f"  consumo medio .......... {e.get('consumo_barh')} Bar/h")
        print(f"  autonomia .............. {e.get('horas_ate_limite')} h")
        print(f"  trocas em 7 dias ....... {(e.get('trocas') or {}).get('em_7_dias')}")

    return 0 if (nomes and not FALTANDO) else 1


if __name__ == "__main__":
    sys.exit(main())
