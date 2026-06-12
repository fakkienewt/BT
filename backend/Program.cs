using backend.Database;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<DbHelper>();
builder.Services.AddScoped<ParserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowAngular");
app.UseRouting();
app.MapControllers();

_ = Task.Run(async () =>
{
    await Task.Delay(3000);
    using (var scope = app.Services.CreateScope())
    {
        var parser = scope.ServiceProvider.GetRequiredService<ParserService>();

        await parser.ParseAllPhones(150);
        await parser.ParseAllLaptops(150);
        await parser.ParseAllComputers(150);
        await parser.ParseAllTablets(150);
        await parser.ParseAllSmartTelevizory(150);
        await parser.ParseAllMonitory(150);
        await parser.ParseAllPristavki(150);
        await parser.ParseAllSmartWatches(150);
        await parser.ParseAllFitnessBracelets(150);
        await parser.ParseAllGamingKeyboards(120);
        await parser.ParseAllGamingConsoles(120);
        await parser.ParseAllGamingMice(120);
        await parser.ParseAllMicrophones(120);
        await parser.ParseAllSpeakers(120);
        await parser.ParseAllHeadphones(120);
        await parser.ParseAllCablesAndChargers(120);
        await parser.ParseAllBatteries(120);
        await parser.ParseAllWirelessChargers(120);

        Console.WriteLine("✅ Парсинг завершён");
    }
});

app.Run();