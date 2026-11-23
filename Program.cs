using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddDataProtection()
    .PersistKeysToDbContext<AppDbContext>();

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DemoSeeder.SeedAsync(scope.ServiceProvider);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();

app.UseStaticFiles();

app.MapGet("/ping", () => "pong");

app.MapExpenseEndpoints();

app.MapGroup("/auth").AddEndpointFilter(async (context, next) =>
{
    var request = context.HttpContext.Request;
    var username = context.HttpContext.User.Identity?.Name;

    if (request.Method == "POST" && request.Path.StartsWithSegments("/auth/manage") && username == DemoSeeder.DemoEmail)
    {
        return Results.Problem("The demo account can't be changed.", statusCode: 403);
    }

    return await next(context);
}).MapIdentityApi<IdentityUser>();

app.MapPost("/auth/logout", async (SignInManager<IdentityUser> signInManager) =>
{
    await signInManager.SignOutAsync();
    return Results.Ok();
}).RequireAuthorization();

app.Run();

public partial class Program { }