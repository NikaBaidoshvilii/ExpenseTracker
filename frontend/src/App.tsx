import React, { useState, useEffect } from "react";
import "./App.css";

interface ExpenseRequest {
    title: string;
    amount: number;
    category: string;
    date: string;
}

interface ExpenseResponse extends ExpenseRequest {
    id: number;
}

interface ValidationProblem {
    errors: Record<string, string[]>;
}

function App() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

    useEffect(() => {
        fetch(`/expenses${getFilterQuery()}`)
            .then((response) => response.json())
            .then((data) => setExpenses(data));

        function getFilterQuery() {
            const params = new URLSearchParams();

            if (filterMonth) params.set("month", filterMonth);
            if (filterYear) params.set("year", filterYear);
            if (filterCategory) params.set("category", filterCategory);

            const text = params.toString();
            return text ? `?${text}` : "";
        }
    }, [filterMonth, filterYear, filterCategory]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const expense: ExpenseRequest = {
            title: title,
            amount: Number(amount),
            category: category,
            date: date,
        };

        const url = editingId === null ? "/expenses" : `/expenses/${editingId}`;
        const method = editingId === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            const problem: ValidationProblem = await response.json();
            setErrors(Object.values(problem.errors).flat())
            return;
        }

        if (editingId === null) {
            const created: ExpenseResponse = await response.json();
            setExpenses( [ ...expenses, created ] );
        } else {
            const updated: ExpenseResponse = { ...expense, id: editingId };
            setExpenses(expenses.map((item) => item.id === editingId ? updated : item))
        }

        resetForm();
    }

    async function handleDelete(id: number) {
        if (!confirm("Delete this expense?")) return;

        const response = await fetch(`/expenses/${id}`, { method: "DELETE" });

        if (response.ok) {
            setExpenses(expenses.filter((expense) => expense.id !== id));
        }
    }

    function startEdit(expense: ExpenseResponse) {
        setTitle(expense.title);
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setDate(expense.date);

        setEditingId(expense.id);
        setErrors([]);
    }

    function resetForm() {
        setTitle("");
        setAmount("");
        setCategory("");
        setDate("");
        setErrors([]);
        setEditingId(null);
    }

    return (
        <>
            <h1>Expenses: {expenses.length} </h1>

            <ul>
                {errors.map((error) => (
                    <li key={error}>{error}</li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
                <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                <input value={date} onChange={(e) => setDate(e.target.value)} type="date" placeholder="Date" />
                <button type="submit">{editingId === null ? "Add" : "Save"}</button>
                {editingId !== null && (
                    <button type="button" onClick={resetForm}>Cancel</button>
                )}
            </form>
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} aria-label="Filter by month">
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
            <input value={filterYear} onChange={(e) => setFilterYear(e.target.value)}  type="number" placeholder="Year" aria-label="Filter by year"/>
            <input value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}  type="text" placeholder="Category" aria-label="Filter by category"/>
            <ul>
                {expenses.map((expense) => (
                    <li key={expense.id}>
                        {expense.title} {expense.amount.toFixed(2)} {expense.category} {expense.date}
                        <button onClick={() => startEdit(expense)}>Edit</button>
                        <button onClick={() => handleDelete(expense.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </>
    );
}

export default App;
