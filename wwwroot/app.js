let editingId = null;

const form = document.getElementById("expense-form");
const errorsList = document.getElementById("errors");
const applyButton = document.getElementById("apply-filters");
const clearButton = document.getElementById("clear-filters");

function clearInvalid() {
    for (const input of form.querySelectorAll("input")) {
        input.classList.remove("invalid");
    }
}

function resetForm() {
    form.reset();
    clearInvalid();
    editingId = null;
    document.getElementById("submit-button").textContent = "Add";
    document.getElementById("cancel-button").hidden = true;
}

function getFilterQuery() {
    const params = new URLSearchParams();

    const month = document.getElementById("filter-month").value;
    const year = document.getElementById("filter-year").value;
    const category = document.getElementById("filter-category").value;

    if (month) params.set("month", month);
    if (year) params.set("year", year);
    if (category) params.set("category", category);

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

async function loadExpenses() {
    const expenses = await fetchJson(`/expenses${getFilterQuery()}`);

    const tbody = document.getElementById("expenses-body");
    tbody.innerHTML = "";

    for (const expense of expenses) {
        const row = document.createElement("tr");
        const actionsCell = document.createElement("td");

        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;
        row.appendChild(titleCell);

        const amountCell = document.createElement("td");
        amountCell.textContent = expense.amount.toFixed(2);
        row.appendChild(amountCell);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;
        row.appendChild(categoryCell);

        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;
        row.appendChild(dateCell);

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

            document.getElementById("title").value = expense.title;
            document.getElementById("amount").value = expense.amount;
            document.getElementById("category").value = expense.category;
            document.getElementById("date").value = expense.date;

            document.getElementById("submit-button").textContent = "Save";
            document.getElementById("cancel-button").hidden = false;
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
        title: document.getElementById("title").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    const url = editingId === null ? "/expenses" : `/expenses/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";

    const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    });

    if (response.ok) {
        errorsList.innerHTML = "";
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

document.getElementById("cancel-button").addEventListener("click", resetForm);

applyButton.addEventListener("click", () => {
    refresh();
});

clearButton.addEventListener("click", () => {
    document.getElementById("filter-month").value = "";
    document.getElementById("filter-year").value = "";
    document.getElementById("filter-category").value = "";

    refresh();
});

refresh();