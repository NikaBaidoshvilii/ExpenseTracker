interface ExpenseRequest {
    title: string;
    amount: number;
    category: string;
    date: string;
}

interface ExpenseResponse extends ExpenseRequest{
    id: number;
}

interface CategoryTotal {
    category: string;
    total: number;
}

interface ValidationProblem {
    errors: Record<string, string[]>;
}

let editingId: number | null = null;

const form = document.getElementById("expense-form") as HTMLFormElement;
const errorsList = document.getElementById("errors") as HTMLUListElement;
const applyButton = document.getElementById("apply-filters") as HTMLButtonElement;
const clearButton = document.getElementById("clear-filters") as HTMLButtonElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const amountInput = document.getElementById("amount") as HTMLInputElement;
const categoryInput = document.getElementById("category") as HTMLInputElement;
const dateInput = document.getElementById("date") as HTMLInputElement;
const submitButton = document.getElementById("submit-button") as HTMLButtonElement;
const cancelButton = document.getElementById("cancel-button") as HTMLButtonElement;
const filterMonth = document.getElementById("filter-month") as HTMLSelectElement;
const filterYear = document.getElementById("filter-year") as HTMLInputElement;
const filterCategory = document.getElementById("filter-category") as HTMLInputElement;

function clearInvalid() {
    for (const input of form.querySelectorAll("input")) {
        input.classList.remove("invalid");
    }
}

function resetForm() {
    form.reset();
    clearInvalid();
    errorsList.innerHTML = "";
    editingId = null;
    submitButton.textContent = "Add";
    cancelButton.hidden = true;
}

function getFilterQuery() {
    const params = new URLSearchParams();

    if (filterMonth.value) params.set("month", filterMonth.value);
    if (filterYear.value) params.set("year", filterYear.value);
    if (filterCategory.value) params.set("category", filterCategory.value);

    const text = params.toString();
    return text ? `?${text}` : "";
}

async function fetchJson<T>(url: string) : Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}

function addCell(row: HTMLTableRowElement, text: string) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

async function loadExpenses() {
    const expenses = await fetchJson<ExpenseResponse[]>(`/expenses${getFilterQuery()}`);

    const tbody = document.getElementById("expenses-body") as HTMLTableSectionElement;
    tbody.innerHTML = "";

    for (const expense of expenses) {
        const row = document.createElement("tr");
        const actionsCell = document.createElement("td");

        addCell(row, expense.title);
        addCell(row, expense.amount.toFixed(2));
        addCell(row, expense.category);
        addCell(row, expense.date);

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);

        editButton.addEventListener("click", () => {
            editingId = expense.id;

            titleInput.value = expense.title;
            amountInput.value = expense.amount.toString();
            categoryInput.value = expense.category;
            dateInput.value = expense.date;

            submitButton.textContent = "Save";
            cancelButton.hidden = false;
        });

        deleteButton.addEventListener("click", async () => {
            if (!confirm("Delete this expense?")) return;

            const response = await fetch(`/expenses/${expense.id}`, { method: "DELETE" });

            if (!response.ok) {
                errorsList.innerHTML = "";
                const li = document.createElement("li");
                li.textContent = "Could not delete the expense.";
                errorsList.appendChild(li);
                return;
            }

            if (editingId === expense.id) {
                resetForm();
            }

            refresh();
        });
    }
}

async function loadSummary() {
    const results = await fetchJson<CategoryTotal[]>(`/expenses/summary${getFilterQuery()}`);

    results.sort((a, b) => b.total - a.total);

    const summary = document.getElementById("summary") as HTMLDivElement;
    summary.innerHTML = "";

    const max = Math.max(...results.map(r => r.total));

    for (const result of results) {
        const row = document.createElement("div");
        row.className = "summary-row";

        const label = document.createElement("span");
        label.textContent = `${result.category} : ${result.total.toFixed(2)}`;
        row.appendChild(label);

        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.width = `${(result.total / max) * 100}%`;
        row.appendChild(bar);

        summary.appendChild(row);
    }
}

async function refresh() {
    try {
        await loadExpenses();
        await loadSummary();
    } catch {
        errorsList.innerHTML = "";
        const li = document.createElement("li");
        li.textContent = "Could not load data. Is the server running?";
        errorsList.appendChild(li);
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearInvalid();

    const expense = {
        title: titleInput.value,
        amount: Number(amountInput.value),
        category: categoryInput.value,
        date: dateInput.value
    };

    const url = editingId === null ? "/expenses" : `/expenses/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";

    const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    });

    if (response.ok) {
        resetForm();
        refresh();
    }
    else {
        errorsList.innerHTML = "";

        let problem: ValidationProblem | null = null;
        try {
            problem = await response.json();
        } catch {
            // the response wasn't JSON, so problem stays null
        }

        if (problem?.errors) {
            for (const [field, messages] of Object.entries(problem.errors)) {
                document.getElementById(field.toLowerCase())?.classList.add("invalid");

                for (const message of messages) {
                    const li = document.createElement("li");
                    li.textContent = message;
                    errorsList.appendChild(li);
                }
            }
        } else {
            const li = document.createElement("li");
            li.textContent = "Something went wrong. Please try again.";
            errorsList.appendChild(li);
        }
    }
});

cancelButton.addEventListener("click", resetForm);

applyButton.addEventListener("click", () => {
    refresh();
});

clearButton.addEventListener("click", () => {
    filterMonth.value = "";
    filterYear.value = "";
    filterCategory.value = "";

    refresh();
});

refresh();