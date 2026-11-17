const CHAVE_RANKING = "techquiz-ranking";

const telaInicio = document.querySelector("#tela-inicio");
const telaJogo = document.querySelector("#tela-jogo");
const telaResultado = document.querySelector("#tela-resultado");
const formInicio = document.querySelector("#form-inicio");
const campoNome = document.querySelector("#nome");
const erroNome = document.querySelector("#erro-nome");
const progressoTexto = document.querySelector("#progresso-texto");
const enunciado = document.querySelector("#enunciado");
const alternativas = document.querySelector("#alternativas");
const feedback = document.querySelector("#feedback");
const feedbackTitulo = document.querySelector("#feedback-titulo");
const feedbackTexto = document.querySelector("#feedback-texto");
const feedbackFonte = document.querySelector("#feedback-fonte");
const botaoProxima = document.querySelector("#botao-proxima");
const resumoResultado = document.querySelector("#resumo-resultado");
const revisao = document.querySelector("#revisao");
const botaoDeNovo = document.querySelector("#botao-de-novo");
const rankingVazio = document.querySelector("#ranking-vazio");
const listaRanking = document.querySelector("#lista-ranking");

let perguntas = [];
let indice = 0;
let acertos = 0;
let nomeJogador = "";
let respostas = [];
let perguntaTravada = false;

formInicio.addEventListener("submit", iniciar);
botaoProxima.addEventListener("click", avancar);
botaoDeNovo.addEventListener("click", reiniciar);
renderRanking();

async function iniciar(evento) {
  evento.preventDefault();
  const nome = campoNome.value.trim();
  if (nome.length < 2) {
    erroNome.textContent = "Use pelo menos 2 caracteres.";
    campoNome.setAttribute("aria-invalid", "true");
    campoNome.focus();
    return;
  }

  erroNome.textContent = "";
  campoNome.removeAttribute("aria-invalid");
  nomeJogador = nome;

  if (perguntas.length === 0) {
    try {
      const resposta = await fetch("perguntas.json");
      if (!resposta.ok) {
        throw new Error("falha ao ler perguntas");
      }
      perguntas = await resposta.json();
    } catch (erro) {
      erroNome.textContent = "Não foi possível carregar perguntas.json. Abra o quiz pelo site publicado ou por um servidor local.";
      return;
    }
  }

  if (!Array.isArray(perguntas) || perguntas.length < 10) {
    erroNome.textContent = "O arquivo de perguntas precisa ter pelo menos 10 itens.";
    return;
  }

  indice = 0;
  acertos = 0;
  respostas = [];
  mostrarTela(telaJogo);
  mostrarPergunta();
}

function mostrarPergunta() {
  const pergunta = perguntas[indice];
  perguntaTravada = false;
  progressoTexto.textContent = "Pergunta " + (indice + 1) + " de " + perguntas.length;
  enunciado.textContent = pergunta.enunciado;
  alternativas.replaceChildren();

  pergunta.alternativas.forEach(function (alternativa) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "opcao";
    botao.textContent = alternativa.texto;
    botao.dataset.id = alternativa.id;
    botao.addEventListener("click", function () {
      escolher(alternativa.id);
    });
    alternativas.append(botao);
  });

  feedback.hidden = true;
  feedback.classList.remove("certo", "errado");
  botaoProxima.hidden = true;
  botaoProxima.textContent = "Próxima";
  document.title = "Pergunta " + (indice + 1) + " — TechQuiz";
  progressoTexto.focus();
}

function escolher(idEscolhido) {
  if (perguntaTravada) {
    return;
  }

  const pergunta = perguntas[indice];
  const acertou = idEscolhido === pergunta.correta;
  perguntaTravada = true;
  if (acertou) {
    acertos += 1;
  }

  respostas.push({
    enunciado: pergunta.enunciado,
    escolhida: idEscolhido,
    correta: pergunta.correta,
    acertou: acertou,
    explicacao: pergunta.explicacao,
    fonte: pergunta.fonte
  });

  alternativas.querySelectorAll(".opcao").forEach(function (botao) {
    botao.disabled = true;
    if (botao.dataset.id === pergunta.correta) {
      botao.classList.add("correta");
      botao.textContent += " (correta)";
    } else if (botao.dataset.id === idEscolhido) {
      botao.classList.add("incorreta");
    }
  });

  feedback.hidden = false;
  feedback.classList.add(acertou ? "certo" : "errado");
  feedbackTitulo.textContent = acertou
    ? "✓ Resposta correta — veja a explicação"
    : "✗ Resposta incorreta — veja a explicação";
  feedbackTexto.textContent = pergunta.explicacao;
  feedbackFonte.textContent = pergunta.fonte.titulo;
  feedbackFonte.href = pergunta.fonte.url;
  botaoProxima.hidden = false;
  feedbackTitulo.focus();
}

function avancar() {
  if (indice < perguntas.length - 1) {
    indice += 1;
    mostrarPergunta();
    return;
  }
  finalizar();
}

function finalizar() {
  salvarRanking();
  renderRanking();
  const total = perguntas.length;
  resumoResultado.textContent = nomeJogador + " acertou " + acertos + " de " + total + ".";
  revisao.replaceChildren();

  respostas.forEach(function (item, posicao) {
    const detalhe = document.createElement("details");
    const sumario = document.createElement("summary");
    sumario.textContent = (posicao + 1) + ". " + (item.acertou ? "Acertou" : "Errou") + " — " + item.enunciado;

    const explicacao = document.createElement("p");
    explicacao.textContent = item.explicacao + " Alternativa correta: " + item.correta.toUpperCase() + ".";

    const fonte = document.createElement("p");
    const link = document.createElement("a");
    link.href = item.fonte.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = item.fonte.titulo;
    fonte.append("Fonte: ", link);

    detalhe.append(sumario, explicacao, fonte);
    revisao.append(detalhe);
  });

  mostrarTela(telaResultado);
  document.title = "Resultado — TechQuiz";
  document.querySelector("#titulo-resultado").focus();
}

function salvarRanking() {
  const ranking = lerRanking();
  ranking.push({
    nome: nomeJogador,
    acertos: acertos,
    total: perguntas.length,
    quando: Date.now()
  });
  ranking.sort(function (a, b) {
    if (b.acertos !== a.acertos) {
      return b.acertos - a.acertos;
    }
    return a.quando - b.quando;
  });
  sessionStorage.setItem(CHAVE_RANKING, JSON.stringify(ranking));
}

function lerRanking() {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE_RANKING) || "[]");
    return Array.isArray(salvo) ? salvo : [];
  } catch (erro) {
    return [];
  }
}

function renderRanking() {
  const ranking = lerRanking();
  listaRanking.replaceChildren();
  rankingVazio.hidden = ranking.length > 0;

  ranking.forEach(function (item, posicao) {
    const linha = document.createElement("li");
    const lugar = document.createElement("span");
    lugar.className = "posicao";
    lugar.textContent = String(posicao + 1) + "º";

    const nome = document.createElement("span");
    nome.textContent = item.nome;

    const pontos = document.createElement("span");
    pontos.textContent = item.acertos + "/" + item.total;

    linha.append(lugar, nome, pontos);
    listaRanking.append(linha);
  });
}

function reiniciar() {
  indice = 0;
  acertos = 0;
  respostas = [];
  mostrarTela(telaInicio);
  document.title = "TechQuiz — Fundamentos de tecnologia";
  campoNome.focus();
}

function mostrarTela(tela) {
  telaInicio.hidden = tela !== telaInicio;
  telaJogo.hidden = tela !== telaJogo;
  telaResultado.hidden = tela !== telaResultado;
  document.querySelector("aside").hidden = tela === telaJogo;
}
