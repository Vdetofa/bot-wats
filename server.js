const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// primeira mensagem enviada apos receber qualquer mensagem
const mensagemBoasVindas = "Muito Bem Vindo ao Esporte Clube VILA NOVA ⚽🇾🇪\nAgradecemos seu contato.\n\nDigite o que precisa para tentarmos lhe auxiliar:\n\nMatricula\nUniforme\nMensalidade\nCancelamento\nSuporte Ao App\nFale conosco\n\nSe por acaso seu problema não foi resolvido, digite #, deixe as informações necessárias e aguarde atendimento.";


// mensagem recebida: resposta enviada
const respostas = {
  "matricula": "Você já verificou a disponibilidade de vaga? 1 Sim 2 Não",
  "matricula 1": "Para realizar a matrícula do seu filho, acesse o link abaixo, baixe o app e responda as solicitações.\nhttps://atletas.app.link/vilanovaec",
  "matricula 2": "Qual o ano de nascimento do atleta?\nTurno de disponibilidade de treino?\nBairro em que residem?",
  "uniforme": "Nossos uniformes ficam disponíveis para compra na Loja PlayTennis da Rua Morom, esquina com Fagundes dos Reis - Passo Fundo \n1. Atendemos sua dúvida?\n2. Não posso ir em horário comercial",
  "uniforme 1": "Agradecemos seu contato e estamos disponíveis 🫱🏻‍🫲🏻",
  "uniforme 2": "Não se preocupe, podemos combinar uma melhor forma, me passa mais informações do que você precisa e tamanho, que logo lhe retorno.",
  "mensalidade": "1. MENSALIDADE DESTE MÊS\n2. MENSALIDADE EM ATRASO",
  "mensalidade 1": "Para pagamento você deve acessar o app RITMO ATLETAS e seguir o passo abaixo\nMENU - SEU PLANO - FATURAS\nSelecionar a forma de pagamento, onde pix baixa a mensalidade na hora e Boleto onde leva 2 dias úteis para dar baixa.",
  "mensalidade 2": "Qual nome completo do seu filho?\nLogo retornaremos para auxiliarmos na regularização.",
  "cancelamento": "Poxa que pena 😕\nAconteceu algo para a desistência do atleta aos treinos?",
  "cancelamento 1": "Lembramos que, para solicitações de cancelamento as mensalidades devem estar em dia, cumprir o contrato mínimo de 6 meses no clube e a solicitação deve ocorrer 30 dias antes do vencimento da próxima mensalidade para que possamos finalizar o sistema.",
  "suporte ao app": "Para obter suporte ao app, por favor, entre em contato conosco e forneça os seguintes dados: nome, sobrenome e CPF.",
  "fale conosco": "Para falar conosco, por favor, entre em contato conosco e forneça os seguintes dados: nome, sobrenome e CPF.",
  "#": "Por favor, forneça as informações necessárias para que possamos atendê-lo melhor."
  
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
