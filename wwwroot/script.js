/**
 * ==============================================================================
 * Integração da Interface com a API de Músicas (Projeto AP1)
 * ==============================================================================
 * Conexão direta com os endpoints REST:
 * - GET    /api/musicas       -> Listar todas as músicas
 * - GET    /api/musicas/{id}  -> Buscar detalhes por ID
 * - POST   /api/musicas       -> Cadastrar nova música
 * - PUT    /api/musicas/{id}  -> Atualizar música existente
 * - DELETE /api/musicas/{id}  -> Remover música existente
 *
 * Diretrizes de Segurança e Acessibilidade:
 * - Inserção de valores dinâmicos estritamente via `textContent`.
 * - Sem dados fictícios: dados consumidos diretamente do banco via API.
 * - Tratamento de status HTTP, estados de carregamento, erros e lista vazia.
 * ==============================================================================
 */

(function () {
  "use strict";

  // URL base dos endpoints da API
  const API_URL = "/api/musicas";

  // Elementos do DOM
  const formMusica = document.getElementById("formMusica");
  const musicaIdInput = document.getElementById("musicaId");
  const tituloInput = document.getElementById("tituloInput");
  const artistaInput = document.getElementById("artistaInput");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnCancelar = document.getElementById("btnCancelar");
  const formFeedback = document.getElementById("formFeedback");
  const formTitle = document.getElementById("form-title");
  const formDescription = document.getElementById("formDescription");
  const modoFormTag = document.getElementById("modoFormTag");

  const btnAtualizarLista = document.getElementById("btnAtualizarLista");
  const contadorItens = document.getElementById("contadorItens");
  const loadingIndicator = document.getElementById("loadingIndicator");
  const tabelaContainer = document.getElementById("tabelaContainer");
  const tabelaCorpo = document.getElementById("tabelaCorpo");
  const emptyState = document.getElementById("emptyState");
  const emptyStateMsg = document.getElementById("emptyStateMsg");

  const globalNotification = document.getElementById("globalNotification");
  const globalNotificationText = document.getElementById("globalNotificationText");
  const btnFecharNotificacao = document.getElementById("btnFecharNotificacao");

  let timeoutFeedback = null;
  let timeoutGlobalNotif = null;

  /**
   * Exibe notificação de feedback contextual no formulário.
   * Utiliza textContent para inserção segura do texto.
   */
  function exibirFeedbackForm(mensagem, tipo = "success") {
    if (timeoutFeedback) clearTimeout(timeoutFeedback);

    formFeedback.textContent = mensagem;
    formFeedback.className = `feedback-msg ${tipo}`;
    formFeedback.style.display = "block";

    timeoutFeedback = setTimeout(() => {
      formFeedback.textContent = "";
      formFeedback.style.display = "none";
      formFeedback.className = "feedback-msg";
    }, 4500);
  }

  /**
   * Exibe alerta global no topo da página.
   * Utiliza textContent para inserção segura do texto.
   */
  function exibirNotificacaoGlobal(mensagem, tipo = "error") {
    if (timeoutGlobalNotif) clearTimeout(timeoutGlobalNotif);

    globalNotificationText.textContent = mensagem;
    globalNotification.className = `notification-box ${tipo}`;
    globalNotification.style.display = "flex";

    timeoutGlobalNotif = setTimeout(() => {
      ocultarNotificacaoGlobal();
    }, 6000);
  }

  function ocultarNotificacaoGlobal() {
    globalNotification.style.display = "none";
    globalNotificationText.textContent = "";
  }

  btnFecharNotificacao.addEventListener("click", ocultarNotificacaoGlobal);

  /**
   * Alterna a visibilidade do indicador de carregamento.
   */
  function definirCarregando(carregando) {
    if (carregando) {
      loadingIndicator.style.display = "flex";
      tabelaContainer.style.display = "none";
      emptyState.style.display = "none";
      btnAtualizarLista.disabled = true;
    } else {
      loadingIndicator.style.display = "none";
      btnAtualizarLista.disabled = false;
    }
  }

  /**
   * Desabilita/habilita botões do formulário durante gravação.
   */
  function definirGravando(gravando) {
    btnSalvar.disabled = gravando;
    btnCancelar.disabled = gravando;
    tituloInput.disabled = gravando;
    artistaInput.disabled = gravando;
  }

  /**
   * Redefine o formulário para o modo de cadastro (criação).
   */
  function resetarFormulario() {
    formMusica.reset();
    musicaIdInput.value = "";

    formTitle.textContent = "Cadastrar Música";
    formDescription.textContent = "Preencha os campos abaixo para cadastrar uma nova música na playlist.";
    modoFormTag.textContent = "Novo";
    modoFormTag.className = "tag-badge tag-create";

    btnSalvar.textContent = "Cadastrar Música";
    btnCancelar.textContent = "Limpar";
  }

  /**
   * Carrega os dados de uma música existente no formulário para edição.
   */
  function carregarParaEdicao(musica) {
    musicaIdInput.value = musica.id;
    tituloInput.value = musica.titulo;
    artistaInput.value = musica.artista;

    formTitle.textContent = `Editar Música #${musica.id}`;
    formDescription.textContent = `Modifique os campos abaixo e clique em Salvar Alterações para enviar o PUT para a API.`;
    modoFormTag.textContent = "Edição";
    modoFormTag.className = "tag-badge tag-edit";

    btnSalvar.textContent = "Salvar Alterações";
    btnCancelar.textContent = "Cancelar Edição";

    tituloInput.focus();
    exibirFeedbackForm(`Editando música #${musica.id}: "${musica.titulo}"`, "success");
  }

  /**
   * Renderiza a listagem de músicas recebida da API.
   * Utiliza textContent para inserir todos os dados dinâmicos.
   */
  function renderizarTabela(musicas) {
    tabelaCorpo.textContent = ""; // Limpa o corpo da tabela com segurança

    const total = musicas.length;
    contadorItens.textContent = `Total: ${total} ${total === 1 ? "música" : "músicas"}`;

    if (total === 0) {
      tabelaContainer.style.display = "none";
      emptyState.style.display = "block";
      emptyStateMsg.textContent = "Nenhuma música cadastrada no banco de dados.";
      return;
    }

    emptyState.style.display = "none";
    tabelaContainer.style.display = "block";

    musicas.forEach((musica) => {
      const tr = document.createElement("tr");

      // Coluna ID
      const tdId = document.createElement("td");
      tdId.textContent = `#${musica.id}`;
      tdId.style.fontWeight = "600";
      tdId.style.color = "var(--text-muted)";
      tr.appendChild(tdId);

      // Coluna Título
      const tdTitulo = document.createElement("td");
      tdTitulo.textContent = musica.titulo;
      tdTitulo.style.fontWeight = "500";
      tr.appendChild(tdTitulo);

      // Coluna Artista
      const tdArtista = document.createElement("td");
      tdArtista.textContent = musica.artista;
      tr.appendChild(tdArtista);

      // Coluna Ações
      const tdAcoes = document.createElement("td");
      tdAcoes.className = "actions-cell";

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.className = "btn btn-action btn-edit";
      btnEdit.textContent = "Editar";
      btnEdit.title = `Editar dados da música #${musica.id}`;
      btnEdit.addEventListener("click", () => carregarParaEdicao(musica));
      tdAcoes.appendChild(btnEdit);

      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.className = "btn btn-action btn-delete";
      btnDelete.textContent = "Excluir";
      btnDelete.title = `Excluir música #${musica.id} do banco de dados`;
      btnDelete.addEventListener("click", () => excluirMusica(musica.id, musica.titulo));
      tdAcoes.appendChild(btnDelete);

      tr.appendChild(tdAcoes);
      tabelaCorpo.appendChild(tr);
    });
  }

  /**
   * FLUXO 1: Listar músicas da API (GET /api/musicas).
   */
  async function carregarMusicas() {
    definirCarregando(true);
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Falha na requisição: HTTP ${response.status} (${response.statusText || "Erro do servidor"})`);
      }

      const dados = await response.json();

      if (!Array.isArray(dados)) {
        throw new Error("Formato de resposta inesperado da API (esperava-se um array JSON).");
      }

      renderizarTabela(dados);
    } catch (erro) {
      tabelaContainer.style.display = "none";
      emptyState.style.display = "block";
      emptyStateMsg.textContent = "Não foi possível carregar a lista de músicas.";
      contadorItens.textContent = "Erro de conexão";

      exibirNotificacaoGlobal(`Erro ao listar músicas da API: ${erro.message}`, "error");
    } finally {
      definirCarregando(false);
    }
  }

  /**
   * FLUXO 2: Cadastrar nova música na API (POST /api/musicas).
   */
  async function cadastrarMusica(titulo, artista) {
    definirGravando(true);
    btnSalvar.textContent = "Cadastrando...";

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          titulo: titulo,
          artista: artista
        })
      });

      if (response.status === 201) {
        const novaMusica = await response.json();
        exibirFeedbackForm(`Música #${novaMusica.id} ("${novaMusica.titulo}") cadastrada com sucesso! [HTTP 201 Created]`, "success");
        resetarFormulario();
        await carregarMusicas();
      } else {
        const textoErro = await response.text();
        throw new Error(`Erro na API [HTTP ${response.status}]: ${textoErro || response.statusText}`);
      }
    } catch (erro) {
      exibirFeedbackForm(`Falha ao cadastrar: ${erro.message}`, "error");
      exibirNotificacaoGlobal(`Erro no cadastro: ${erro.message}`, "error");
    } finally {
      definirGravando(false);
      btnSalvar.textContent = "Cadastrar Música";
    }
  }

  /**
   * FLUXO 3: Atualizar música existente na API (PUT /api/musicas/{id}).
   */
  async function atualizarMusica(id, titulo, artista) {
    definirGravando(true);
    btnSalvar.textContent = "Atualizando...";

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          titulo: titulo,
          artista: artista
        })
      });

      if (response.status === 200) {
        const musicaAtualizada = await response.json();
        exibirFeedbackForm(`Música #${musicaAtualizada.id} atualizada com sucesso! [HTTP 200 OK]`, "success");
        resetarFormulario();
        await carregarMusicas();
      } else if (response.status === 404) {
        throw new Error(`Música #${id} não foi encontrada no banco de dados [HTTP 404 Not Found].`);
      } else {
        const textoErro = await response.text();
        throw new Error(`Erro na API [HTTP ${response.status}]: ${textoErro || response.statusText}`);
      }
    } catch (erro) {
      exibirFeedbackForm(`Falha ao atualizar: ${erro.message}`, "error");
      exibirNotificacaoGlobal(`Erro na atualização: ${erro.message}`, "error");
    } finally {
      definirGravando(false);
      btnSalvar.textContent = "Salvar Alterações";
    }
  }

  /**
   * FLUXO 4: Excluir música da API (DELETE /api/musicas/{id}).
   */
  async function excluirMusica(id, titulo) {
    const confirmacao = window.confirm(`Deseja realmente remover a música #${id} ("${titulo}") do banco de dados?`);
    if (!confirmacao) return;

    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });

      if (response.status === 204) {
        exibirFeedbackForm(`Música #${id} ("${titulo}") removida com sucesso! [HTTP 204 NoContent]`, "success");
        
        // Se a música excluída estava sendo editada no formulário, limpa o formulário
        if (musicaIdInput.value === String(id)) {
          resetarFormulario();
        }

        await carregarMusicas();
      } else if (response.status === 404) {
        throw new Error(`A música #${id} não foi encontrada para exclusão [HTTP 404 Not Found].`);
      } else {
        const textoErro = await response.text();
        throw new Error(`Erro na API [HTTP ${response.status}]: ${textoErro || response.statusText}`);
      }
    } catch (erro) {
      exibirFeedbackForm(`Falha ao excluir: ${erro.message}`, "error");
      exibirNotificacaoGlobal(`Erro na exclusão: ${erro.message}`, "error");
    }
  }

  /**
   * Envio do formulário (Decide entre cadastrar ou atualizar).
   */
  formMusica.addEventListener("submit", async function (event) {
    event.preventDefault();

    const titulo = tituloInput.value.trim();
    const artista = artistaInput.value.trim();

    if (!titulo || !artista) {
      exibirFeedbackForm("Preencha todos os campos obrigatórios (Título e Artista).", "error");
      return;
    }

    const idAtual = musicaIdInput.value.trim();

    if (idAtual) {
      // Modo Edição (PUT)
      await atualizarMusica(idAtual, titulo, artista);
    } else {
      // Modo Criação (POST)
      await cadastrarMusica(titulo, artista);
    }
  });

  /**
   * Botão Cancelar / Limpar.
   */
  btnCancelar.addEventListener("click", function () {
    resetarFormulario();
    formFeedback.textContent = "";
    formFeedback.style.display = "none";
  });

  /**
   * Botão manual de Atualizar Lista.
   */
  btnAtualizarLista.addEventListener("click", function () {
    carregarMusicas();
  });

  // Carrega a listagem inicial ao abrir a página
  carregarMusicas();
})();
