/*
 * Envio da telemetria no WhatsApp - de hora em hora, sem repetir.
 *
 * O que faz:
 *   - Conecta no WhatsApp por QR Code (igual ao WhatsApp Web). A sessao fica salva.
 *   - A cada hora pega a imagem MAIS RECENTE da pasta de capturas.
 *   - Se a imagem for igual a ultima enviada, NAO reenvia.
 *   - Envia para UM OU VARIOS destinos (numeros, grupos, voce mesmo).
 *
 * Ver os grupos deste WhatsApp (para pegar o nome exato):
 *   iniciar_envio_whatsapp.bat grupos
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const net = require('net');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ---- LOG EM ARQUIVO ----
// Grava tudo que aparece na tela tambem em "log_envio.txt", para que o
// processo OCULTO (segundo plano) deixe rastro do que esta acontecendo.
const arquivoLog = path.join(__dirname, 'log_envio.txt');
function _carimbo() {
  try { return new Date().toLocaleString('pt-BR'); } catch (e) { return ''; }
}
function _gravar(linha) {
  // Se a linha ja comeca com data entre colchetes, nao duplica o carimbo.
  const prefixo = /^\[/.test(linha) ? '' : '[' + _carimbo() + '] ';
  try { fs.appendFileSync(arquivoLog, prefixo + linha + '\r\n'); } catch (e) { /* ignora */ }
}
const _logOriginal = console.log;
console.log = function (...args) {
  const linha = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  _gravar(linha);
  _logOriginal.apply(console, args);
};
// Captura tambem ERROS (console.error) e quedas inesperadas, para que o
// processo OCULTO registre a CAUSA quando o WhatsApp nao conecta.
const _errOriginal = console.error;
console.error = function (...args) {
  const linha = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
  _gravar('ERRO: ' + linha);
  _errOriginal.apply(console, args);
};
process.on('uncaughtException', (e) => {
  _gravar('CRASH (uncaughtException): ' + (e && e.stack ? e.stack : e));
  if (ehErroDeSessao(e)) reiniciarPorSessaoMorta('uncaughtException');
});
process.on('unhandledRejection', (e) => {
  _gravar('CRASH (unhandledRejection): ' + (e && e.stack ? e.stack : e));
  if (ehErroDeSessao(e)) reiniciarPorSessaoMorta('unhandledRejection');
});

// ---- SESSAO MORTA DO NAVEGADOR ----
// "Attempted to use detached Frame", "Execution context was destroyed" etc.
// significam que a pagina do WhatsApp recarregou (ou o Chrome caiu) e o script
// ficou segurando referencias mortas. Dai em diante TODA chamada falha ate
// reiniciar. Entao, ao detectar isso, encerramos na hora para o vigia do
// segundo plano reabrir limpo - em vez de ficar horas errando em silencio.
function ehErroDeSessao(e) {
  const t = String(e && e.message ? e.message : e);
  return /detached Frame|Execution context was destroyed|Session closed|Target closed|Protocol error|page has been closed|browser has disconnected/i.test(t);
}
let _reiniciando = false;
function reiniciarPorSessaoMorta(origem) {
  if (_reiniciando) return;
  _reiniciando = true;
  console.log(`[${agora()}] Sessao do navegador morreu (${origem}) - encerrando para reabrir limpo.`);
  try { client.destroy().catch(() => { /* ignora */ }); } catch (e) { /* ignora */ }
  setTimeout(() => process.exit(1), 3000);
}

// ---- TRAVA DE INSTANCIA UNICA ----
// Garante que so UM envio rode por vez (evita fotos duplicadas).
// Se ja houver um rodando, esta copia se encerra na hora.
const PORTA_TRAVA = 53117;
const _trava = net.createServer();
_trava.once('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log('Ja existe um envio rodando neste PC. Encerrando esta copia.');
    process.exit(0);
  }
});
_trava.listen(PORTA_TRAVA, '127.0.0.1');

// ============================ CONFIG ============================
const CONFIG = {
  // Pasta de capturas COMPARTILHADA na maquina Windows 8 (lida pela rede).
  // Se o nome nao resolver, troque por IP, ex.: '\\\\192.168.0.50\\capturas'.
  pastaCapturas: '\\\\Windows\\capturas',

  // LISTA DE DESTINOS - pode colocar quantos quiser. Tipos disponiveis:
  //   { tipo: 'numero', valor: '5531999998888' }       -> codigo do pais (55) + DDD + numero, so digitos
  //   { tipo: 'grupo',  nome: 'Nome Exato do Grupo' }   -> o WhatsApp conectado precisa participar do grupo
  //   { tipo: 'grupo',  nome: 'Apelido', id: '1203...@g.us' } -> por ID (MAIS CONFIAVEL;
  //       rode "iniciar_envio_whatsapp.bat grupos" para descobrir o ID)
  //   { tipo: 'eu' }                                    -> sua propria conversa
  destinos: [
    { tipo: 'numero', valor: '5531984432363'},
    // { tipo: 'numero', valor: '5531987871614'},
   { tipo: 'grupo', nome: 'TORRE DE CONTROLE INTERNO', id: '553187871614-1537443022@g.us' },
    // { tipo: 'numero', valor: '5531988887777' },
  ],

  // Minuto da hora em que envia (ex.: 2 = xx:02, logo apos a captura de xx:00).
  minutoEnvio: 1,

  // Enviar a imagem mais recente assim que conectar (bom para testar).
  enviarAoIniciar: true,

  // Avisa (na Area de Trabalho e no WhatsApp) se passar este numero de horas
  // SEM enviar nenhum print novo - ajuda a perceber rapido se algo travou.
  horasAvisoInatividade: 2,
};
// ===============================================================

const arquivoEstado = path.join(__dirname, 'estado_envio.json');
// Batimento de saude do processo (lido pelo vigia para detectar travamento vivo).
const arquivoHeartbeat = path.join(__dirname, 'heartbeat.txt');
function escreverHeartbeat() {
  try { fs.writeFileSync(arquivoHeartbeat, agora()); } catch (e) { /* ignora */ }
}
// Se rodar passando a palavra "grupos" (ex.: iniciar_envio_whatsapp.bat grupos),
// ele apenas lista os grupos e sai - util para descobrir o nome exato.
const MODO_LISTAR_GRUPOS = process.argv.slice(2).some(a => /grupo/i.test(a));

function lerEstado() {
  try { return JSON.parse(fs.readFileSync(arquivoEstado, 'utf8')); }
  catch (e) { return { ultimoHash: null, ultimoArquivo: null }; }
}

function salvarEstado(estado) {
  fs.writeFileSync(arquivoEstado, JSON.stringify(estado, null, 2));
}

function listarPngs(dir) {
  let resultado = [];
  if (!fs.existsSync(dir)) return resultado;
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      resultado = resultado.concat(listarPngs(p)); // entra nas subpastas (por dia)
    } else if (nome.toLowerCase().endsWith('.png')) {
      resultado.push({ caminho: p, mtime: st.mtimeMs });
    }
  }
  return resultado;
}

function imagemMaisRecente() {
  const pngs = listarPngs(CONFIG.pastaCapturas);
  if (pngs.length === 0) return null;
  pngs.sort((a, b) => b.mtime - a.mtime);
  return pngs[0].caminho;
}

function md5(caminho) {
  return crypto.createHash('md5').update(fs.readFileSync(caminho)).digest('hex');
}

function agora() {
  return new Date().toLocaleString('pt-BR');
}

// ---- AVISO DE INATIVIDADE ----
// Se passar muito tempo sem nenhum envio novo, grava um aviso na Area de
// Trabalho (e na pasta, lido pelo verificar_status.bat) e tenta avisar no
// WhatsApp. Quando voltar a enviar, o aviso e apagado sozinho.
const arquivoUltimoOk = path.join(__dirname, 'ultimo_envio_ok.txt');
const arquivoAtencaoLocal = path.join(__dirname, 'ATENCAO_ENVIO_WHATSAPP.txt');
const desktopDir = path.join(process.env.USERPROFILE || __dirname, 'Desktop');
const arquivoAtencaoDesktop = path.join(desktopDir, 'ATENCAO_ENVIO_WHATSAPP.txt');
let ultimoAlertaWppMs = 0;

function lerUltimoOk() {
  try { return parseInt(fs.readFileSync(arquivoUltimoOk, 'utf8'), 10) || Date.now(); }
  catch (e) { return Date.now(); } // sem registro ainda: nao alarma
}
function limparAtencao() {
  for (const f of [arquivoAtencaoLocal, arquivoAtencaoDesktop]) {
    try { fs.rmSync(f, { force: true }); } catch (e) { /* ignora */ }
  }
}
function registrarEnvioOk() {
  try { fs.writeFileSync(arquivoUltimoOk, String(Date.now())); } catch (e) { /* ignora */ }
  limparAtencao(); // acabou de enviar com sucesso: nao ha mais alerta pendente
}
function escreverAtencao(texto) {
  for (const f of [arquivoAtencaoLocal, arquivoAtencaoDesktop]) {
    try { fs.writeFileSync(f, texto + '\r\n'); } catch (e) { /* ignora */ }
  }
}
async function verificarInatividade(client, conectado) {
  const limiteMs = (CONFIG.horasAvisoInatividade || 2) * 60 * 60 * 1000;
  const idadeMs = Date.now() - lerUltimoOk();
  if (idadeMs <= limiteMs) { limparAtencao(); return; } // tudo certo
  const horas = (idadeMs / 3600000).toFixed(1);
  const aviso =
    'ATENCAO: o envio da telemetria esta ha ' + horas + 'h sem mandar print novo.\r\n' +
    'Verifique:\r\n' +
    '  1) a captura de tela (a pasta ' + CONFIG.pastaCapturas + ' esta recebendo PNG novo?);\r\n' +
    '  2) se o WhatsApp continua conectado (pode ter deslogado e precisar de QR Code).\r\n' +
    'Registrado em ' + agora() + '.';
  escreverAtencao(aviso);
  console.log('[' + agora() + '] AVISO de inatividade gravado (' + horas + 'h sem envio).');
  // Tenta avisar no WhatsApp, no maximo 1 vez por periodo, se estiver conectado.
  if (conectado && client && destinosResolvidos.length > 0 &&
      (Date.now() - ultimoAlertaWppMs) > limiteMs) {
    ultimoAlertaWppMs = Date.now();
    const msg = 'ATENCAO (automatico): a telemetria esta ha ' + horas +
                'h sem enviar print novo. Verifique a captura e a conexao do WhatsApp.';
    for (const d of destinosResolvidos) {
      try { await client.sendMessage(d.chatId, msg); }
      catch (e) { /* se nao conseguir, o aviso na Area de Trabalho ja foi gravado */ }
    }
  }
}

let destinosResolvidos = []; // [{ rotulo, chatId }]

async function resolverUm(client, d) {
  if (d.tipo === 'eu') {
    return { rotulo: 'voce mesmo', chatId: client.info.wid._serialized };
  }
  if (d.tipo === 'numero') {
    const limpo = String(d.valor).replace(/\D/g, '');
    const numeroId = await client.getNumberId(limpo);
    if (!numeroId) {
      throw new Error(`numero ${d.valor} nao encontrado no WhatsApp ` +
        `(precisa ter codigo do pais 55 + DDD + numero)`);
    }
    return { rotulo: 'numero ' + d.valor, chatId: numeroId._serialized };
  }
  if (d.tipo === 'grupo') {
    // Se tiver o ID fixo (formato '12036...@g.us'), usa direto: nao depende da
    // lista de conversas carregada nem de alguem renomear o grupo.
    // (Rode "iniciar_envio_whatsapp.bat grupos" para ver os IDs.)
    if (d.id) {
      return { rotulo: 'grupo ' + (d.nome || d.id), chatId: d.id };
    }
    // Buscar pelo NOME exige a lista de conversas, que demora a carregar apos
    // conectar (era a causa do erro minificado "r"). Tenta varias vezes.
    const tentativas = d._tentativas || 6;
    let ultimoErro = null;
    for (let t = 1; t <= tentativas; t++) {
      try {
        const chats = await client.getChats();
        const g = chats.find(c => c.isGroup && c.name === d.nome);
        if (g) return { rotulo: 'grupo ' + d.nome, chatId: g.id._serialized };
        ultimoErro = new Error(`grupo "${d.nome}" nao encontrado ` +
          `(confira o nome exato e se este WhatsApp participa do grupo)`);
      } catch (e) {
        if (ehErroDeSessao(e)) throw e; // sessao morta: nao adianta insistir
        ultimoErro = e;
      }
      if (t < tentativas) {
        console.log(`[${agora()}] Grupo "${d.nome}" ainda nao disponivel (tentativa ${t}/${tentativas}) - aguardando 10s...`);
        await new Promise(r => setTimeout(r, 10000));
      }
    }
    throw ultimoErro;
  }
  throw new Error('tipo de destino desconhecido: ' + JSON.stringify(d));
}

let destinosPendentes = []; // destinos que falharam ao resolver (re-tenta antes de cada envio)

async function resolverDestinos(client) {
  const resultado = [];
  destinosPendentes = [];
  for (const d of CONFIG.destinos) {
    try {
      const r = await resolverUm(client, d);
      console.log(`[${agora()}] Destino OK: ${r.rotulo}`);
      resultado.push(r);
    } catch (e) {
      if (ehErroDeSessao(e)) { reiniciarPorSessaoMorta('resolver destinos'); return resultado; }
      console.log(`[${agora()}] ERRO no destino ${JSON.stringify(d)}: ${e.message}`);
      console.log(`[${agora()}] (vou tentar este destino de novo antes de cada envio)`);
      destinosPendentes.push(d);
    }
  }
  return resultado;
}

// Antes: um destino que falhava na conexao ficava FORA pela sessao inteira.
// Agora, antes de cada envio, tenta recuperar os que ficaram pendentes.
async function tentarResolverPendentes(client) {
  if (destinosPendentes.length === 0) return;
  const ainda = [];
  for (const d of destinosPendentes) {
    try {
      const r = await resolverUm(client, Object.assign({ _tentativas: 2 }, d));
      console.log(`[${agora()}] Destino recuperado: ${r.rotulo}`);
      destinosResolvidos.push(r);
    } catch (e) {
      if (ehErroDeSessao(e)) throw e;
      ainda.push(d);
    }
  }
  destinosPendentes = ainda;
}

let enviando = false; // trava para nao enviar duas vezes ao mesmo tempo

async function enviarSeNovo(client) {
  if (enviando) {
    console.log(`[${agora()}] Envio ja em andamento - ignorado (evita duplicar).`);
    return;
  }
  enviando = true;
  let erroSessao = false;
  try {
    // Recupera destinos que falharam na conexao (ex.: grupo que a lista de
    // conversas ainda nao tinha carregado).
    try { await tentarResolverPendentes(client); }
    catch (e) { if (ehErroDeSessao(e)) { erroSessao = true; return; } }

    const caminho = imagemMaisRecente();
    if (!caminho) {
      console.log(`[${agora()}] Nenhuma imagem encontrada em: ${CONFIG.pastaCapturas}`);
      return;
    }
    const hash = md5(caminho);
    const estado = lerEstado();
    if (!estado.enviados) estado.enviados = {}; // migra do formato antigo
    if (destinosResolvidos.length === 0) {
      console.log(`[${agora()}] Nenhum destino valido configurado - nada enviado.`);
      return;
    }

    // Controle POR DESTINO: cada destino so e marcado como "enviado" DEPOIS
    // que o envio dele der certo. Antes, o hash era gravado antes de mandar e,
    // se o envio falhasse (ex.: navegador morto), a imagem se perdia para
    // sempre - o programa achava que ja tinha mandado.
    const pendentes = destinosResolvidos.filter(d => estado.enviados[d.chatId] !== hash);
    if (pendentes.length === 0) {
      console.log(`[${agora()}] Imagem igual a anterior - nao reenviado: ${path.basename(caminho)}`);
      return;
    }

    const media = MessageMedia.fromFilePath(caminho);
    const legenda = 'Telemetria - ' + agora();
    let algumOk = false;
    for (const d of pendentes) {
      try {
        await client.sendMessage(d.chatId, media, { caption: legenda });
        algumOk = true;
        estado.enviados[d.chatId] = hash;
        estado.ultimoArquivo = path.basename(caminho);
        salvarEstado(estado); // grava logo apos CADA sucesso (nao duplica se cair no meio)
        console.log(`[${agora()}] ENVIADO para ${d.rotulo}: ${path.basename(caminho)}`);
      } catch (e) {
        console.log(`[${agora()}] ERRO ao enviar para ${d.rotulo}: ${e.message}`);
        if (ehErroDeSessao(e)) { erroSessao = true; break; }
      }
    }
    if (algumOk) registrarEnvioOk(); // marca o ultimo envio bem-sucedido
  } finally {
    enviando = false;
    if (erroSessao) reiniciarPorSessaoMorta('envio');
  }
}

function msAteProximoEnvio() {
  const n = new Date();
  const prox = new Date(n);
  prox.setMinutes(CONFIG.minutoEnvio, 0, 0);
  if (prox <= n) prox.setHours(prox.getHours() + 1);
  return prox - n;
}

function agendar(client) {
  function programarProximo() {
    const ms = msAteProximoEnvio();
    console.log(`[${agora()}] Proximo envio agendado em ~${Math.round(ms / 60000)} min.`);
    setTimeout(async function tick() {
      try { await enviarSeNovo(client); }
      catch (e) { console.log(`[${agora()}] ERRO no envio: ${e.message}`); }
      // Reagenda RECALCULANDO quanto falta ate o proximo minutoEnvio, ancorado
      // no relogio - assim o horario nao desliza alguns segundos a cada hora.
      // (Antes somava-se 1h fixa APOS o envio, e o tempo gasto enviando ia se
      //  acumulando ciclo a ciclo, empurrando o horario para frente.)
      programarProximo();
    }, ms);
  }
  programarProximo();
}

// Usa o Chrome/Edge que ja esta instalado no PC (evita baixar o Chrome do Puppeteer).
function acharNavegador() {
  const candidatos = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const c of candidatos) {
    try { if (c && fs.existsSync(c)) return c; } catch (e) { /* ignora */ }
  }
  return undefined; // se nao achar, deixa o Puppeteer tentar o padrao
}

// ---- AUTO-RECUPERACAO ----
// Quando o programa cai sem fechar direito, sobra um Chrome travado segurando a
// sessao e arquivos de trava no perfil. Na proxima abertura, isso impede o
// WhatsApp de conectar e o segundo plano fica reabrindo no mesmo erro. Esta
// rotina, chamada ANTES de conectar, limpa tudo isso para o programa se curar
// sozinho. NAO afeta o Chrome de navegacao normal (perfil diferente).
const perfilChrome = path.join(__dirname, 'sessao_whatsapp', 'session');
function limparTravaChrome() {
  // 1) Mata chrome.exe ORFAOS que usam ESTE perfil (de uma queda anterior).
  try {
    const { execSync } = require('child_process');
    const ps = "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'chrome.exe' -and $_.CommandLine -like '*sessao_whatsapp*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }";
    execSync('powershell -NoProfile -ExecutionPolicy Bypass -Command "' + ps + '"',
             { stdio: 'ignore', timeout: 30000 });
    console.log('Limpeza: Chrome travado da sessao anterior encerrado (se havia).');
  } catch (e) { /* ignora */ }
  // 2) Apaga arquivos de trava que sobram quando o Chrome nao fecha direito.
  for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket', 'DevToolsActivePort', 'lockfile']) {
    try { fs.rmSync(path.join(perfilChrome, f), { force: true }); } catch (e) { /* ignora */ }
  }
}

const navegador = acharNavegador();
if (navegador) {
  console.log('Usando o navegador instalado: ' + navegador);
} else {
  console.log('Nao encontrei Chrome/Edge instalado; tentando o padrao do Puppeteer.');
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, 'sessao_whatsapp') }),
  // FIXA a versao do WhatsApp Web pelo modo REMOTE: a propria biblioteca baixa
  // o arquivo COMPLETO no arranque. Assim o pino vive todo dentro deste
  // index.js - nao precisa copiar nenhum arquivo extra para a outra maquina
  // (basta copiar este index.js). Sem fixar, a lib usa a versao ao vivo e,
  // quando ela muda, a pagina recarrega no meio da injecao e da os erros
  // "Execution context was destroyed" / "callFunctionOn timed out".
  // OBS DE MANUTENCAO: o repositorio apaga versoes antigas de tempos em tempos.
  // Se um dia o erro de injecao voltar, troque o numero da versao na URL abaixo
  // por uma que ainda exista em:
  //   https://github.com/wppconnect-team/wa-version/tree/main/html
  // webVersionCache: {
 //    type: 'remote',
  //   remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1041149705-alpha.html',
 //  },
  puppeteer: {
    executablePath: navegador,
    protocolTimeout: 180000, // 3 min - evita timeout em maquinas mais lentas
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
});

let watchdogConexao = null; // encerra se travar na conexao (so no segundo plano)

client.on('qr', (qr) => {
  // Precisa de QR: pode demorar (humano escaneia), entao desliga o watchdog.
  if (watchdogConexao) { clearTimeout(watchdogConexao); watchdogConexao = null; }
  console.log('\n==================================================');
  console.log(' Escaneie o QR Code abaixo com o WhatsApp do celular:');
  console.log(' WhatsApp > Aparelhos conectados > Conectar um aparelho');
  console.log('==================================================\n');
  qrcode.generate(qr, { small: true });
});

let inicializado = false; // garante que o agendamento rode uma vez so

client.on('ready', async () => {
  if (watchdogConexao) { clearTimeout(watchdogConexao); watchdogConexao = null; }
  console.log(`[${agora()}] WhatsApp conectado!`);

  // A lista de conversas demora alguns segundos para carregar depois do
  // "ready". Esperar aqui evita o erro ao procurar grupos pelo nome.
  console.log(`[${agora()}] Aguardando a lista de conversas carregar (15s)...`);
  await new Promise(r => setTimeout(r, 15000));

  // Modo "listar grupos": mostra nome e ID de cada grupo e sai.
  if (MODO_LISTAR_GRUPOS) {
    try {
      const chats = await client.getChats();
      const grupos = chats.filter(c => c.isGroup);
      console.log('\n=============== GRUPOS DESTE WHATSAPP ===============');
      if (grupos.length === 0) {
        console.log(' (nenhum grupo encontrado)');
      } else {
        grupos.forEach(g => console.log(' - ' + g.name + '  |  id: ' + g.id._serialized));
      }
      console.log('====================================================');
      console.log('DICA: em CONFIG.destinos, prefira usar o ID (mais confiavel):');
      console.log("  { tipo: 'grupo', nome: 'Apelido qualquer', id: '1203...@g.us' }\n");
    } catch (e) {
      console.log('ERRO ao listar grupos: ' + e.message);
    }
    process.exit(0);
    return;
  }

  // Se o WhatsApp reconectar e disparar "ready" de novo, NAO agenda outra vez.
  if (inicializado) {
    console.log(`[${agora()}] Reconexao detectada - mantendo o agendamento atual.`);
    return;
  }
  inicializado = true;

  destinosResolvidos = await resolverDestinos(client);
  if (CONFIG.enviarAoIniciar) {
    try { await enviarSeNovo(client); }
    catch (e) { console.log(`[${agora()}] ERRO no envio inicial: ${e.message}`); }
  }
  agendar(client);

  // Aviso de inatividade: confere ao conectar e depois a cada 20 minutos.
  verificarInatividade(client, true);
  setInterval(() => { verificarInatividade(client, true); }, 20 * 60 * 1000);

  // Batimento: a cada 60s confirma que segue CONECTADO e atualiza heartbeat.txt.
  // O vigia usa a DATA deste arquivo para perceber se o processo travou vivo
  // (sem cair) e, nesse caso, reinicia limpo.
  escreverHeartbeat();
  let falhasBatimento = 0;
  setInterval(async () => {
    try {
      const est = await client.getState();
      if (est === 'CONNECTED') { escreverHeartbeat(); falhasBatimento = 0; }
    } catch (e) {
      // 3 falhas seguidas com erro de sessao = navegador morto: reinicia ja,
      // sem esperar o vigia notar o heartbeat parado.
      falhasBatimento++;
      if (ehErroDeSessao(e) && falhasBatimento >= 3) reiniciarPorSessaoMorta('batimento');
    }
  }, 60 * 1000);
});

client.on('auth_failure', (m) => console.log(`[${agora()}] Falha de autenticacao: ${m}`));
client.on('disconnected', (r) => {
  console.log(`[${agora()}] Desconectado: ${r}. Encerrando para o vigia reabrir.`);
  setTimeout(() => process.exit(1), 3000);
});

// Limpa qualquer trava de uma execucao anterior ANTES de abrir o Chrome.
limparTravaChrome();

// Se ja estava parado ha muito tempo, registra o aviso na Area de Trabalho ja
// na largada (mesmo antes de conectar / mesmo que o WhatsApp esteja fora).
verificarInatividade(null, false);

// Watchdog: se em 4 min nao conectar nem pedir QR (ficou travado), encerra
// para o vigia do segundo plano reabrir LIMPO. Evita o loop preso de antes.
watchdogConexao = setTimeout(() => {
  console.log('Nao conectou em 4 min (travado) - encerrando para reabrir limpo.');
  process.exit(1);
}, 4 * 60 * 1000);


// ---- DESCOBRIR GRUPO PELAS MENSAGENS (sem getChats, que esta quebrado) ----
const _gruposVistos = new Set();
client.on('message_create', (msg) => {
  try {
    const de = String(msg.from || '');
    const para = String(msg.to || '');
    const idGrupo = de.endsWith('@g.us') ? de : (para.endsWith('@g.us') ? para : null);
    if (!idGrupo || _gruposVistos.has(idGrupo)) return;
    _gruposVistos.add(idGrupo);
    const trecho = String(msg.body || '(sem texto)').slice(0, 40);
    console.log(`[${agora()}] GRUPO VISTO: ${idGrupo}  |  msg: "${trecho}"`);
    console.log(`[${agora()}] Se for o grupo desejado, fixe no CONFIG:`);
    console.log(`  { tipo: 'grupo', nome: 'TORRE DE CONTROLE INTERNO', id: '${idGrupo}' },`);
  } catch (e) { /* ignora */ }
});

console.log('Iniciando... aguarde o QR Code (ou a conexao automatica).');
client.initialize();