const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// primeira mensagem enviada apos receber qualquer mensagem
const mensagemBoasVindas = "mensagem de boas vindas"


// mensagem recebida: resposta enviada
const respostas = {
  "Comando recebido":" mensagem retornada"
  
};

// Armazena o contexto de cada número
const contextoPorNumero = {};

wss.on('connection', (ws) => {
  console.log('✅ Conexão WebSocket estabelecida com o servidor');

  ws.on('message', (message) => {
    const dados = JSON.parse(message);
    const numero = dados.from;
    const texto = dados.text.toLowerCase().trim();

    // Mensagem especial para disparar boas-vindas
    if (texto === '__boasvindas__') {
      contextoPorNumero[numero] = null;
      ws.send(JSON.stringify({ reply: mensagemBoasVindas }));
      return;
    }

    // Se digitou apenas "1" ou "2", usa o contexto anterior
    if ((texto === "1" || texto === "2") && contextoPorNumero[numero]) {
      const chave = `${contextoPorNumero[numero]} ${texto}`;
      const resposta = respostas[chave];
      if (resposta) {
        ws.send(JSON.stringify({ reply: resposta }));
      } else {
        ws.send(JSON.stringify({ reply: "Desculpe, não entendi sua mensagem. Tente novamente." }));
      }
      return;
    }

    // Mensagens principais (sem número)
    const resposta = respostas[texto];
    if (resposta) {
      contextoPorNumero[numero] = texto;
      ws.send(JSON.stringify({ reply: resposta }));
    } else {
      ws.send(JSON.stringify({ reply: "Desculpe, não entendi sua mensagem. Tente novamente." }));
    }
  });

  ws.on('close', () => {
    console.log('❌ Cliente WebSocket desconectado.');
  });
});

console.log('🚀 Servidor WebSocket rodando na porta 8080...');
