using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddAuthorization();

builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
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

app.MapGroup("/auth").MapIdentityApi<IdentityUser>();

app.MapPost("/auth/logout", async (SignInManager<IdentityUser> SignInManager) =>
{
    await SignInManager.SignOutAsync();
    return Results.Ok();
}).RequireAuthorization();

app.Run();

public partial class Program { }