import React, { useState, useEffect } from "react";
import SummaryChart from "./components/SummaryChart";
import ExpenseList from "./components/ExpenseList";
import Filters from "./components/Filters";
import ExpenseForm from "./components/ExpenseForm";
import AuthForm from "./components/AuthForm";
import type { CategoryTotal, ExpenseRequest, ExpenseResponse, FormValues, UserInfo, ValidationProblem } from "./types";

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
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authErrors, setAuthErrors] = useState<string[]>([]);

    useEffect(() => {
        fetch("/auth/manage/info").then(async (response) => {
            if (response.ok) {
                const info: UserInfo = await response.json();
                setUserEmail(info.email);
            }
        });
    }, []);

    useEffect(() => {
        if (userEmail === null) return;

        fetch(`/expenses${getFilterQuery()}`).then(async (response) => {
            if (response.status === 401) {
                setUserEmail(null);
                setExpenses([]);
                return;
            }

            const data: ExpenseResponse[] = await response.json();
            setExpenses(data);
        });

        function getFilterQuery() {
            const params = new URLSearchParams();

            if (filterMonth) params.set("month", filterMonth);
            if (filterYear) params.set("year", filterYear);
            if (filterCategory) params.set("category", filterCategory);

            const text = params.toString();
            return text ? `?${text}` : "";
        }
    }, [filterMonth, filterYear, filterCategory, userEmail]);

    useEffect(() => {
        if (userEmail === null) return;

        fetch(`/expenses/summary${getFilterQuery()}`).then(async (response) => {
            if (response.status === 401) {
                setUserEmail(null);
                setSummary([]);
                return;
            }

            const data: CategoryTotal[] = await response.json();
            setSummary(data);
        });

        function getFilterQuery() {
            const params = new URLSearchParams();

            if (filterMonth) params.set("month", filterMonth);
            if (filterYear) params.set("year", filterYear);

            const text = params.toString();
            return text ? `?${text}` : "";
        }
    }, [filterMonth, filterYear, expenses, userEmail]);

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

    async function logIn() {
        const response = await fetch("/auth/login?useCookies=true", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            setAuthErrors(["Wrong email or password."]);
            return;
        }

        setUserEmail(email);
        setPassword("");
        setAuthErrors([]);
    }

    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        await logIn();
    }

    async function handleRegister() {
        const response = await fetch("/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const problem: ValidationProblem = await response.json();
            setAuthErrors(Object.values(problem.errors).flat());
            return;
        }

        await logIn();
    }

    async function handleLogout() {
        await fetch("/auth/logout", { method: "POST" });

        setUserEmail(null);
        setExpenses([]);
        setSummary([]);
        resetForm();
    }

    function resetForm() {
        setForm(emptyForm);
        setErrors([]);
        setEditingId(null);
    }

    if (userEmail === null) {
        return (
            <>
                <h1 className="auth-title">Expense Tracker</h1>
                <AuthForm
                    email={email}
                    password={password}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    errors={authErrors}
                    onLogin={handleLogin}
                    onRegister={handleRegister}
                />
            </>
        );
    }

    return (
        <>
            <h1>Expense Tracker</h1>
            <div className="user-bar">
                <span>{userEmail}</span>
                <button type="button" onClick={handleLogout}>
                    Log out
                </button>
            </div>
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
