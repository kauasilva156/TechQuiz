# TechQuiz — Fundamentos de tecnologia

Entrega final do quiz em grupo (CP3). O site reúne o fluxo completo de jogo, doze perguntas, explicação com fonte e ranking da sessão.

## Integrantes

| Nome | GitHub | Participação |
| --- | --- | --- |
| Kauã Silva Mattoso | [@kauasilva156](https://github.com/kauasilva156) | Quiz, acessibilidade, README e publicação |

## Tema

Fundamentos de tecnologia usados na própria página: HTML, CSS, JavaScript, `sessionStorage`, texto alternativo, HTTPS, responsividade, HTTP, golpes digitais, verificação em duas etapas, Git e contraste.

## Regras

- O quiz tem 12 perguntas e quatro alternativas em cada uma.
- Só existe uma alternativa correta por pergunta.
- A resposta vale depois do botão **Confirmar resposta**.
- Em seguida a página diz se a escolha está certa, explica o conteúdo e mostra a fonte.
- Cada acerto vale um ponto.
- O ranking guarda nome e pontuação no `sessionStorage` e continua disponível enquanto a aba estiver aberta.
- Fechar a aba apaga o ranking. Atualizar a página no meio da partida recomeça o jogo, mas mantém as partidas já concluídas.

## Instruções

1. Abra o site publicado: https://kauasilva156.github.io/TechQuiz/
2. Digite um nome com pelo menos 2 caracteres e escolha **Começar quiz**.
3. Selecione uma alternativa com o mouse ou com o teclado (Tab chega no grupo; as setas trocam a opção) e confirme.
4. Leia a explicação e, se quiser, abra a fonte em outra aba.
5. Avance até a tela de resultado. A revisão lista cada pergunta, e o ranking ao lado mostra as partidas desta sessão.
6. **Jogar de novo** inicia outra partida sem apagar o ranking.

Para ver o projeto na sua máquina, entre na pasta e sirva os arquivos por HTTP, por exemplo `python -m http.server`. Abrir o `index.html` direto no disco impede o `fetch` de `perguntas.json`.

## Link do site

https://kauasilva156.github.io/TechQuiz/

Repositório: https://github.com/kauasilva156/TechQuiz

Tag da entrega: `cp3-entrega`

## Decisões para a apresentação

- As perguntas ficam em `perguntas.json`, separadas da página, para o grupo incluir conteúdo sem reescrever o JavaScript.
- O ranking usa `sessionStorage` porque a proposta é registrar a sessão da aba, e não criar conta nem banco de dados.
- Cada resposta traz explicação e um link `https` que abre fora da página.
- O foco do teclado fica visível, as imagens têm `alt`, o contraste do texto passa do mínimo usual e a página não cria rolagem horizontal.
- A tag `cp3-entrega` marca esta versão no GitHub.
