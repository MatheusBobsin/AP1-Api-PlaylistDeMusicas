var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var musicas = new List<MusicaDto>
{
    new MusicaDto(1, "In Bloom", "Nirvana"),
    new MusicaDto(2, "My hero", "Foo Fighters"),
};

app.MapGet("/", () => "API da playlist de músicas está no ar");

app.MapGet("/api/musicas", () =>
{
    return Results.Ok(musicas);
});

app.MapGet("/api/musicas/{id:int}", (int id) =>
{
    var musica = musicas.Find(musicaDaLista => musicaDaLista.Id == id);

    if (musica is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(musica);
});

app.MapPost("/api/musicas", (MusicaEntradaDto dados) =>
{
    int proximoId = musicas.Count + 1;

    var novaMusica = new MusicaDto(proximoId, dados.Titulo, dados.Artista);

    musicas.Add(novaMusica);

    return Results.Created($"/api/musicas/{novaMusica.Id}", novaMusica);
});

app.MapPut("/api/musicas/{id:int}", (int id, MusicaEntradaDto dados) => 
{
    int indice = musicas.FindIndex(musicaDaLista => musicaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound();
    }

    var musicaAtualizada = new MusicaDto(id, dados.Titulo, dados.Artista);

    musicas[indice] = musicaAtualizada;

    return Results.Ok(musicaAtualizada);
});

app.MapDelete("/api/musicas/{id:int}", (int id) => 
{
    int indice = musicas.FindIndex(musicaDaLista => musicaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound();
    }
    musicas.RemoveAt(indice);
    return Results.NoContent();
});

app.Run();

record MusicaDto(int Id, string Titulo, string Artista);
record MusicaEntradaDto(string Titulo, string Artista);