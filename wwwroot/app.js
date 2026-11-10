let editingId = null;

const form = document.getElementById("expense-form");
const errorsList = document.getElementById("errors");
const applyButton = document.getElementById("apply-filters");
const clearButton = document.getElementById("clear-filters");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const filterMonth = document.getElementById("filter-month");
const filterYear = document.getElementById("filter-year");
const filterCategory = document.getElementById("filter-category");

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

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}

function addCell(row, text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    row.appendChild(cell);
}

async function loadExpenses() {
    const expenses = await fetchJson(`/expenses${getFilterQuery()}`);

    const tbody = document.getElementById("expenses-body");
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
            amountInput.value = expense.amount;
            categoryInput.value = expense.category;
            dateInput.value = expense.date;

            submitButton.textContent = "Save";
            cancelButton.hidden = false;
        });

        deleteButton.addEventListener("click", async () => {
            if (!confirm("Delete this expense?")) return;

            await fetch(`/expenses/${expense.id}`, { method: "DELETE" });

            if (editingId === expense.id) {
                resetForm();
            }

            refresh();
        });
    }
}

async function loadSummary() {
    const results = await fetchJson(`/expenses/summary${getFilterQuery()}`);

    results.sort((a, b) => b.total - a.total);

    const summary = document.getElementById("summary");
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

        let problem = null;
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