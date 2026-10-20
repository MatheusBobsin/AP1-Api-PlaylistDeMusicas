using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.MapGet("/", () => "API da playlist de músicas está no ar e usando SQLite");

app.MapGet("/api/musicas", async (ApiDbContext db) =>
{
    var musicasDoBanco = await db.Musicas.ToListAsync();
    return Results.Ok(musicasDoBanco);
});

app.MapPost("/api/musicas", async (MusicaEntradaDto dados, ApiDbContext db) =>
{
    var novaMusica = new MusicaEntity 
    { 
        Titulo = dados.Titulo, 
        Artista = dados.Artista 
    };

    db.Musicas.Add(novaMusica);
    await db.SaveChangesAsync();

    return Results.Created($"/api/musicas/{novaMusica.Id}", novaMusica);
});

app.Run();

record MusicaDto(int Id, string Titulo, string Artista);
record MusicaEntradaDto(string Titulo, string Artista);

class MusicaEntity
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
}

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options) { }
    public DbSet<MusicaEntity> Musicas => Set<MusicaEntity>();
}