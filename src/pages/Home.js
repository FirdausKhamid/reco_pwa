import React, { useState, useEffect } from "react";
import { Card } from "../components/Card/Card";
import useFetchExcel from "../hooks/useFetchExcel"; // adjust path as needed

export const Home = () => {
  const [month, setMonth] = useState("July");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expanded, setExpanded] = useState(false); // state to track expanded view

  const {
    excelData,
    loadingFetch,
    loadingPost,
    error,
    fetchExcelData,
    postExpenseData,
  } = useFetchExcel();

  useEffect(() => {
    fetchExcelData(month);
  }, [month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    await postExpenseData(title, amount, month);
    setTitle("");
    setAmount("");
  };

  const expenses = [...excelData.titlesAndAmounts].reverse();
  const totalBalance = new Intl.NumberFormat("en-MY", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(excelData.amount || 0);

  return (
    <div className="flex-center-column gap-sm test">
      <h1 className="title">Expenses Tracker</h1>
      <p className="text">
        Total Balance{" "}
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            border: "1px solid var(--color-gray-400)",
            borderRadius: 4,
            padding: "2px 6px",
            width: 80,
            fontWeight: "bold",
          }}
        />
      </p>
      {loadingFetch ? (
        <h2 className="title-number">Loading...</h2>
      ) : (
        <div className="flex-center-row items-center gap-sm">
          <h2 className="title-number">RM {totalBalance ?? "0.00"}</h2>
          <span
            onClick={() => fetchExcelData(month)}
            style={{ cursor: "pointer", fontSize: "1.5rem" }}
            title="Refresh"
          >
            🔄
          </span>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Recent Expenses Card */}
      <Card>
        <h4 style={{ color: "var(--color-gray-700)" }}>Recent Expenses 💳</h4>
        <ul className="color-gray-500 my-md font-default px-lg w-full custom-expense-list">
          {expenses?.length > 0 ? (
            (expanded ? expenses : expenses.slice(0, 5)).map((expense, idx) => (
              <li className="list-none px-0" key={idx}>
                <div className="flex-space-between-row">
                  <div>{expense.title}</div>
                  <div> — RM{parseFloat(expense.amount).toFixed(2)}</div>
                </div>
              </li>
            ))
          ) : (
            <li>No recent expenses found.</li>
          )}
        </ul>
        {expenses.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="button-solid-md px-lg font-micro"
          >
            {expanded ? "View Less" : "View More"}
          </button>
        )}
      </Card>

      {/* Add Expense Card */}
      <Card>
        <h4 style={{ color: "var(--color-gray-700)" }}>➕ Add Expense</h4>
        <form className="expense-form w-full" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Title of Expense"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loadingPost}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loadingPost}
            />
          </div>
          <button
            type="submit"
            className="button-solid-md"
            disabled={loadingPost}
          >
            {loadingPost ? "Adding " : "Add Expense"}
          </button>
        </form>
      </Card>
    </div>
  );
};
