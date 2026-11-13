import "./Filters.css";

interface FilterProps {
    month: string;
    year: string;
    category: string;
    onMonthChange: (value: string) => void;
    onYearChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
}

function Filters({ month, year, category, onMonthChange, onYearChange, onCategoryChange }: FilterProps) {
    return (
        <div className="filters">
            <select value={month} onChange={(e) => onMonthChange(e.target.value)} aria-label="Filter by month">
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
            </select>
            <input
                value={year}
                onChange={(e) => onYearChange(e.target.value)}
                type="number"
                placeholder="Year"
                aria-label="Filter by year"
            />
            <input
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
                type="text"
                placeholder="Category"
                aria-label="Filter by category"
            />
        </div>
    );
}

export default Filters;