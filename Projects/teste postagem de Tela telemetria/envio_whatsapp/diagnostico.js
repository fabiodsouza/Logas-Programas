/*
 * Diagnostico do envio - NAO conecta no WhatsApp, so checa a pasta de capturas
 * e compara com o ultimo envio. Pode rodar com o envio normal ativo.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Mesmos valores do index.js
const PASTA = '\\\\Windows\\capturas';
const arquivoEstado = path.join(__dirname, 'estado_envio.json');

function listarPngs(dir) {
  let r = [];
  if (!fs.existsSync(dir)) return r;
  for (const nome of fs.readdirSync(dir)) {
    const p = path.join(dir, nome);
    let st;
    try { st = fs.statSync(p); } catch (e) { continue; }
    if (st.isDirectory()) r = r.concat(listarPngs(p));
    else if (nome.toLowerCase().endsWith('.png')) r.push({ caminho: p, mtime: st.mtimeMs });
  }
  return r;
}
function md5(c) { return crypto.createHash('md5').update(fs.readFileSync(c)).digest('hex'); }
function lerEstado() {
  try { return JSON.parse(fs.readFileSync(arquivoEstado, 'utf8')); }
  catch (e) { return { ultimoHash: null, ultimoArquivo: null }; }
}

console.log('===========================================================');
console.log(' DIAGNOSTICO DA PASTA DE CAPTURAS');
console.log('===========================================================');
console.log('Pasta configurada: ' + PASTA);

if (!fs.existsSync(PASTA)) {
  console.log('\n>> PROBLEMA: a pasta NAO foi encontrada/acessada.');
  console.log('   O envio nao tem de onde pegar as imagens.');
  console.log('   Verifique se o compartilhamento \\\\Windows\\capturas esta acessivel');
  console.log('   (tente abrir esse caminho no Explorador de Arquivos).');
  process.exit(0);
}

const pngs = listarPngs(PASTA).sort((a, b) => b.mtime - a.mtime);
console.log('Total de PNG encontrados: ' + pngs.length);

if (pngs.length === 0) {
  console.log('\n>> A pasta existe, mas NAO ha nenhum arquivo .png nela.');
  console.log('   Provavel causa: a captura de tela (no outro programa) parou de gerar imagens.');
  process.exit(0);
}

const novo = pngs[0];
console.log('\nImagem MAIS RECENTE:');
console.log('  arquivo: ' + path.basename(novo.caminho));
console.log('  data:    ' + new Date(novo.mtime).toLocaleString('pt-BR'));

const estado = lerEstado();
console.log('\nUltimo envio registrado:');
console.log('  arquivo: ' + (estado.ultimoArquivo || '(nenhum)'));

const hashNovo = md5(novo.caminho);
console.log('\n-----------------------------------------------------------');
if (hashNovo === estado.ultimoHash) {
  console.log(' CONCLUSAO: a imagem mais recente JA FOI ENVIADA.');
  console.log(' Nao ha nada novo para mandar - o sistema esta correto.');
  console.log(' Se voce esperava uma foto nova, o problema esta na CAPTURA:');
  console.log(' a tela nao esta gerando PNG novo depois de ' +
              new Date(novo.mtime).toLocaleString('pt-BR') + '.');
} else {
  console.log(' CONCLUSAO: HA uma imagem NOVA ainda nao enviada!');
  console.log(' Se ela nao chegou no WhatsApp, o problema esta no ENVIO');
  console.log(' (conexao do WhatsApp ou destino). Me avise para investigar.');
}
console.log('===========================================================');
