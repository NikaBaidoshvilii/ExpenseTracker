using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

static class DemoSeeder
{
    public const string DemoEmail = "demo@expensetracker.dev";
    public const string DemoPassword = "Demo123!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var userManager = services.GetRequiredService<UserManager<IdentityUser>>();

        var user = await userManager.FindByEmailAsync(DemoEmail);
        if (user == null)
        {
            user = new IdentityUser { UserName = DemoEmail, Email = DemoEmail };
            var result = await userManager.CreateAsync(user, DemoPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Could not create the demo user: {errors}");
            }
        }

        var db = services.GetRequiredService<AppDbContext>();
        if (await db.Expenses.AnyAsync(e => e.UserId == user.Id))
        {
            return;
        }

        var today = DateOnly.FromDateTime(DateTime.Today);

        db.Expenses.AddRange(
            new Expense { Title = "Groceries", Amount = 54.20m, Category = "Food", Date = today.AddDays(-1), UserId = user.Id },
            new Expense { Title = "Bus card top-up", Amount = 20m, Category = "Transport", Date = today.AddDays(-3), UserId = user.Id },
            new Expense { Title = "Coffee with friends", Amount = 12.50m, Category = "Food", Date = today.AddDays(-6), UserId = user.Id },
            new Expense { Title = "Electricity bill", Amount = 38.75m, Category = "Utilities", Date = today.AddDays(-10), UserId = user.Id },
            new Expense { Title = "Cinema tickets", Amount = 24m, Category = "Entertainment", Date = today.AddDays(-14), UserId = user.Id },
            new Expense { Title = "Rent", Amount = 450m, Category = "Housing", Date = today.AddDays(-20), UserId = user.Id },
            new Expense { Title = "Pharmacy", Amount = 17.90m, Category = "Health", Date = today.AddDays(-27), UserId = user.Id },
            new Expense { Title = "Groceries", Amount = 61.40m, Category = "Food", Date = today.AddDays(-33), UserId = user.Id },
            new Expense { Title = "Taxi", Amount = 9.80m, Category = "Transport", Date = today.AddDays(-38), UserId = user.Id },
            new Expense { Title = "Internet", Amount = 30m, Category = "Utilities", Date = today.AddDays(-41), UserId = user.Id },
            new Expense { Title = "Rent", Amount = 450m, Category = "Housing", Date = today.AddDays(-50), UserId = user.Id },
            new Expense { Title = "Concert", Amount = 65m, Category = "Entertainment", Date = today.AddDays(-62), UserId = user.Id }
        );

        await db.SaveChangesAsync();
    }
}