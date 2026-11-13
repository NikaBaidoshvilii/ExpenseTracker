import type { CategoryTotal } from "../types";

interface SummaryChartProps {
    summary: CategoryTotal[];
}

function SummaryChart({ summary }: SummaryChartProps) {
    const maxTotal = Math.max(...summary.map((row) => row.total));

    return summary.length === 0 ? (
        <p>No expenses for this period.</p>
    ) : (
        <ul>
            {summary.map((row) => (
                <li key={row.category}>
                    {row.category}: {row.total.toFixed(2)}
                    <div className="bar" style={{ width: `${(row.total / maxTotal) * 100}%` }}></div>
                </li>
            ))}
        </ul>
    );
}

export default SummaryChart;
