static class ExpenseValidation
{
    public static Dictionary<string, string[]> Validate(ExpenseRequest request)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            errors["Title"] = ["Title is required."];
        }
        else if (request.Title.Length > 100)
        {
            errors["Title"] = ["Title must be 100 characters or less."];
        }

        if (request.Amount <= 0)
        {
            errors["Amount"] = ["Amount must be greater than 0."];
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            errors["Category"] = ["Category is required."];
        }

        if (request.Date == default)
        {
            errors["Date"] = ["Date is required."];
        }
        else if (request.Date.Year < 1900)
        {
            errors["Date"] = ["Date must be in 1900 or later."];
        }
        else if (request.Date > DateOnly.FromDateTime(DateTime.Today))
        {
            errors["Date"] = ["Date cannot be in the future."];
        }

        return errors;
    }
}