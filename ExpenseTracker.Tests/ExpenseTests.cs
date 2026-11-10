using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ExpenseTracker.Tests;

public class ExpenseTests(TestFactory factory) : IClassFixture<TestFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

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
        var response = await _client.GetAsync("/expenses/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteExpense_ThenGet_ReturnsNotFound()
    {
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
}
