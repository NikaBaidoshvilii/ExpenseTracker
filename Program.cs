using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=expenses.db"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

var expenses = new List<Expense>
{
    new() {Id = 1, Title = "Coffee", Amount = 4.50m, Category = "Food", Date = new DateOnly(2026, 11, 5)}
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapGet("/ping", () => "pong");

app.MapGet("/expenses", async (AppDbContext db) => await db.Expenses.ToListAsync());

app.MapGet("/expenses/{id}", async (int id, AppDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);

    if (expense is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(expense);
});

app.MapPost("/expenses", async (Expense expense, AppDbContext db) =>
{
    db.Expenses.Add(expense);

    await db.SaveChangesAsync();

    return Results.Created($"/expenses/{expense.Id}", expense);
});

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Category { get; set; } = "";
    public DateOnly Date { get; set; }
}