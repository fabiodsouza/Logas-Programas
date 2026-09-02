# Portal do Cliente — Logás

Cada cliente externo entra com login e senha e vê **apenas os pontos dele**:
pressão atual, consumo médio, autonomia até a reserva, previsão de
reabastecimento, gráfico do histórico e download em Excel.

A Torre de Controle continua exatamente como está. Este portal é um segundo
serviço que lê o mesmo `dados.js` e recorta os dados **no servidor**, antes de
enviar qualquer coisa ao navegador do cliente.

## O que o cliente nunca recebe

Frota, motoristas, plano de despacho, tempos de viagem, nomes e consumo de
outros clientes, chave da TomTom. Nada disso chega ao navegador dele: a resposta
de `/api/consumo` contém só os pontos vinculados ao login autenticado.

## Arquivos

| Arquivo | Para que serve |
|---|---|
| `instalar.ps1` | Instalação no Windows: Python, dependências, caminho do dados.js |
| `admin.ps1` | Cria o primeiro administrador do painel |
| `cadastrar.ps1` | Cadastro de cliente pela linha de comando (alternativa ao painel) |
| `iniciar.ps1` | Sobe o portal |
| `verificar.py` | Mostra o que o portal está lendo e avisa cadastro com ponto inexistente |
| `app.py` | Serviço: login, sessão, filtro por cliente, cálculos, Excel |
| `criar_usuario.py` | Cadastro (chamado pelo `cadastrar.ps1`) |
| `config.json` | Caminho do dados.js, reserva mínima, tempo de viagem, buffer |
| `clientes.json` | Quem entra e quais pontos vê (criado no cadastro) |
| `admins.json` | Quem administra o painel (criado pelo `admin.ps1`) |
| `admin.log` | Histórico do que foi feito no painel administrativo |
| `secret.txt` | Chave que assina as sessões (criada sozinha; não apague, não compartilhe) |
| `static/` | Telas de login e do painel, mais o Chart.js local |

## Instalar (Windows)

Copie a pasta para o servidor, por exemplo `C:\portal-logas`, **inteira,
incluindo a subpasta `static` e a `static\vendor` dentro dela**. Sem elas o
portal sobe mas não mostra tela nenhuma; o `verificar.py` avisa se faltar algo. Abra o PowerShell
nessa pasta e rode, na ordem:

```powershell
cd C:\portal-logas
powershell -ExecutionPolicy Bypass -File .\instalar.ps1
powershell -ExecutionPolicy Bypass -File .\admin.ps1
powershell -ExecutionPolicy Bypass -File .\iniciar.ps1 -Local
```

O `admin.ps1` cria o seu acesso administrativo. Daí em diante, todo o cadastro
de clientes acontece pela tela, em `/admin` — não precisa mexer em arquivo nem
voltar ao PowerShell.

O `-ExecutionPolicy Bypass` é necessário porque o Windows bloqueia script `.ps1`
baixado por padrão. Não precisa de administrador para nada disso.

Com `-Local`, o portal aceita HTTP e você pode conferir tudo em
`http://localhost:8100`. **Esse modo é só para teste** — nele o cookie de sessão
não exige HTTPS. Para cliente de verdade, use `.\iniciar.ps1` sem `-Local`,
atrás do túnel ou proxy da seção seguinte.

### Versão do Python

O portal roda a partir do **Python 3.8**, que é o que já está no seu servidor.
O `instalar.ps1` detecta as versões instaladas e usa a mais nova.

Ainda assim, vale instalar o **Python 3.12** ao lado: o 3.8 saiu de suporte em
outubro de 2024 e não recebe mais correção de segurança, o que pesa num serviço
exposto para fora. Instalar não quebra nada — o 3.8 continua onde está, o
`ler_painel.py` e o `viagem_tomtom.py` seguem rodando nele, e o portal usa
ambiente próprio dentro da pasta `.venv`. Se o Windows do servidor for antigo
demais para o 3.12 (Windows 7 ou Server 2012, por exemplo), fique no 3.8: o
código foi escrito para funcionar nele, sem sintaxe que só existe em versão
mais nova, e o `uvicorn` é instalado sem os extras que exigem compilação.

Se o Python não aparecer, baixe de python.org/downloads/windows marcando
**Add python.exe to PATH**, feche o PowerShell, abra de novo e rode outra vez.

Sobre erros de PowerShell: `sudo` e `&&` não existem lá. Se precisar rodar algo
como administrador, abra o PowerShell com o botão direito → "Executar como
administrador"; para encadear comandos, use `;` em vez de `&&`.

### Cadastrar os clientes

O `cadastrar.ps1` pede login, nome de exibição e os pontos. Ele **lista os nomes
que existem no `dados.js`** e recusa nome que não está lá, então não tem como
errar acento ou pontuação. No arquivo que você me passou há 30 pontos legíveis,
incluindo três que não estão no `REGISTRO` do painel: `SERGÁS`,
`COMPRESSOR BETIM` e `SEARA` (esta ainda como "Em Implantação").

Leituras cuja empresa o OCR não identificou entram no `dados.js` com chave tipo
`?@186,462` — eram 25 no seu arquivo. O cadastro ignora essas chaves, porque não
dá para vinculá-las a ninguém com segurança.

Quando o cliente tem várias baias na mesma instalação (Extrema-MG, Lagarto-SE),
responda `s` em "baias da mesma instalação". Aí o status e a autonomia vêm da
baia que está suprindo, como na Torre de Controle, e a tela avisa qual baia está
em uso e qual já esgotou.

A senha é digitada sem aparecer na tela e não fica gravada: o `clientes.json`
guarda apenas o salt e o hash PBKDF2. Depois do cadastro, o script restringe as
permissões do arquivo ao seu usuário.

## Painel administrativo

Com o portal rodando, abra `/admin` (por exemplo `http://localhost:8100/admin`).
Login e senha são os que você criou no `admin.ps1`, e são separados dos acessos
de cliente: cookie próprio, e sessão de cliente não abre o painel.

O que dá para fazer por lá:

- **Novo cliente**: login, nome que ele vê na tela e quais pontos ele acessa,
  marcados numa lista que vem direto do `dados.js`. A lista mostra quando um
  ponto já pertence a outro cliente, para você não duplicar sem querer.
- **Senha**: gerada pelo sistema em quatro blocos, tipo `k7mq-2xrt-9fbe-h3nv`,
  fácil de ditar por telefone. Ela aparece uma única vez, na hora de salvar, com
  botão para copiar login e senha juntos. Depois disso só existe o hash: se
  perder, gere outra pelo botão "Nova senha", e a anterior deixa de valer.
- **Suspender e reativar**: corta o acesso na hora, inclusive a sessão que o
  cliente já tinha aberta, sem apagar o cadastro. Serve para inadimplência ou
  contrato em revisão.
- **Remover**: apaga o cadastro de vez.
- **Pontos sem cliente vinculado**: mostra quais pontos legíveis do `dados.js`
  ainda não estão com ninguém.
- **Histórico**: registra quem fez o quê e quando, incluindo tentativa de login
  administrativo que falhou.

O cadastro por linha de comando (`cadastrar.ps1`) continua funcionando, como
saída de emergência se o painel estiver fora do ar.

Se perder a senha do administrador, rode `.\admin.ps1` no servidor com o mesmo
login: ele substitui a senha.

## Publicar para fora

O portal escuta só em `127.0.0.1`, então nada dele sai do servidor por conta
própria. Ele precisa de HTTPS: senha em HTTP trafega legível.

**Cloudflare Tunnel** é o caminho mais simples no Windows e não abre porta
nenhuma no firewall da Logás — o túnel sai de dentro para fora e o certificado
é automático. Baixe o `cloudflared.exe`, e com o portal rodando:

```powershell
.\cloudflared.exe tunnel login
.\cloudflared.exe tunnel create portal-logas
.\cloudflared.exe tunnel route dns portal-logas consumo.logas.com.br
.\cloudflared.exe tunnel run --url http://127.0.0.1:8100 portal-logas
```

Depois `cloudflared service install` deixa o túnel subindo junto com o Windows.

Se a Logás já publica algo por IIS, dá para usar o IIS como proxy reverso
(módulos URL Rewrite + Application Request Routing) apontando para
`http://127.0.0.1:8100`. Nesse caso mantenha o cabeçalho `X-Forwarded-For`: é o
que separa um cliente do outro no limite de tentativas de login (8 erros em 10
minutos bloqueiam aquele login naquele IP).

Não publique a Torre de Controle nesse mesmo endereço.

O `/admin` fica no mesmo endereço público do portal, protegido pelo login
administrativo. Se preferir que ele só responda de dentro da rede, publique pelo
túnel apenas o portal e acesse o painel por `http://localhost:8100/admin` no
próprio servidor.

## Deixar rodando sozinho

Duas formas, em ordem de preferência:

**NSSM** (recomendado, reinicia sozinho se cair). Baixe o nssm.exe e, num
PowerShell como administrador:

```powershell
.\nssm.exe install PortalLogas "C:\portal-logas\.venv\Scripts\python.exe" "-m uvicorn app:app --host 127.0.0.1 --port 8100"
.\nssm.exe set PortalLogas AppDirectory C:\portal-logas
.\nssm.exe set PortalLogas Start SERVICE_AUTO_START
.\nssm.exe start PortalLogas
```

**Agendador de Tarefas**, se preferir não instalar nada: crie uma tarefa que
dispara "Ao iniciar o computador", executa
`C:\portal-logas\.venv\Scripts\python.exe` com argumentos
`-m uvicorn app:app --host 127.0.0.1 --port 8100`, começando em
`C:\portal-logas`, marcando "Executar estando o usuário conectado ou não".

A chave que assina as sessões fica no `secret.txt`, criado na primeira execução,
então reiniciar o serviço não derruba quem está logado.

## Fuso, CDN e leitura do dados.js

Três decisões que valem saber, porque foram problemas que apareceram no teste:

- O `dados.js` é objeto literal JavaScript, com as chaves sem aspas (`t:`, `p:`,
  `obs:`), então `json.loads` não serve. O `app.py` normaliza o arquivo antes de
  interpretar (aspas nas chaves, comentários, vírgula sobrando), leva 0,3 s no
  seu arquivo de 1 MB e guarda em cache até o `mtime` mudar. Se o `ler_painel.py`
  estiver escrevendo o arquivo naquele instante, o portal mantém a última versão
  boa em vez de mostrar tela vazia.
- Os horários saem da API sem fuso, no relógio de Brasília. Assim o cliente vê
  exatamente a hora em que a foto foi registrada, mesmo que o celular dele
  esteja configurado em outro fuso.
- Nada vem de CDN. O Chart.js está em `static/vendor/` e o Excel é gerado no
  servidor com openpyxl. Se a rede do cliente bloquear CDN, ou se o servidor
  ficar sem internet, o portal continua funcionando inteiro.

## Antes de dar o primeiro acesso

Duas coisas do painel atual merecem atenção, porque hoje qualquer pessoa que
abra o HTML enxerga o arquivo inteiro:

1. A chave da TomTom (`ROTA_KEY`) está fixa no HTML. Restrinja ela por domínio
   no painel da TomTom, ou troque por uma chave nova só para uso interno.
2. Ajustes feitos pela engrenagem (limite por empresa, buffer, consumo padrão),
   leituras manuais e correções de OCR ficam no `localStorage` de cada
   navegador. O servidor não tem como ler isso. Então:
   - espelhe os limites diferentes de 30 Bar em `config.json` → `min`;
   - se as correções de leitura forem frequentes, vale movê-las para o
     `ler_painel.py`, gravando no próprio `dados.js`. Enquanto isso não
     acontecer, o cliente vê o valor bruto lido da foto.

Rode `.\.venv\Scripts\python.exe verificar.py` sempre que mexer no cadastro: ele
mostra quantos pontos o portal está lendo e avisa se algum cliente ficou
apontando para um nome que não existe no `dados.js`.

## O que o cliente vê na prática

- **Pressão atual** em Bar. Se o ponto está sem sinal, o portal projeta a queda
  pelo consumo médio e diz claramente que é projeção, com a data da última foto.
- **Consumo médio** em Bar/h, média das últimas quatro quedas reais. Subida
  entre fotos é troca de carreta e não entra na conta. Queda acima de 100 Bar/h
  e valor acima de 260 Bar são descartados como erro de leitura, igual ao painel.
- **Autonomia** até a reserva mínima do ponto (30 Bar, salvo ajuste no `config.json`).
- **Reabastecimento previsto**, só para pontos com tempo de viagem em
  `config.json` → `viagem_h`. Sem isso, o campo simplesmente não aparece.
- **Situação**: Normal acima de 12 h, Atenção entre 2 h e 12 h, Crítico abaixo de
  2 h, Abaixo da reserva quando já passou do limite.
- **Excel** com três abas — Resumo, Leituras e Informações — do período escolhido
  na tela, em Arial, com filtro e cabeçalho fixo.

O painel se atualiza sozinho a cada 5 minutos e a sessão cai em 12 horas.

## Trocar senha ou remover acesso

Tudo pela tela, em `/admin`: botão "Nova senha" para trocar, "Suspender" para
cortar temporariamente, "Remover" para apagar. Nenhuma dessas ações exige
reiniciar o serviço — o `clientes.json` é regravado inteiro de uma vez, então
nunca fica pela metade.

## Apêndice: se um dia migrar para Linux

O mesmo código roda sem alteração:

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
python3 verificar.py
uvicorn app:app --host 127.0.0.1 --port 8100
```

Serviço com systemd (`/etc/systemd/system/portal-logas.service`):

```ini
[Unit]
Description=Portal do Cliente Logas
After=network.target

[Service]
User=www-data
WorkingDirectory=/opt/portal-logas
ExecStart=/opt/portal-logas/.venv/bin/uvicorn app:app --host 127.0.0.1 --port 8100
Restart=always

[Install]
WantedBy=multi-user.target
```

E nginx como proxy:

```nginx
server {
    listen 443 ssl;
    server_name consumo.logas.com.br;
    ssl_certificate     /etc/letsencrypt/live/consumo.logas.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/consumo.logas.com.br/privkey.pem;
    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server { listen 80; server_name consumo.logas.com.br; return 301 https://$host$request_uri; }
```
