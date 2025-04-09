const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WebSocket = require('ws');

// Conexão com WebSocket
const ws = new WebSocket('ws://localhost:8080');

// Lista de números bloqueados
const numerosBloqueados = [
  '5511999999999@c.us',
  '5588999999999@c.us'
];

// Números que já receberam mensagem de boas-vindas
const numerosComBoasVindas = new Set();

// Enviar mensagem ao WebSocket com segurança
function enviarMensagemSegura(dados) {
  const mensagem = JSON.stringify(dados);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(mensagem);
  } else {
    console.log('⏳ WebSocket ainda conectando... Reenviando em 200ms');
    setTimeout(() => enviarMensagemSegura(dados), 200);
  }
}

// Inicialização do WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    ignoreHTTPSErrors: true,
  }
});

// Exibe o QR Code para login
client.on('qr', (qr) => {
  console.log('🔄 Escaneie o QR Code abaixo com o WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// Conexão estabelecida
client.on('ready', () => {
  console.log('✅ Cliente WhatsApp conectado!');
});

ws.on('open', () => {
  console.log('✅ Conexão WebSocket estabelecida com o servidor');
});

// Recebe mensagens
client.on('message', async (message) => {
  console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);

  // Ignora grupos
  if (message.from.includes('@g.us')) {
    console.log(`🚫 Mensagem ignorada de grupo: ${message.from}`);
    return;
  }

  // Ignora contatos bloqueados
  if (numerosBloqueados.includes(message.from)) {
    console.log(`🚫 Mensagem ignorada de contato bloqueado: ${message.from}`);
    return;
  }

  // Envia __boasvindas__ apenas na primeira mensagem de cada número
  if (!numerosComBoasVindas.has(message.from)) {
    numerosComBoasVindas.add(message.from);
    enviarMensagemSegura({ from: message.from, text: "__boasvindas__" });
  } else {
    enviarMensagemSegura({ from: message.from, text: message.body });
  }

  // Aguarda resposta do WebSocket
  ws.once('message', (data) => {
    const response = JSON.parse(data);
    if (response.reply) {
      client.sendMessage(message.from, response.reply);
    }
  });
});

// Inicia o cliente
client.initialize();
