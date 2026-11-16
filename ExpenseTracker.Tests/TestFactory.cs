using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

public class TestFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = $"expensetracker_test_{Guid.NewGuid():N}";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting(
            "ConnectionStrings:Default",
            $"Host=localhost;Port=5432;Database={_dbName};Username=postgres;Password=devpassword");
    }

    protected override void Dispose(bool disposing)
    {
        try
        {
            using var scope = Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureDeleted();
        }
        catch
        {
            
        }

        base.Dispose(disposing);
    }
}