"""
Cria (ou troca a senha de) um administrador do painel.

    python criar_admin.py

O administrador entra em /admin e de lá cadastra os clientes, gera senhas,
suspende e remove acessos. Este script existe só para criar o primeiro acesso,
ou para recuperar o acesso se a senha for perdida.
"""

from __future__ import annotations

import getpass
import json
import sys
import unicodedata

from datetime import datetime

from app import (ADMINS_JSON, LOGIN_VALIDO, TZ, iso_local, nova_credencial,
                 salvar_json)


def main():
    base = {}
    if ADMINS_JSON.exists():
        try:
            base = json.loads(ADMINS_JSON.read_text(encoding="utf-8-sig"))
        except json.JSONDecodeError:
            print("admins.json esta corrompido. Renomeie o arquivo e rode de novo.")
            return 1

    if base:
        print("Administradores atuais: " + ", ".join(sorted(base)))

    print("\nO login e usado para entrar no painel: so letras minusculas sem acento,")
    print("numeros, ponto, hifen ou sublinhado. A senha precisa de 12 caracteres ou mais.")

    login = input("\nLogin do administrador (ex.: fabio): ").strip().lower()
    if not login:
        print("Login vazio.")
        return 1
    if not LOGIN_VALIDO.match(login):
        sugestao = unicodedata.normalize("NFKD", login).encode("ascii", "ignore").decode()
        sugestao = "".join(c for c in sugestao if c.isalnum() or c in "._-")
        print(f"Login invalido: '{login}'.")
        if sugestao and LOGIN_VALIDO.match(sugestao):
            print(f"Tente assim, sem acento e sem espaco: {sugestao}")
        else:
            print("Use de 3 a 32 caracteres: letras minusculas sem acento, numeros, . - _")
        return 1

    if login in base:
        print(f"'{login}' ja existe — a senha sera substituida.")

    senha = getpass.getpass("Senha (12 caracteres ou mais, nao aparece na tela): ")
    if len(senha) < 12:
        print(f"A senha tem {len(senha)} caracteres. Use 12 ou mais: ela da acesso a "
              "todos os cadastros.")
        return 1
    if senha != getpass.getpass("Repita a senha: "):
        print("As senhas nao coincidem.")
        return 1

    reg = dict(base.get(login, {}))
    reg.update(nova_credencial(senha))
    reg["nome"] = reg.get("nome") or login
    reg["senha_trocada_em"] = iso_local(datetime.now(TZ))
    base[login] = reg
    salvar_json(ADMINS_JSON, base)

    print(f"\nPronto. Entre em /admin com o login '{login}'.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
