"""
Cadastra (ou troca a senha de) um cliente do portal.

    python3 criar_usuario.py

A senha é digitada sem aparecer na tela e não é gravada em lugar nenhum:
o clientes.json guarda só o salt e o hash PBKDF2.
"""

from __future__ import annotations   # permite list[str] em anotacao no Python 3.8

import getpass
import json
import secrets
import sys
from pathlib import Path

from app import CLIENTES_JSON, hash_senha, pontos_disponiveis


def pontos_validos() -> list[str]:
    """Nomes de ponto que existem no dados.js (a lógica vive no app.py)."""
    return pontos_disponiveis()


def listar_pontos() -> None:
    nomes = pontos_validos()
    if not nomes:
        print("\nNão consegui ler o dados.js — confira LOGAS_DADOS_JS.")
        return
    print(f"\nPontos disponíveis no dados.js ({len(nomes)}):")
    linha = []
    for n in nomes:
        linha.append(n)
        if len(linha) == 3:
            print("   " + "".join(x.ljust(24) for x in linha))
            linha = []
    if linha:
        print("   " + "".join(x.ljust(24) for x in linha))
    print()


def carregar() -> dict:
    if CLIENTES_JSON.exists():
        return json.loads(CLIENTES_JSON.read_text(encoding="utf-8-sig"))
    return {}


def main() -> int:
    base = carregar()

    login = input("Login (ex.: fortlev): ").strip().lower()
    if not login:
        print("Login vazio.")
        return 1

    existe = login in base
    if existe:
        print(f"Cliente '{login}' já existe — a senha será substituída.")
        reg = base[login]
    else:
        reg = {"nome": input("Nome que aparece na tela: ").strip() or login.upper()}
        listar_pontos()
        pontos = input("Pontos deste cliente, separados por vírgula: ")
        reg["pontos"] = [p.strip() for p in pontos.split(",") if p.strip()]
        faltando = [p for p in reg["pontos"] if p not in pontos_validos()]
        if faltando:
            print("\nEstes nomes não existem no dados.js: " + ", ".join(faltando))
            print("Confira acento e pontuação e rode de novo.")
            return 1
        if len(reg["pontos"]) > 1:
            resp = input("São baias da mesma instalação? (s/N): ").strip().lower()
            reg["conjunto"] = resp.startswith("s")

    senha = getpass.getpass("Senha: ")
    if len(senha) < 10:
        print("Use no mínimo 10 caracteres.")
        return 1
    if senha != getpass.getpass("Repita a senha: "):
        print("As senhas não coincidem.")
        return 1

    salt = secrets.token_hex(16)
    reg["salt"] = salt
    reg["senha_hash"] = hash_senha(senha, salt)
    base[login] = reg

    CLIENTES_JSON.write_text(
        json.dumps(base, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    Path(CLIENTES_JSON).chmod(0o600)

    print(f"\nPronto. '{login}' vê: {', '.join(reg['pontos'])}")
    print("Reinicie o serviço se ele já estava rodando com outro clientes.json.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
