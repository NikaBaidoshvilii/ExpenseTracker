import type React from "react";

interface ExpenseFormProps {
    values: FormValues;
    onChange: (values: FormValues) => void;
    errors: string[];
    isEditing: boolean;
    onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export interface FormValues {
    title: string;
    amount: string;
    category: string;
    date: string;
}

function ExpenseForm({ values, onChange, errors, isEditing, onSubmit, onCancel }: ExpenseFormProps) {
    return (
        <>
            <ul>
                {errors.map((error) => (
                    <li key={error}>{error}</li>
                ))}
            </ul>
            <form onSubmit={onSubmit}>
                <input value={values.title} onChange={(e) => onChange({ ...values, title: e.target.value })} placeholder="Title" />
                <input
                    value={values.amount}
                    onChange={(e) => onChange({ ...values, amount: e.target.value })}
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                />
                <input value={values.category} onChange={(e) => onChange({ ...values, category: e.target.value })} placeholder="Category" />
                <input value={values.date} onChange={(e) => onChange({ ...values, date: e.target.value })} type="date" placeholder="Date" />
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