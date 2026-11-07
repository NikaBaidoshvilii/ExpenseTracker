record ExpenseRequest(string Title, decimal Amount, string Category, DateOnly Date);
record ExpenseResponse(int Id, string Title, decimal Amount, string Category, DateOnly Date)
{
    public static ExpenseResponse From(Expense e) => new(e.Id, e.Title, e.Amount, e.Category, e.Date);
}
record CategoryTotal(string Category, decimal Total);