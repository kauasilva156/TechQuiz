const CHAVE_RANKING = "techquiz-ranking";

const telaInicio = document.querySelector("#tela-inicio");
const telaJogo = document.querySelector("#tela-jogo");
const telaResultado = document.querySelector("#tela-resultado");
const formInicio = document.querySelector("#form-inicio");
const campoNome = document.querySelector("#nome");
const erroNome = document.querySelector("#erro-nome");
const progressoTexto = document.querySelector("#progresso-texto");
const progresso = document.querySelector("#progresso");
const formPergunta = document.querySelector("#form-pergunta");
const enunciado = document.querySelector("#enunciado");
const alternativas = document.querySelector("#alternativas");
const erroAlternativa = document.querySelector("#erro-alternativa");
const botaoConfirmar = document.querySelector("#botao-confirmar");
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
formPergunta.addEventListener("submit", confirmar);
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
  progresso.max = perguntas.length;
  mostrarTela(telaJogo);
  mostrarPergunta();
}

function mostrarPergunta() {
  const pergunta = perguntas[indice];
  perguntaTravada = false;
  progresso.value = indice + 1;
  progressoTexto.textContent = "Pergunta " + (indice + 1) + " de " + perguntas.length;
  enunciado.textContent = pergunta.enunciado;
  erroAlternativa.textContent = "";
  alternativas.replaceChildren();

  pergunta.alternativas.forEach(function (alternativa) {
    const rotulo = document.createElement("label");
    rotulo.className = "opcao";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "alternativa";
    radio.value = alternativa.id;
    radio.required = true;

    const texto = document.createElement("span");
    texto.textContent = alternativa.id.toUpperCase() + ") " + alternativa.texto;

    rotulo.append(radio, texto);
    alternativas.append(rotulo);
  });

  feedback.hidden = true;
  feedback.classList.remove("certo", "errado");
  formPergunta.hidden = false;
  botaoConfirmar.disabled = false;
  botaoProxima.textContent = indice === perguntas.length - 1 ? "Ver resultado" : "Próxima pergunta";
  document.title = "Pergunta " + (indice + 1) + " — TechQuiz";
  enunciado.focus();
}

function confirmar(evento) {
  evento.preventDefault();
  if (perguntaTravada) {
    return;
  }

  const selecionada = formPergunta.querySelector("input[name='alternativa']:checked");
  if (!selecionada) {
    erroAlternativa.textContent = "Escolha uma alternativa antes de confirmar.";
    return;
  }

  const pergunta = perguntas[indice];
  const escolhida = selecionada.value;
  const acertou = escolhida === pergunta.correta;
  perguntaTravada = true;
  if (acertou) {
    acertos += 1;
  }

  respostas.push({
    enunciado: pergunta.enunciado,
    escolhida: escolhida,
    correta: pergunta.correta,
    acertou: acertou,
    explicacao: pergunta.explicacao,
    fonte: pergunta.fonte
  });

  alternativas.querySelectorAll(".opcao").forEach(function (opcao) {
    const radio = opcao.querySelector("input");
    radio.disabled = true;
    if (radio.value === pergunta.correta) {
      opcao.classList.add("correta");
      opcao.querySelector("span").textContent += " (correta)";
    } else if (radio.checked) {
      opcao.classList.add("incorreta");
    }
  });

  feedback.hidden = false;
  feedback.classList.add(acertou ? "certo" : "errado");
  feedbackTitulo.textContent = acertou ? "Resposta correta" : "Resposta incorreta";
  feedbackTexto.textContent = pergunta.explicacao;
  feedbackFonte.textContent = pergunta.fonte.titulo;
  feedbackFonte.href = pergunta.fonte.url;
  botaoConfirmar.disabled = true;
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
}
