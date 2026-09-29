import { useState } from "react";
import { X } from "lucide-react";
import { createExpense } from "../services/expenseService";

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

function AddExpenseModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter an expense title.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createExpense({
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
      });

      onSuccess();
    } catch (err) {
      console.error(err);

      const apiErrors = err.response?.data?.errors;

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        setError(apiErrors[0].message);
      } else {
        setError(
          err.response?.data?.message ||
            "Could not create the expense. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Add expense
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Record a new expense.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="expense-title"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Title
            </label>

            <input
              id="expense-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Lunch"
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="expense-amount"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Amount
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                ₹
              </span>

              <input
                id="expense-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                inputMode="decimal"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-8 pr-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="expense-category"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Category
            </label>

            <select
              id="expense-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            >
              <option value="">Select a category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="expense-date"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Date
            </label>

            <input
              id="expense-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Adding..." : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpenseModal;