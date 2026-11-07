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

app.MapGet("/expenses", async (int? month, int? year, string? category, AppDbContext db) =>
{
    var query = db.Expenses.AsQueryable();

    if (month is not null)
    {
        query = query.Where(e => e.Date.Month == month);
    }

    if (year is not null)
    {
        query = query.Where(e => e.Date.Year == year);
    }
    
    if (category is not null)
    {
        query = query.Where(e => e.Category.ToLower() == category.ToLower());
    }

    return await query.Select(e => new ExpenseResponse(e.Id, e.Title, e.Amount, e.Category, e.Date)).ToListAsync();
});

app.MapGet("/expenses/{id}", async (int id, AppDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);

    if (expense is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(new ExpenseResponse(expense.Id, expense.Title, expense.Amount, expense.Category, expense.Date));
});

app.MapGet("/expenses/summary", async (int? month, int? year, AppDbContext db) =>
{
    var query = db.Expenses.AsQueryable();

    if (month is not null)
    {
        query = query.Where(e => e.Date.Month == month);
    }

    if (year is not null)
    {
        query = query.Where(e => e.Date.Year == year);
    }

    var expenses = await query.ToListAsync();
    return expenses.GroupBy(e => e.Category.ToLower()).Select(g => new CategoryTotal(g.Key, g.Sum(e => e.Amount))).ToList();
});


app.MapPost("/expenses", async (ExpenseRequest request, AppDbContext db) =>
{
    var errors = ExpenseValidation.Validate(request);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var expense = new Expense { Title = request.Title, Amount = request.Amount, Category = request.Category, Date = request.Date };
    db.Expenses.Add(expense);

    await db.SaveChangesAsync();

    return Results.Created($"/expenses/{expense.Id}", new ExpenseResponse(expense.Id, expense.Title, expense.Amount, expense.Category, expense.Date));
});

app.MapPut("/expenses/{id}", async (int id, ExpenseRequest request, AppDbContext db) =>
{
    var errors = ExpenseValidation.Validate(request);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var expense = await db.Expenses.FindAsync(id);
    if (expense is null)
    {
        return Results.NotFound();
    }

    expense.Title = request.Title;
    expense.Amount = request.Amount;
    expense.Category = request.Category;
    expense.Date = request.Date;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/expenses/{id}", async (int id, AppDbContext db) =>
{
    var expense = await db.Expenses.FindAsync(id);

    if (expense is null)
    {
        return Results.NotFound();
    }

    db.Expenses.Remove(expense);

    await db.SaveChangesAsync();

    return Results.NoContent();
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

record ExpenseRequest(string Title, decimal Amount, string Category, DateOnly Date);
record ExpenseResponse(int Id, string Title, decimal Amount, string Category, DateOnly Date);

static class ExpenseValidation
{
    public static Dictionary<string, string[]> Validate(ExpenseRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            errors["Title"] = ["Title is required."];
        }
        else if (request.Title.Length > 100)
        {
            errors["Title"] = ["Title must be 100 characters or less."];
        }

        if (request.Amount <= 0)
        {
            errors["Amount"] = ["Amount must be greater than 0."];
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            errors["Category"] = ["Category is required."];
        }

        return errors;
    }
}

record CategoryTotal(string Category, decimal Total);