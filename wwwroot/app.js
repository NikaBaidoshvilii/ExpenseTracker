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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);

        tbody.appendChild(row);

        deleteButton.addEventListener("click", async () => {
            if (!confirm("Delete this expense?")) return;

            await fetch(`/expenses/${expense.id}`, { method: "DELETE" });

            loadExpenses();
        });
    }
}

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

    const response = await fetch("/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense)
    });

    if (response.ok) {
        errorsList.innerHTML = "";
        form.reset();
        loadExpenses();
    }
    else {
        const problem = await response.json();
        errorsList.innerHTML = "";

        for (const messages of Object.values(problem.errors)) {
            for (const message of messages) {
                const li = document.createElement("li");
                li.textContent = message;
                errorsList.appendChild(li);
            }
        }
    }
});

loadExpenses();