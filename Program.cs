using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/api/musicas", async (MusicaEntradaDto dados, ApiDbContext db) =>
{
    var novaMusica = new MusicaEntity { Titulo = dados.Titulo, Artista = dados.Artista };
    db.Musicas.Add(novaMusica);
    await db.SaveChangesAsync();
    return Results.Created($"/api/musicas/{novaMusica.Id}", novaMusica);
});

app.MapGet("/api/musicas", async (ApiDbContext db) =>
    await db.Musicas.ToListAsync());

app.MapGet("/api/musicas/{id:int}", async (int id, ApiDbContext db) =>
{
    var musica = await db.Musicas.FindAsync(id);
    if (musica is null) return Results.NotFound();
    return Results.Ok(musica);
});

app.MapPut("/api/musicas/{id:int}", async (int id, MusicaEntradaDto dados, ApiDbContext db) => 
{
    var musica = await db.Musicas.FindAsync(id);
    if (musica is null) return Results.NotFound();

    musica.Titulo = dados.Titulo;
    musica.Artista = dados.Artista;
    await db.SaveChangesAsync();

    return Results.Ok(musica);
});

app.MapDelete("/api/musicas/{id:int}", async (int id, ApiDbContext db) => 
{
    var musica = await db.Musicas.FindAsync(id);
    if (musica is null) return Results.NotFound();

    db.Musicas.Remove(musica);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();

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