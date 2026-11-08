async function loadExpenses() {
    const response = await fetch("/expenses");
    const expenses = await response.json();

    const tbody = document.getElementById("expenses-body");
    tbody.innerHTML = "";

    for (const expense of expenses) {
        const row = document.createElement("tr");

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

        tbody.appendChild(row);
    }
}

loadExpenses();