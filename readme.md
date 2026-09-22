# API Playlists - Gerenciamento de Músicas

API REST minimalista para gerenciamento de playlists de músicas, desenvolvida com **ASP.NET Core** e **.NET 10**.

## Objetivo

Esta aplicação foi desenvolvida como parte da avaliação AP1 da disciplina. O objetivo é fornecer um CRUD completo em memória para manipular registros de músicas (compostos por ID, Título e Artista).

## Requisitos

* [.NET 10 SDK](https://dotnet.microsoft.com/) instalado no sistema.

## Como Executar

1. Abra o terminal na raiz do repositório.
2. Execute o comando para iniciar a API na porta local `5050`:

```bash
dotnet run --urls http://localhost:5050

## Endpoints da API

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| **GET** | `/` | Verifica se a API está no ar |
| **GET** | `/api/musicas` | Lista todas as músicas cadastradas |
| **GET** | `/api/musicas/{id}` | Busca os detalhes de uma música pelo ID |
| **POST** | `/api/musicas` | Cadastra uma nova música |
| **PUT** | `/api/musicas/{id}` | Atualiza os dados de uma música existente pelo ID |
| **DELETE** | `/api/musicas/{id}` | Remove uma música pelo ID |
