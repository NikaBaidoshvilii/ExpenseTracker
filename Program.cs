var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

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
    var forecast =  Enumerable.Range(1, 5).Select(index =>
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

app.MapGet("/expenses", () => expenses);

app.MapGet("/expenses/{id}", (int id) =>
{
    var expense = expenses.FirstOrDefault(e => e.Id == id);

    if (expense is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(expense);
});

app.MapPost("/expenses", (Expense expense) =>
{
    expense.Id = expenses.Count == 0 ? 1 : expenses.Max(e => e.Id) + 1;
    expenses.Add(expense);
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