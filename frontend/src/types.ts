export interface ExpenseRequest {
    title: string;
    amount: number;
    category: string;
    date: string;
}

export interface ExpenseResponse extends ExpenseRequest {
    id: number;
}

export interface CategoryTotal {
    category: string;
    total: number;
}

export interface FormValues {
    title: string;
    amount: string;
    category: string;
    date: string;
}

export interface ValidationProblem {
    errors: Record<string, string[]>;
}