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
function gravarLog(prefixo, args) {
  const linha = args.map(a => (typeof a === 'string' ? a : (a && a.stack) ? a.stack : JSON.stringify(a))).join(' ');
  try { fs.appendFileSync(arquivoLog, prefixo + linha + '\r\n'); } catch (e) { /* ignora */ }
}
const _logOriginal = console.log;
console.log = function (...args) {
  gravarLog('', args);
  _logOriginal.apply(console, args);
};
const _errOriginal = console.error;
console.error = function (...args) {
  gravarLog('[ERRO] ', args);
  _errOriginal.apply(console, args);
};
// Captura quedas que normalmente nao apareceriam no log (motivo do oculto morrer).
process.on('uncaughtException', (e) => {
  gravarLog('[EXCECAO NAO TRATADA] ', [e]);
});
process.on('unhandledRejection', (e) => {
  gravarLog('[PROMESSA REJEITADA] ', [e]);
});

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
  //   { tipo: 'eu' }                                    -> sua propria conversa
  destinos: [
    { tipo: 'numero', valor: '5531984432363'},
    // { tipo: 'numero', valor: '5531987871614'},
    { tipo: 'grupo', nome: 'TORRE DE CONTROLE INTERNO' },
    // { tipo: 'numero', valor: '5531988887777' },
  ],

  // Minuto da hora em que envia (ex.: 2 = xx:02, logo apos a captura de xx:00).
  minutoEnvio: 1,

  // Enviar a imagem mais recente assim que conectar (bom para testar).
  enviarAoIniciar: true,
};
// ===============================================================

const arquivoEstado = path.join(__dirname, 'estado_envio.json');
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
    const chats = await client.getChats();
    const g = chats.find(c => c.isGroup && c.name === d.nome);
    if (!g) {
      throw new Error(`grupo "${d.nome}" nao encontrado ` +
        `(confira o nome exato e se este WhatsApp participa do grupo)`);
    }
    return { rotulo: 'grupo ' + d.nome, chatId: g.id._serialized };
  }
  throw new Error('tipo de destino desconhecido: ' + JSON.stringify(d));
}

async function resolverDestinos(client) {
  const resultado = [];
  for (const d of CONFIG.destinos) {
    try {
      const r = await resolverUm(client, d);
      console.log(`[${agora()}] Destino OK: ${r.rotulo}`);
      resultado.push(r);
    } catch (e) {
      console.log(`[${agora()}] ERRO no destino ${JSON.stringify(d)}: ${e.message}`);
    }
  }
  return resultado;
}

let enviando = false; // trava para nao enviar duas vezes ao mesmo tempo

async function enviarSeNovo(client) {
  if (enviando) {
    console.log(`[${agora()}] Envio ja em andamento - ignorado (evita duplicar).`);
    return;
  }
  enviando = true;
  try {
    const caminho = imagemMaisRecente();
    if (!caminho) {
      console.log(`[${agora()}] Nenhuma imagem encontrada em: ${CONFIG.pastaCapturas}`);
      return;
    }
    const hash = md5(caminho);
    const estado = lerEstado();
    if (hash === estado.ultimoHash) {
      console.log(`[${agora()}] Imagem igual a anterior - nao reenviado: ${path.basename(caminho)}`);
      return;
    }
    if (destinosResolvidos.length === 0) {
      console.log(`[${agora()}] Nenhum destino valido configurado - nada enviado.`);
      return;
    }
    // Reserva como "enviada" ANTES de mandar: se algo disparar de novo,
    // ja vera esta imagem como enviada e nao duplica.
    salvarEstado({ ultimoHash: hash, ultimoArquivo: path.basename(caminho) });
    const media = MessageMedia.fromFilePath(caminho);
    const legenda = 'Telemetria - ' + agora();
    for (const d of destinosResolvidos) {
      try {
        await client.sendMessage(d.chatId, media, { caption: legenda });
        console.log(`[${agora()}] ENVIADO para ${d.rotulo}: ${path.basename(caminho)}`);
      } catch (e) {
        console.log(`[${agora()}] ERRO ao enviar para ${d.rotulo}: ${e.message}`);
      }
    }
  } finally {
    enviando = false;
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
  const ms = msAteProximoEnvio();
  console.log(`[${agora()}] Proximo envio agendado em ~${Math.round(ms / 60000)} min.`);
  setTimeout(async function tick() {
    try { await enviarSeNovo(client); }
    catch (e) { console.log(`[${agora()}] ERRO no envio: ${e.message}`); }
    setTimeout(tick, 60 * 60 * 1000); // repete a cada 1 hora
  }, ms);
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

const navegador = acharNavegador();
if (navegador) {
  console.log('Usando o navegador instalado: ' + navegador);
} else {
  console.log('Nao encontrei Chrome/Edge instalado; tentando o padrao do Puppeteer.');
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: path.join(__dirname, 'sessao_whatsapp') }),
  // FIXA a versao do WhatsApp Web. Sem isto, a lib usa a versao que o WhatsApp
  // servir no momento - quando muda, a pagina recarrega no meio da injecao e da
  // o erro "Execution context was destroyed". Com a versao fixa, isso para.
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1023309692.html',
  },
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

client.on('qr', (qr) => {
  console.log('\n==================================================');
  console.log(' Escaneie o QR Code abaixo com o WhatsApp do celular:');
  console.log(' WhatsApp > Aparelhos conectados > Conectar um aparelho');
  console.log('==================================================\n');
  qrcode.generate(qr, { small: true });
});

let inicializado = false; // garante que o agendamento rode uma vez so

client.on('ready', async () => {
  console.log(`[${agora()}] WhatsApp conectado!`);

  // Modo "listar grupos": mostra os grupos e sai (para pegar o nome exato).
  if (MODO_LISTAR_GRUPOS) {
    try {
      const chats = await client.getChats();
      const grupos = chats.filter(c => c.isGroup);
      console.log('\n=============== GRUPOS DESTE WHATSAPP ===============');
      if (grupos.length === 0) {
        console.log(' (nenhum grupo encontrado)');
      } else {
        grupos.forEach(g => console.log(' - ' + g.name));
      }
      console.log('====================================================');
      console.log('Copie o nome EXATO do grupo e coloque em CONFIG.destinos.\n');
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
});

client.on('auth_failure', (m) => console.log(`[${agora()}] Falha de autenticacao: ${m}`));
client.on('disconnected', (r) => console.log(`[${agora()}] Desconectado: ${r}. Reabra o programa.`));

console.log('Iniciando... aguarde o QR Code (ou a conexao automatica).');
client.initialize().catch((e) => {
  console.log('[FALHA NA INICIALIZACAO] ' + (e && e.message ? e.message : e));
  console.log('Vou tentar de novo em 15 segundos...');
  setTimeout(() => { client.initialize().catch(() => {}); }, 15000);
});
