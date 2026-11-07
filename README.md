# Expense Tracker API

A small REST API for tracking personal expenses, built with ASP.NET Core and EF Core (SQLite).

## Features
- Create, read, update and delete expenses
- Filter by month, year and category
- Spending summary per category
- Input validation with clear error messages

## Run it
1. Install the .NET SDK (10.x)
2. `dotnet tool install --global dotnet-ef`
3. `dotnet ef database update`
4. `dotnet run`

Use `ExpenseTracker.http` to try the endpoints.

## Endpoints
| Method | Path | Description |
|---|---|---|
| GET | /ping | Health check, returns "pong" |
| GET | /expenses | List expenses (optional month, year, category) |
| GET | /expenses/{id} | Get one expense |
| POST | /expenses | Create an expense |
| PUT | /expenses/{id} | Update an expense |
| DELETE | /expenses/{id} | Delete an expense |
| GET | /expenses/summary | Totals per category (optional month, year) |