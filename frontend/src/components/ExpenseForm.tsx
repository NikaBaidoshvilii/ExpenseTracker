import type React from "react";

interface ExpenseFormProps {
    title: string;
    amount: string;
    category: string;
    date: string;
    onTitleChange: (value: string) => void;
    onAmountChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDateChange: (value: string) => void;
    errors: string[];
    isEditing: boolean;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

function ExpenseForm({ title, amount, category, date, onTitleChange, onAmountChange, onCategoryChange, onDateChange, errors, isEditing, onSubmit, onCancel }: ExpenseFormProps) {
    return (
        <>
            <ul>
                {errors.map((error) => (
                    <li key={error}>{error}</li>
                ))}
            </ul>
            <form onSubmit={onSubmit}>
                <input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Title" />
                <input
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                />
                <input value={category} onChange={(e) => onCategoryChange(e.target.value)} placeholder="Category" />
                <input value={date} onChange={(e) => onDateChange(e.target.value)} type="date" placeholder="Date" />
                <button type="submit">{isEditing ? "Save" : "Add"}</button>
                {isEditing && (
                    <button type="button" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </form>
        </>
    );
}

export default ExpenseForm;