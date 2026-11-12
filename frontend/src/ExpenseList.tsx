export interface ExpenseRequest {
    title: string;
    amount: number;
    category: string;
    date: string;
}

export interface ExpenseResponse extends ExpenseRequest {
    id: number;
}

interface ExpenseListProps {
    expenses: ExpenseResponse[];
    onEdit: (expense: ExpenseResponse) => void;
    onDelete: (id: number) => void;
}

function ExpenseList({ expenses, onEdit, onDelete}: ExpenseListProps) {
    return (
        <ul>
            {expenses.map((expense) => (
                <li key={expense.id}>
                    {expense.title} {expense.amount.toFixed(2)} {expense.category} {expense.date}
                    <button onClick={() => onEdit(expense)}>Edit</button>
                    <button onClick={() => onDelete(expense.id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}

export default ExpenseList;