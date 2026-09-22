# API Playlists

API REST minimalista para gerenciamento de playlists de músicas, desenvolvida com **ASP.NET Core** e **.NET 10**.

## Requisitos

* [.NET 10 SDK](https://dotnet.microsoft.com/) instalado no sistema.

## Como Executar

1. Abra o terminal na raiz do repositório.
2. Execute o comando para iniciar a API na porta local `5050`:

bash
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

---

---

### Listar músicas

```bash
GET /api/musicas
```

### Buscar música por ID

```bash
GET /api/musicas/1
```

### Cadastrar música

```bash
POST /api/musicas
Content-Type: application/json

{
  "titulo": "My hero",
  "artista": "Foo fighters"
}
```

### Atualizar música

```bash
PUT /api/musicas/1
Content-Type: application/json

{
  "titulo": "In bloom - Live",
  "artista": "Nirvana"
}
```

### Remover música

```bash
DELETE /api/musicas/1
```
## Observações

* A aplicação inicia com as músicas `In Bloom` e `My Hero`.
* Os dados ficam armazenados somente em memória e são perdidos ao reiniciar a aplicação.
* Operações para um ID inexistente retornam HTTP `404 Not Found`.
* O cadastro retorna HTTP `201 Created` e a remoção bem-sucedida retorna HTTP `204 No Content`.
=======
# API Playlists - Gerenciamento de Músicas

API REST minimalista para gerenciamento de playlists de músicas, desenvolvida com **ASP.NET Core** e **.NET 10**.

## Objetivo

Esta aplicação foi desenvolvida como parte da avaliação AP1 da disciplina. O objetivo é fornecer um CRUD completo em memória para manipular registros de músicas (compostos por ID, Título e Artista).

## Requisitos

* [.NET 10 SDK](https://dotnet.microsoft.com/) instalado no sistema.

## Como Executar

1. Abra o terminal na raiz do repositório.
2. Execute o comando para iniciar a API na porta local `5050`:

bash
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

---

---

### Listar músicas

```bash
GET /api/musicas
```

### Buscar música por ID

```bash
GET /api/musicas/1
```

### Cadastrar música

```bash
POST /api/musicas
Content-Type: application/json

{
  "titulo": "My hero",
  "artista": "Foo fighters"
}
```

### Atualizar música

```bash
PUT /api/musicas/1
Content-Type: application/json

{
  "titulo": "In bloom - Live",
  "artista": "Nirvana"
}
```

### Remover música

```bash
DELETE /api/musicas/1
```
## Observações

* A aplicação inicia com as músicas `In Bloom` e `My Hero`.
* Os dados ficam armazenados somente em memória e são perdidos ao reiniciar a aplicação.
* Operações para um ID inexistente retornam HTTP `404 Not Found`.
* O cadastro retorna HTTP `201 Created` e a remoção bem-sucedida retorna HTTP `204 No Content`.

## Vídeo de Demonstração

[Vídeo de demonstração](https://drive.google.com/file/d/1dW4hdHI181M-pTSArmDzKzr32G-oTR_t/view?usp=sharing)
