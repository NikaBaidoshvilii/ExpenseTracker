using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ExpenseTracker.Tests;

public class ExpenseTests(TestFactory factory) : IClassFixture<TestFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private async Task LoginAsync()
    {
        var email = $"{Guid.NewGuid()}@test.com";

        await _client.PostAsJsonAsync("/auth/register", new
        {
            email = email,
            password = "Test123!"
        });

        await _client.PostAsJsonAsync("/auth/login?useCookies=true", new
        {
            email = email,
            password = "Test123!"
        });
    }

    [Fact]
    public async Task Ping_ReturnsPong()
    {
        var response = await _client.GetAsync("/ping");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal("pong", body);
    }

    [Fact]
    public async Task CreateExpense_ValidData_ReturnsCreated()
    {
        await LoginAsync();

        var response = await _client.PostAsJsonAsync("/expenses", new
        {
            title = "Groceries",
            amount = 50,
            category = "Food",
            date = "2026-11-01"
        });
    
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateExpense_EmptyTitle_ReturnsBadRequest()
    {
        await LoginAsync();

        var response = await _client.PostAsJsonAsync("/expenses", new
        {
            title = "",
            amount = 50,
            category = "Food",
            date = "2026-11-01"
        });
    
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetExpense_AfterCreate_ReturnsIt()
    {
        await LoginAsync();

        var createdResponse = await _client.PostAsJsonAsync("/expenses", new
        {
            title = "Groceries",
            amount = 50,
            category = "Food",
            date = "2026-11-01"
        });
    
        var created = await createdResponse.Content.ReadFromJsonAsync<ExpenseResponse>();
        Assert.NotNull(created);

        var getResponse = await _client.GetAsync($"/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode); 

        var fetched = await getResponse.Content.ReadFromJsonAsync<ExpenseResponse>();
        Assert.NotNull(fetched);
        Assert.Equal("Groceries", fetched.Title);
    }

    [Fact]
    public async Task GetExpense_NonExistentId_ReturnsNotFound()
    {
        await LoginAsync();

        var response = await _client.GetAsync("/expenses/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteExpense_ThenGet_ReturnsNotFound()
    {
        await LoginAsync();

        var createdResponse = await _client.PostAsJsonAsync("/expenses", new
        {
            title = "Groceries",
            amount = 50,
            category = "Food",
            date = "2026-11-01"
        });

        var created = await createdResponse.Content.ReadFromJsonAsync<ExpenseResponse>();
        Assert.NotNull(created);

        var deleteResponse = await _client.DeleteAsync($"/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var response = await _client.GetAsync($"/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetExpenses_NotLoggedIn_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/expenses");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetExpense_OtherUsersExpense_ReturnsNotFound()
    {
        await LoginAsync();

        var createdResponse = await _client.PostAsJsonAsync("/expenses", new
        {
            title = "Groceries",
            amount = 50,
            category = "Food",
            date = "2026-11-01"
        });

        var created = await createdResponse.Content.ReadFromJsonAsync<ExpenseResponse>();
        Assert.NotNull(created);
        
        await LoginAsync();

        var getResponse = await _client.GetAsync($"/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode); 
    }

    [Fact]
    public async Task ChangePassword_DemoUser_ReturnsForbidden()
    {
        await _client.PostAsJsonAsync("/auth/login?useCookies=true", new
        {
            email = DemoSeeder.DemoEmail,
            password = DemoSeeder.DemoPassword
        });

        var response = await _client.PostAsJsonAsync("/auth/manage/info", new
        {
            oldPassword = DemoSeeder.DemoPassword,
            newPassword = "Hacked123!"
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}