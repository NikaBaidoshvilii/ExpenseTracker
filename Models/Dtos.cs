record ExpenseRequest(string Title, decimal Amount, string Category, DateOnly Date);
record ExpenseResponse(int Id, string Title, decimal Amount, string Category, DateOnly Date);
record CategoryTotal(string Category, decimal Total);