# Rodar o leitor sozinho na máquina das fotos (sem o Claude)

O `ler_painel.py` é independente. A máquina onde ficam os prints precisa só de
Python + Tesseract. O Claude **não** precisa estar aberto nela.

## 1. Instalar uma vez
1. **Python 3** — https://www.python.org/downloads/ (marque "Add Python to PATH" na instalação).
2. **Tesseract OCR** — https://github.com/UB-Mannheim/tesseract/wiki
   (instale em `C:\Program Files\Tesseract-OCR` — o script já procura aí sozinho).
3. **Pacotes Python** — abra o Prompt de Comando e rode:
   ```
   pip install opencv-python numpy pytesseract
   ```

## 2. Colocar os arquivos na mesma pasta dos prints
Na máquina das fotos, deixe na MESMA pasta:
- `ler_painel.py`
- `dados.js` (o atual, para continuar o histórico)
- `rodar_telemetria.bat`
- os prints `telemetria_AAAA-MM-DD_HH-MM-SS.png`

## 3. Testar manualmente
Dê dois cliques no `rodar_telemetria.bat` (ou rode `python ler_painel.py .`).
Ele processa só os prints novos, atualiza o `dados.js` (com backup `dados.js.bak`)
e escreve um `log_telemetria.txt`. Confira o log.

## 4. Deixar automático de hora em hora (Agendador de Tarefas do Windows)
1. Abra **Agendador de Tarefas** (Task Scheduler).
2. **Criar Tarefa Básica** → nome: "Leitor Painel Telemetria".
3. Disparador: **Diariamente**, repetir **a cada 1 hora** (em "Configurações avançadas"
   do disparador, marque "Repetir a cada: 1 hora" por "1 dia").
4. Ação: **Iniciar um programa** → Programa: o caminho do `rodar_telemetria.bat`.
   (Em "Iniciar em", coloque a pasta onde está o .bat.)
5. Conclua. Pode marcar "Executar estando o usuário conectado ou não".

Pronto: a cada hora ele lê os prints novos e atualiza o `dados.js`, sem precisar do Claude.

## Observações
- Cada print leva ~30s para ser lido.
- Leituras de baixa confiança ficam marcadas com `obs:"conferir"` no `dados.js` — vale revisar.
- O horário de cada leitura vem do NOME do arquivo (`telemetria_AAAA-MM-DD_HH-MM-SS.png`),
  então mantenha esse padrão de nome.
- Se aparecer empresa nova no painel, me avise para incluir no cadastro (ROSTER) do script.
