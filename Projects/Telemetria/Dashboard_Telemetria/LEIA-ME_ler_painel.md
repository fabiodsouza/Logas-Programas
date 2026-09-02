# ler_painel.py — leitor do painel para o dados.js

Lê um **print do painel** "Centro de Operações Logística" e grava as leituras
(pressão em Bar ou status) no **dados.js**, no mesmo formato que o painel já usa.

## Como funciona
1. Detecta cada manômetro (a cápsula cinza) na imagem — uma cápsula = uma empresa.
2. Lê o **nome** logo acima e o **valor/status** logo abaixo de cada cápsula.
3. Lê a **data/hora** no canto superior esquerdo.
4. Descobre a **região** pelos cabeçalhos em ciano (BETIM, IPATINGA, ...).
5. Acrescenta a leitura de cada empresa no `dados.js` (campo `atualizado`,
   `_processados` e a lista de `{t, p, obs}` por empresa).

## Uso
```
python ler_painel.py foto.png            # processa uma imagem e grava no dados.js
python ler_painel.py C:\pasta\fotos\     # processa todas as imagens da pasta, em ordem
python ler_painel.py foto.png --dry-run  # só mostra o que leu (NÃO grava)
python ler_painel.py foto.png --csv leituras.csv   # também exporta um CSV
```

## Instalação (uma vez)
- **Tesseract OCR**: https://github.com/UB-Mannheim/tesseract/wiki (Windows)
- Pacotes Python: `pip install opencv-python numpy pytesseract`

## Observações importantes
- Antes de gravar, o programa salva um backup `dados.js.bak`.
- Toda leitura duvidosa é marcada com `obs:"conferir"` (em vez de gravar um número
  possivelmente errado). Procure por `conferir` no dados.js para revisar.
- Cada print mostra, por empresa, a confiança do valor e do nome. Confira os de
  confiança baixa.
- "BAIA 1/2" existem em EXTREMA-MG e em LAGARTO-SE; as de Lagarto são gravadas como
  `BAIA 1 (LAGARTO)` / `BAIA 2 (LAGARTO)` para não colidir.
- O OCR não é perfeito (ex.: um "5" pode virar "3"). Para máxima precisão, capture
  o print na maior resolução possível.
