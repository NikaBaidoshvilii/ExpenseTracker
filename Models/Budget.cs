using Microsoft.AspNetCore.Identity;

class Budget
{
    public int Id { get; set; }
    public string Category { get; set; } = "";
    public decimal Amount { get; set; }
    public string UserId { get; set; } = "";
    public IdentityUser? User { get; set; }
}