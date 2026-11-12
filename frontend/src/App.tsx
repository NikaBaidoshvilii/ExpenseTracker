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

    useEffect(() => {
        fetch("/expenses")
            .then((response) => response.json())
            .then((data) => setExpenses(data));
    }, []);

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
