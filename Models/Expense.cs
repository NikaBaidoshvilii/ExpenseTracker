using Microsoft.AspNetCore.Identity;

class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public decimal Amount { get; set; }
    public string Category { get; set; } = "";
    public DateOnly Date { get; set; }
    public string UserId { get; set; } = "";
    public IdentityUser? User { get; set; }
}