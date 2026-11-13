import React, { useState, useEffect } from "react";
import "./App.css";
import SummaryChart, { type CategoryTotal } from "./components/SummaryChart";
import ExpenseList, { type ExpenseRequest, type ExpenseResponse } from "./components/ExpenseList";
import Filters from "./components/Filters";
import ExpenseForm, { type FormValues } from "./components/ExpenseForm";

interface ValidationProblem {
    errors: Record<string, string[]>;
}

const emptyForm: FormValues = { title: "", amount: "", category: "", date: "" };

function App() {
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([]);
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [errors, setErrors] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [summary, setSummary] = useState<CategoryTotal[]>([]);

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

    useEffect(() => {
        fetch(`/expenses/summary${getFilterQuery()}`)
            .then((response) => response.json())
            .then((data) => setSummary(data));

        function getFilterQuery() {
            const params = new URLSearchParams();

            if (filterMonth) params.set("month", filterMonth);
            if (filterYear) params.set("year", filterYear);

            const text = params.toString();
            return text ? `?${text}` : "";
        }
    }, [filterMonth, filterYear, expenses]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        const expense: ExpenseRequest = {
            title: form.title,
            amount: Number(form.amount),
            category: form.category,
            date: form.date,
        };

        const url = editingId === null ? "/expenses" : `/expenses/${editingId}`;
        const method = editingId === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expense),
        });

        if (!response.ok) {
            const problem: ValidationProblem = await response.json();
            setErrors(Object.values(problem.errors).flat());
            return;
        }

        if (editingId === null) {
            const created: ExpenseResponse = await response.json();
            setExpenses([...expenses, created]);
        } else {
            const updated: ExpenseResponse = { ...expense, id: editingId };
            setExpenses(expenses.map((item) => (item.id === editingId ? updated : item)));
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
        setForm({
            title: expense.title,
            amount: expense.amount.toString(),
            category: expense.category,
            date: expense.date,
        });

        setEditingId(expense.id);
        setErrors([]);
    }

    function resetForm() {
        setForm(emptyForm);
        setErrors([]);
        setEditingId(null);
    }

    return (
        <>
            <h1>Expenses: {expenses.length} </h1>
            <ExpenseForm
                values={form}
                onChange={setForm}
                errors={errors}
                isEditing={editingId !== null}
                onSubmit={handleSubmit}
                onCancel={resetForm}
            />
            <Filters
                month={filterMonth}
                year={filterYear}
                category={filterCategory}
                onMonthChange={setFilterMonth}
                onYearChange={setFilterYear}
                onCategoryChange={setFilterCategory}
            />
            <ExpenseList expenses={expenses} onEdit={startEdit} onDelete={handleDelete} />
            <SummaryChart summary={summary} />
        </>
    );
}

export default App;
