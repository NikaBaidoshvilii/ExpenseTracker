import type { CategoryTotal } from "../types";
import "./SummaryChart.css";

interface SummaryChartProps {
  summary: CategoryTotal[];
}

function SummaryChart({ summary }: SummaryChartProps) {
  const maxTotal = Math.max(...summary.map((row) => row.total));

  return (
    <>
      <h2>Summary</h2>
      {summary.length === 0 ? (
        <p>No expenses for this period.</p>
      ) : (
        <div>
          {summary.map((row) => (
            <div key={row.category} className="summary-row">
              <span>
                {row.category}: {row.total.toFixed(2)}
              </span>
              <div className="bar" style={{ width: `${(row.total / maxTotal) * 100}%` }}></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default SummaryChart;
