/**
 * ============================================================================
 * Playlist de Músicas - Gestão via API REST (AP1)
 * JavaScript Puro (Vanilla JS)
 * 
 * Integração baseada estritamente na collection Bruno validada:
 * - GET    /api/musicas       -> Listar músicas (200 OK)
 * - GET    /api/musicas/{id}  -> Buscar música por ID (200 OK ou 404)
 * - POST   /api/musicas       -> Cadastrar música (201 Created)
 * - PUT    /api/musicas/{id}  -> Atualizar música (200 OK ou 404)
 * - DELETE /api/musicas/{id}  -> Remover música (204 No Content ou 404)
 * ============================================================================
 */

'use strict';

(function () {
    // Determina a URL base da API a partir do host ou do padrão da collection Bruno (http://localhost:5050)
    const API_BASE_URL = (window.location.origin && window.location.origin.startsWith('http') && window.location.port === '5050')
        ? '/api/musicas'
        : 'http://localhost:5050/api/musicas';

    // Elementos do DOM
    const apiUrlDisplay = document.getElementById('api-url-display');
    const formCard = document.querySelector('.form-section');
    const formMusica = document.getElementById('form-musica');
    const formHeading = document.getElementById('form-heading');
    const formModeBadge = document.getElementById('form-mode-badge');
    const inputMusicaId = document.getElementById('musica-id');
    const inputTitulo = document.getElementById('titulo');
    const inputArtista = document.getElementById('artista');
    const btnSubmit = document.getElementById('btn-submit');
    const btnSubmitText = document.getElementById('btn-submit-text');
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    const btnLimpar = document.getElementById('btn-limpar');
    const formFeedback = document.getElementById('form-feedback');

    const btnRecarregar = document.getElementById('btn-recarregar');
    const btnTentarNovamente = document.getElementById('btn-tentar-novamente');
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const tableWrapper = document.getElementById('table-wrapper');
    const tbodyLista = document.getElementById('lista-musicas-tbody');
    const contadorBadge = document.getElementById('contador-musicas');

    const globalAlert = document.getElementById('global-alert');
    const globalAlertIcon = document.getElementById('global-alert-icon');
    const globalAlertText = document.getElementById('global-alert-text');
    const btnFecharAlerta = document.getElementById('btn-fechar-alerta');

    // Inicializa o badge de endpoint
    if (apiUrlDisplay) {
        apiUrlDisplay.textContent = API_BASE_URL;
    }

    /**
     * Exibe alerta global no topo da página
     */
    let timeoutAlerta = null;
    function exibirAlerta(texto, tipo = 'info', icone = 'ℹ️') {
        if (timeoutAlerta) clearTimeout(timeoutAlerta);

        globalAlertText.textContent = texto;
        globalAlertIcon.textContent = icone;
        globalAlert.className = `alert-banner alert-${tipo}`;
        globalAlert.style.display = 'flex';

        timeoutAlerta = setTimeout(() => {
            fecharAlerta();
        }, 5000);
    }

    function fecharAlerta() {
        if (timeoutAlerta) clearTimeout(timeoutAlerta);
        globalAlert.style.display = 'none';
        globalAlertText.textContent = '';
    }

    if (btnFecharAlerta) {
        btnFecharAlerta.addEventListener('click', fecharAlerta);
    }

    /**
     * Exibe feedback logo abaixo do formulário
     */
    let timeoutFeedback = null;
    function exibirFeedback(texto, tipo = 'success') {
        if (timeoutFeedback) clearTimeout(timeoutFeedback);

        formFeedback.textContent = texto;
        formFeedback.className = `feedback-msg show feedback-${tipo}`;

        timeoutFeedback = setTimeout(() => {
            formFeedback.className = 'feedback-msg';
            formFeedback.textContent = '';
        }, 4000);
    }

    /**
     * Controla os estados de carregamento e botões
     */
    function definirCarregando(carregando) {
        btnSubmit.disabled = carregando;
        btnRecarregar.disabled = carregando;
        btnLimpar.disabled = carregando;
        btnCancelarEdicao.disabled = carregando;

        if (carregando) {
            loadingState.style.display = 'block';
            errorState.style.display = 'none';
            emptyState.style.display = 'none';
            tableWrapper.style.display = 'none';
        } else {
            loadingState.style.display = 'none';
        }
    }

    /**
     * Retorna o formulário para o modo de cadastro (novo registro)
     */
    function resetarModoFormulario() {
        formMusica.reset();
        inputMusicaId.value = '';
        formHeading.textContent = 'Cadastrar Nova Música';
        formModeBadge.textContent = 'Novo Registro';
        formModeBadge.className = 'badge-mode badge-create';
        btnSubmitText.textContent = 'Cadastrar Música';
        btnCancelarEdicao.style.display = 'none';
        formCard.classList.remove('is-editing');
    }

    /**
     * Define o formulário no modo de edição para o ID indicado
     */
    function ativarModoEdicao(id, titulo, artista) {
        inputMusicaId.value = String(id);
        inputTitulo.value = titulo;
        inputArtista.value = artista;

        formHeading.textContent = 'Editar Música';
        formModeBadge.textContent = `Editando #${id}`;
        formModeBadge.className = 'badge-mode badge-edit';
        btnSubmitText.textContent = 'Salvar Alterações';
        btnCancelarEdicao.style.display = 'inline-flex';
        formCard.classList.add('is-editing');

        inputTitulo.focus();
    }

    /**
     * [GET /api/musicas] Lista todas as músicas da API
     */
    async function carregarMusicas() {
        definirCarregando(true);

        try {
            const resposta = await fetch(API_BASE_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!resposta.ok) {
                throw new Error(`Erro na API: HTTP ${resposta.status} ${resposta.statusText}`);
            }

            const musicas = await resposta.json();
            renderizarTabela(musicas);
        } catch (erro) {
            console.error('Falha ao listar músicas:', erro);
            tbodyLista.innerHTML = '';
            tableWrapper.style.display = 'none';
            emptyState.style.display = 'none';
            errorState.style.display = 'block';
            errorMessage.textContent = `Não foi possível carregar a lista: ${erro.message}. Verifique se a API está em execução em ${API_BASE_URL}.`;
            contadorBadge.textContent = '0 faixas';
        } finally {
            definirCarregando(false);
        }
    }

    /**
     * Renderiza as linhas da tabela inserindo os valores com textContent
     */
    function renderizarTabela(musicas) {
        tbodyLista.innerHTML = '';

        if (!Array.isArray(musicas) || musicas.length === 0) {
            tableWrapper.style.display = 'none';
            errorState.style.display = 'none';
            emptyState.style.display = 'block';
            contadorBadge.textContent = '0 faixas';
            return;
        }

        emptyState.style.display = 'none';
        errorState.style.display = 'none';
        tableWrapper.style.display = 'block';

        const total = musicas.length;
        contadorBadge.textContent = `${total} ${total === 1 ? 'faixa' : 'faixas'}`;

        musicas.forEach((musica) => {
            const tr = document.createElement('tr');

            // Célula ID
            const tdId = document.createElement('td');
            const spanId = document.createElement('span');
            spanId.className = 'id-badge';
            spanId.textContent = `#${musica.id}`;
            tdId.appendChild(spanId);
            tr.appendChild(tdId);

            // Célula Título (inserida exclusivamente via textContent)
            const tdTitulo = document.createElement('td');
            const spanTitulo = document.createElement('span');
            spanTitulo.className = 'song-title';
            spanTitulo.textContent = musica.titulo || '';
            tdTitulo.appendChild(spanTitulo);
            tr.appendChild(tdTitulo);

            // Célula Artista (inserida exclusivamente via textContent)
            const tdArtista = document.createElement('td');
            const spanArtista = document.createElement('span');
            spanArtista.className = 'song-artist';
            spanArtista.textContent = musica.artista || '';
            tdArtista.appendChild(spanArtista);
            tr.appendChild(tdArtista);

            // Célula de Ações (Editar e Excluir)
            const tdAcoes = document.createElement('td');
            const divAcoes = document.createElement('div');
            divAcoes.className = 'actions-cell';

            // Botão Editar
            const btnEditar = document.createElement('button');
            btnEditar.type = 'button';
            btnEditar.className = 'btn-action-edit';
            btnEditar.textContent = 'Editar';
            btnEditar.title = `Editar música #${musica.id}`;
            btnEditar.addEventListener('click', () => {
                buscarMusicaParaEdicao(musica.id);
            });

            // Botão Excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.type = 'button';
            btnExcluir.className = 'btn-action-delete';
            btnExcluir.textContent = 'Excluir';
            btnExcluir.title = `Remover música #${musica.id}`;
            btnExcluir.addEventListener('click', () => {
                removerMusica(musica.id, musica.titulo);
            });

            divAcoes.appendChild(btnEditar);
            divAcoes.appendChild(btnExcluir);
            tdAcoes.appendChild(divAcoes);
            tr.appendChild(tdAcoes);

            tbodyLista.appendChild(tr);
        });
    }

    /**
     * [GET /api/musicas/{id}] Busca os detalhes de uma música pelo ID para preencher a edição
     */
    async function buscarMusicaParaEdicao(id) {
        try {
            btnSubmit.disabled = true;
            exibirAlerta(`Buscando dados da música #${id}...`, 'info', '🔍');

            const resposta = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (resposta.status === 404) {
                exibirAlerta(`Música #${id} não foi encontrada na API (HTTP 404).`, 'error', '⚠️');
                await carregarMusicas();
                return;
            }

            if (!resposta.ok) {
                throw new Error(`HTTP ${resposta.status} ${resposta.statusText}`);
            }

            const musica = await resposta.json();
            ativarModoEdicao(musica.id, musica.titulo, musica.artista);
            exibirAlerta(`Editando dados da música #${id}. Altere os campos e clique em Salvar.`, 'info', '✏️');
        } catch (erro) {
            console.error('Falha ao buscar detalhes:', erro);
            exibirAlerta(`Erro ao buscar dados da música #${id}: ${erro.message}`, 'error', '⚠️');
        } finally {
            btnSubmit.disabled = false;
        }
    }

    /**
     * [POST /api/musicas] Cadastra uma nova música
     */
    async function cadastrarMusica(dados) {
        btnSubmit.disabled = true;
        btnSubmitText.textContent = 'Cadastrando...';

        try {
            const resposta = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            if (resposta.status === 201) {
                const novaMusica = await resposta.json();
                exibirFeedback(`Música "${novaMusica.titulo}" cadastrada com sucesso! (HTTP 201 Created)`, 'success');
                exibirAlerta(`Nova faixa #${novaMusica.id} gravada na API com sucesso!`, 'success', '✅');
                resetarModoFormulario();
                await carregarMusicas(); // Atualiza a lista após gravação
            } else {
                throw new Error(`Falha no cadastro (HTTP ${resposta.status} ${resposta.statusText})`);
            }
        } catch (erro) {
            console.error('Falha ao cadastrar:', erro);
            exibirFeedback(`Erro ao cadastrar: ${erro.message}`, 'error');
            exibirAlerta(`Erro no cadastro: ${erro.message}`, 'error', '❌');
        } finally {
            btnSubmit.disabled = false;
            btnSubmitText.textContent = 'Cadastrar Música';
        }
    }

    /**
     * [PUT /api/musicas/{id}] Atualiza uma música existente
     */
    async function atualizarMusica(id, dados) {
        btnSubmit.disabled = true;
        btnSubmitText.textContent = 'Salvando...';

        try {
            const resposta = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(dados)
            });

            if (resposta.status === 200) {
                const atualizada = await resposta.json();
                exibirFeedback(`Música #${atualizada.id} atualizada com sucesso! (HTTP 200 OK)`, 'success');
                exibirAlerta(`Alterações da música #${atualizada.id} salvas com sucesso!`, 'success', '✅');
                resetarModoFormulario();
                await carregarMusicas(); // Atualiza a lista após gravação
            } else if (resposta.status === 404) {
                exibirFeedback(`Música #${id} não encontrada para atualização (HTTP 404 Not Found).`, 'error');
                exibirAlerta(`Música #${id} não encontrada na API (HTTP 404).`, 'error', '⚠️');
                await carregarMusicas();
            } else {
                throw new Error(`Falha na atualização (HTTP ${resposta.status} ${resposta.statusText})`);
            }
        } catch (erro) {
            console.error('Falha ao atualizar:', erro);
            exibirFeedback(`Erro ao atualizar: ${erro.message}`, 'error');
            exibirAlerta(`Erro ao atualizar música #${id}: ${erro.message}`, 'error', '❌');
        } finally {
            btnSubmit.disabled = false;
            if (inputMusicaId.value) {
                btnSubmitText.textContent = 'Salvar Alterações';
            } else {
                btnSubmitText.textContent = 'Cadastrar Música';
            }
        }
    }

    /**
     * [DELETE /api/musicas/{id}] Remove uma música
     */
    async function removerMusica(id, titulo) {
        const confirmacao = window.confirm(`Deseja realmente remover a música "${titulo}" (ID #${id}) da API?`);
        if (!confirmacao) return;

        try {
            exibirAlerta(`Removendo música #${id}...`, 'info', '⏳');

            const resposta = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });

            if (resposta.status === 204) {
                exibirAlerta(`Música #${id} excluída com sucesso! (HTTP 204 No Content)`, 'success', '🗑️');
                
                // Se a música que acabou de ser excluída estava sendo editada no formulário, cancela o modo de edição
                if (inputMusicaId.value === String(id)) {
                    resetarModoFormulario();
                }

                await carregarMusicas(); // Atualiza a lista após remoção
            } else if (resposta.status === 404) {
                exibirAlerta(`A música #${id} não foi encontrada na API (HTTP 404 Not Found).`, 'error', '⚠️');
                await carregarMusicas();
            } else {
                throw new Error(`Erro ao excluir (HTTP ${resposta.status} ${resposta.statusText})`);
            }
        } catch (erro) {
            console.error('Falha ao remover:', erro);
            exibirAlerta(`Falha ao remover música #${id}: ${erro.message}`, 'error', '❌');
        }
    }

    /**
     * Tratamento da submissão do formulário (Criar ou Atualizar)
     */
    formMusica.addEventListener('submit', function (evento) {
        evento.preventDefault();

        const titulo = inputTitulo.value.trim();
        const artista = inputArtista.value.trim();

        if (!titulo || !artista) {
            exibirFeedback('Preencha os campos obrigatórios: Título e Artista.', 'error');
            return;
        }

        const payload = {
            titulo: titulo,
            artista: artista
        };

        const idEdicao = inputMusicaId.value;

        if (idEdicao) {
            // Modo de Atualização (PUT)
            atualizarMusica(parseInt(idEdicao, 10), payload);
        } else {
            // Modo de Cadastro (POST)
            cadastrarMusica(payload);
        }
    });

    /**
     * Cancelar modo de edição
     */
    btnCancelarEdicao.addEventListener('click', function () {
        resetarModoFormulario();
        exibirFeedback('Edição cancelada.', 'success');
        fecharAlerta();
    });

    /**
     * Botão Limpar
     */
    btnLimpar.addEventListener('click', function () {
        if (inputMusicaId.value) {
            inputTitulo.value = '';
            inputArtista.value = '';
            inputTitulo.focus();
        } else {
            formMusica.reset();
            inputTitulo.focus();
        }
    });

    /**
     * Ações de recarregamento
     */
    btnRecarregar.addEventListener('click', carregarMusicas);
    btnTentarNovamente.addEventListener('click', carregarMusicas);

    // Inicialização da interface: carrega os dados reais da API
    carregarMusicas();
})();
