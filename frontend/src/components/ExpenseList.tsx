import type { ExpenseResponse } from "../types";
import "./ExpenseList.css";

interface ExpenseListProps {
    expenses: ExpenseResponse[];
    onEdit: (expense: ExpenseResponse) => void;
    onDelete: (id: number) => void;
}

function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id}>
                            <td>{expense.title}</td>
                            <td>{expense.amount.toFixed(2)}</td>
                            <td>{expense.category}</td>
                            <td>{expense.date}</td>
                            <td>
                                <button onClick={() => onEdit(expense)}>Edit</button>
                                <button onClick={() => onDelete(expense.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ExpenseList;
