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

from datetime import datetime

from app import ADMINS_JSON, TZ, iso_local, nova_credencial, salvar_json


def main():
    base = {}
    if ADMINS_JSON.exists():
        try:
            base = json.loads(ADMINS_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            print("admins.json esta corrompido. Renomeie o arquivo e rode de novo.")
            return 1

    if base:
        print("Administradores atuais: " + ", ".join(sorted(base)))

    login = input("Login do administrador (ex.: rodrigo): ").strip().lower()
    if not login:
        print("Login vazio.")
        return 1

    if login in base:
        print(f"'{login}' ja existe — a senha sera substituida.")

    senha = getpass.getpass("Senha: ")
    if len(senha) < 12:
        print("Use no minimo 12 caracteres: esta senha da acesso a todos os cadastros.")
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
