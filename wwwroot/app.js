let editingId = null;

function resetForm() {
    form.reset();
    editingId = null;
    document.getElementById("submit-button").textContent = "Add";
    document.getElementById("cancel-button").hidden = true;
}

async function loadExpenses() {
    const response = await fetch("/expenses");
    const expenses = await response.json();

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

            loadExpenses();
        });
    }
}

document.getElementById("cancel-button").addEventListener("click", resetForm);

const form = document.getElementById("expense-form");
const errorsList = document.getElementById("errors");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

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
        loadExpenses();
    }
    else {
        errorsList.innerHTML = "";

        let problem = null;
        try {
            problem = await response.json();
        } catch {

        }

        if (problem?.errors) {
            for (const messages of Object.values(problem.errors)) {
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

loadExpenses();