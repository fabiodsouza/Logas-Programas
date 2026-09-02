#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
limpar_dados.py - Conserta o dados.js depois de erros de OCR:
  1) NULIFICA leituras acima de MAX_BAR (impossiveis; o manometro vai ate ~250 Bar).
  2) RECUPERA leituras boas que foram barradas como "conferir" so porque a base de
     comparacao era um valor-lixo (ex.: queda de 987 -> 107). Restaura o valor lido.
Faz backup antes (dados.js.bak_limpeza).

Uso (na pasta do dados.js):  py limpar_dados.py
"""
import re, os, shutil

MAX_BAR = 260

def main():
    f = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dados.js")
    if not os.path.exists(f):
        print("dados.js nao encontrado nesta pasta."); return
    txt = open(f, encoding="utf-8").read()
    if "window.LOGAS_DADOS" not in txt:
        print("dados.js nao parece valido. Abortando."); return
    shutil.copy2(f, f + ".bak_limpeza")

    nul = [0]   # quantos valores impossiveis nulificados
    rec = [0]   # quantas leituras boas recuperadas

    def fix(m):
        t, p, obs = m.group(1), m.group(2).strip(), m.group(3)
        # 1) valor numerico acima do maximo -> impossivel
        if p != "null":
            try:
                v = float(p)
            except Exception:
                v = None
            if v is not None and v > MAX_BAR:
                nul[0] += 1
                return '{t:"%s", p:null, obs:"conferir (acima de %d Bar; leu %g)"}' % (t, MAX_BAR, v)
        # 2) leitu