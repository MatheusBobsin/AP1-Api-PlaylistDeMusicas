/**
 * ==============================================================================
 * Interface de Demonstração - Recurso Músicas (Projeto AP1)
 * ==============================================================================
 * AVISO IMPORTANTE:
 * Este script opera exclusivamente no ambiente cliente (navegador), utilizando
 * dados fictícios (mock data) armazenados em memória local para fins de
 * prototipação e validação visual de interface.
 * 
 * NÃO realiza chamadas de rede (fetch, XMLHttpRequest, etc.), NÃO persiste dados
 * no banco de dados SQLite e NÃO possui conexão ativa com a API.
 * ==============================================================================
 */

(function () {
  "use strict";

  // Conjunto padrão de dados fictícios para a demonstração
  const DADOS_INICIAIS_DEMO = [
    { id: 1, titulo: "In Bloom", artista: "Nirvana" },
    { id: 2, titulo: "My Hero", artista: "Foo Fighters" },
    { id: 3, titulo: "Come as You Are", artista: "Nirvana" },
    { id: 4, titulo: "Learn to Fly", artista: "Foo Fighters" }
  ];

  // Estado em memória local da interface de demonstração
  let listaMusicasDemo = JSON.parse(JSON.stringify(DADOS_INICIAIS_DEMO));
  let proximoIdFicticio = 5;

  // Elementos da interface
  const formMusica = document.getElementById("formMusica");
  const tituloInput = document.getElementById("tituloInput");
  const artistaInput = document.getElementById("artistaInput");
  const editIndexInput = document.getElementById("editIndex");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnCancelar = document.getElementById("btnCancelar");
  const tabelaCorpo = document.getElementById("tabelaCorpo");
  const contadorItens = document.getElementById("contadorItens");
  const formFeedback = document.getElementById("formFeedback");
  const emptyState = document.getElementById("emptyState");
  const btnRestaurar = document.getElementById("btnRestaurar");
  const btnRecarregarVazio = document.getElementById("btnRecarregarVazio");

  /**
   * Renderiza as músicas fictícias na tabela HTML.
   */
  function renderizarTabela() {
    tabelaCorpo.innerHTML = "";

    const total = listaMusicasDemo.length;
    contadorItens.textContent = `Total: ${total} ${total === 1 ? "faixa" : "faixas"}`;

    if (total === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    listaMusicasDemo.forEach((musica, index) => {
      const tr = document.createElement("tr");

      // ID fictício
      const tdId = document.createElement("td");
      tdId.textContent = `#${musica.id}`;
      tdId.style.fontWeight = "600";
      tdId.style.color = "var(--text-muted)";
      tr.appendChild(tdId);

      // Título
      const tdTitulo = document.createElement("td");
      tdTitulo.textContent = musica.titulo;
      tdTitulo.style.fontWeight = "500";
      tr.appendChild(tdTitulo);

      // Artista
      const tdArtista = document.createElement("td");
      tdArtista.textContent = musica.artista;
      tr.appendChild(tdArtista);

      // Tag de demonstração
      const tdOrigem = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "badge-demo-tag";
      badge.textContent = "Fictício (Demo)";
      tdOrigem.appendChild(badge);
      tr.appendChild(tdOrigem);

      // Botões de ação visual
      const tdAcoes = document.createElement("td");
      tdAcoes.className = "actions-cell";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "btn btn-action btn-edit";
      btnEdit.textContent = "Editar";
      btnEdit.title = "Carregar dados no formulário (simulação)";
      btnEdit.addEventListener("click", () => iniciarEdicao(index));
      tdAcoes.appendChild(btnEdit);

      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn btn-action btn-delete";
      btnDel.textContent = "Excluir";
      btnDel.title = "Remover da lista visual de demonstração";
      btnDel.addEventListener("click", () => removerItem(index));
      tdAcoes.appendChild(btnDel);

      tr.appendChild(tdAcoes);
      tabelaCorpo.appendChild(tr);
    });
  }

  /**
   * Exibe mensagens temporárias de feedback para ações de simulação.
   */
  function exibirFeedback(mensagem, tipo = "success") {
    formFeedback.textContent = mensagem;
    formFeedback.className = `feedback-msg ${tipo}`;

    setTimeout(() => {
      formFeedback.textContent = "";
      formFeedback.className = "feedback-msg";
    }, 3500);
  }

  /**
   * Prepara o formulário para editar um item existente (apenas em memória).
   */
  function iniciarEdicao(index) {
    const item = listaMusicasDemo[index];
    if (!item) return;

    tituloInput.value = item.titulo;
    artistaInput.value = item.artista;
    editIndexInput.value = index;

    btnSalvar.textContent = "Atualizar Música (Demo)";
    btnCancelar.textContent = "Cancelar Edição";
    tituloInput.focus();

    exibirFeedback(`Carregado para edição demonstrativa: "${item.titulo}"`, "success");
  }

  /**
   * Limpa os campos do formulário e redefine para o modo de adição.
   */
  function limparFormulario() {
    formMusica.reset();
    editIndexInput.value = "-1";
    btnSalvar.textContent = "Adicionar Música (Demo)";
    btnCancelar.textContent = "Limpar";
  }

  /**
   * Remove um item da lista visual em memória.
   */
  function removerItem(index) {
    const removido = listaMusicasDemo[index];
    if (!removido) return;

    listaMusicasDemo.splice(index, 1);
    renderizarTabela();
    exibirFeedback(`Faixa demonstrativa "${removido.titulo}" removida da visualização.`, "success");

    // Se estava editando o item removido, limpa formulário
    if (parseInt(editIndexInput.value, 10) === index) {
      limparFormulario();
    }
  }

  /**
   * Restaura os dados fictícios originais de teste.
   */
  function restaurarDadosPadrao() {
    listaMusicasDemo = JSON.parse(JSON.stringify(DADOS_INICIAIS_DEMO));
    limparFormulario();
    renderizarTabela();
    exibirFeedback("Dados fictícios padrão restaurados com sucesso!", "success");
  }

  /**
   * Manipulador do envio do formulário (simulação puramente visual).
   */
  formMusica.addEventListener("submit", function (event) {
    event.preventDefault();

    const titulo = tituloInput.value.trim();
    const artista = artistaInput.value.trim();

    if (!titulo || !artista) {
      exibirFeedback("Por favor, preencha o Título e o Artista da música.", "error");
      return;
    }

    const editIndex = parseInt(editIndexInput.value, 10);

    if (editIndex >= 0 && editIndex < listaMusicasDemo.length) {
      // Atualização simulada
      listaMusicasDemo[editIndex].titulo = titulo;
      listaMusicasDemo[editIndex].artista = artista;
      exibirFeedback(`Faixa demonstrativa #${listaMusicasDemo[editIndex].id} atualizada na interface!`, "success");
    } else {
      // Adição simulada
      const novaMusicaDemo = {
        id: proximoIdFicticio++,
        titulo: titulo,
        artista: artista
      };
      listaMusicasDemo.push(novaMusicaDemo);
      exibirFeedback(`Música "${titulo}" adicionada à lista visual de demonstração!`, "success");
    }

    limparFormulario();
    renderizarTabela();
  });

  btnCancelar.addEventListener("click", function () {
    limparFormulario();
  });

  btnRestaurar.addEventListener("click", function () {
    restaurarDadosPadrao();
  });

  btnRecarregarVazio.addEventListener("click", function () {
    restaurarDadosPadrao();
  });

  // Inicialização ao carregar a página
  renderizarTabela();
})();
