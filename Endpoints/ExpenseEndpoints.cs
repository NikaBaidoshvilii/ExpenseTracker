using Microsoft.EntityFrameworkCore;

static class ExpenseEndpoints
{
    public static void MapExpenseEndpoints(this WebApplication app)
    {
        app.MapGet("/expenses", async (int? month, int? year, string? category, AppDbContext db) =>
        {
            if (month is not null && (month < 1 || month > 12))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["month"] = ["Month must be between 1 and 12."]
                });
            }

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

            return Results.Ok(await query.Select(e => new ExpenseResponse(e.Id, e.Title, e.Amount, e.Category, e.Date)).ToListAsync());
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
            if (month is not null && (month < 1 || month > 12))
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["month"] = ["Month must be between 1 and 12."]
                });
            }

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
            return Results.Ok(expenses.GroupBy(e => e.Category.ToLower()).Select(g => new CategoryTotal(g.Key, g.Sum(e => e.Amount))).ToList());
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
    }
}