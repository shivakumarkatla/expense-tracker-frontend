import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Receipt,
  Search,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  WalletCards,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../services/expenseService";

import AddExpenseModal from "../components/AddExpenseModal";

const CATEGORY_ICONS = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Travel: Car,
  Entertainment: Film,
};

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

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateInputValue(date) {
  if (!date) {
    return new Date().toISOString().split("T")[0];
  }

  return new Date(date).toISOString().split("T")[0];
}

const getExpenseId = (expense) => {
  return expense?._id || expense?.id;
};

/*
 * Frontend sorting for the currently loaded page.
 *
 * This keeps the backend unchanged for now.
 */
function sortExpenses(expenses, sortBy) {
  return [...expenses].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.date) - new Date(b.date);

      case "amount-desc":
        return Number(b.amount) - Number(a.amount);

      case "amount-asc":
        return Number(a.amount) - Number(b.amount);

      case "title-asc":
        return (a.title || "").localeCompare(
          b.title || "",
          undefined,
          { sensitivity: "base" }
        );

      case "date-desc":
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });
}

function Transactions() {
    const [searchParams, setSearchParams] = useSearchParams();

  const urlStartDate = searchParams.get("startDate") || "";
  const urlEndDate = searchParams.get("endDate") || "";

  const [startDate, setStartDate] = useState(urlStartDate);
  const [endDate, setEndDate] = useState(urlEndDate);
  
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState("date-desc");

  const [page, setPage] = useState(1);

  const {toast, showToast, hideToast,} = useToast();

  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  const [showAddExpense, setShowAddExpense] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);

  const [showActions, setShowActions] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExpenses({
        page,
        limit: 10,
        search: search || undefined,
        category: category || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const result = response?.data ?? response;

      const loadedExpenses = result?.expenses || [];

      setExpenses(
        sortExpenses(loadedExpenses, sortBy)
      );

      setPagination(
        result?.pagination || {
          page: 1,
          pages: 1,
          total: loadedExpenses.length,
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load your transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [page, search, category, sortBy, startDate, endDate]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowActions(null);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
    setShowActions(null);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    const expenseId = getExpenseId(expenseToDelete);

    if (!expenseId) {
      console.error(
        "Expense ID missing:",
        expenseToDelete
      );
      return;
    }

    try {
      setDeleteLoading(true);
      setError("");

      await deleteExpense(expenseId);

setShowDeleteModal(false);
setExpenseToDelete(null);
setShowActions(null);

showToast(
  "Expense deleted successfully",
  "success"
);

await loadExpenses();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Could not delete the expense.",
        "error"
      );

      setError(
        err.response?.data?.message ||
          "Could not delete the expense."
      );

      setShowDeleteModal(false);
      setExpenseToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasTransactions = expenses.length > 0;

  return (
    <div
      className="mx-auto max-w-7xl"
      onClick={() => setShowActions(null)}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">
            Activity
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Transactions
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            View and manage all your expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setShowAddExpense(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          <Plus size={17} />
          Add expense
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              value={search}
              onChange={handleSearch}
              placeholder="Search expenses..."
              aria-label="Search expenses"
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={handleCategoryChange}
            aria-label="Filter by category"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          >
            <option value="">
              All categories
            </option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={handleSortChange}
            aria-label="Sort transactions"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-700 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
          >
            <option value="date-desc">
              Newest first
            </option>

            <option value="date-asc">
              Oldest first
            </option>

            <option value="amount-desc">
              Highest amount
            </option>

            <option value="amount-asc">
              Lowest amount
            </option>

            <option value="title-asc">
              Title A–Z
            </option>
          </select>
        </div>
      </div>

      {/* Transactions */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-6 py-5">
          <p className="text-sm font-medium text-zinc-500">
            Expense history
          </p>

          <h2 className="mt-1 text-xl font-semibold text-zinc-950">
            All transactions
          </h2>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={loadExpenses}
          />
        ) : !hasTransactions ? (
          <EmptyState />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <caption className="sr-only">
                  Expense transactions
                </caption>

                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Expense
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Category
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Date
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Amount
                    </th>

                    <th className="w-12 px-4 py-3">
                      <span className="sr-only">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {expenses.map((expense) => {
                    const Icon =
                      CATEGORY_ICONS[
                        expense.category
                      ] || WalletCards;

                    const expenseId =
                      getExpenseId(expense);

                    return (
                      <tr
                        key={expenseId}
                        className="transition hover:bg-zinc-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                              <Icon
                                size={17}
                                className="text-zinc-700"
                              />
                            </div>

                            <p className="text-sm font-medium text-zinc-950">
                              {expense.title}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                            {expense.category}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {formatDate(expense.date)}
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-semibold text-zinc-950">
                          {formatCurrency(
                            expense.amount
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="relative flex justify-end">
                            <button
                              type="button"
                              aria-label={`Actions for ${expense.title}`}
                              onClick={(event) => {
                                event.stopPropagation();

                                setShowActions(
                                  (current) =>
                                    current ===
                                    expenseId
                                      ? null
                                      : expenseId
                                );
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950"
                            >
                              <MoreHorizontal
                                size={18}
                              />
                            </button>

                            {showActions ===
                              expenseId && (
                              <ActionMenu
                                onEdit={() =>
                                  handleEdit(
                                    expense
                                  )
                                }
                                onDelete={() =>
                                  handleDeleteClick(
                                    expense
                                  )
                                }
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-zinc-100 md:hidden">
              {expenses.map((expense) => {
                const Icon =
                  CATEGORY_ICONS[
                    expense.category
                  ] || WalletCards;

                const expenseId =
                  getExpenseId(expense);

                return (
                  <div
                    key={expenseId}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                        <Icon
                          size={17}
                          className="text-zinc-700"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-950">
                          {expense.title}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {expense.category} •{" "}
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-center gap-2">
                      <p className="shrink-0 text-sm font-semibold text-zinc-950">
                        {formatCurrency(
                          expense.amount
                        )}
                      </p>

                      <button
                        type="button"
                        aria-label={`Actions for ${expense.title}`}
                        onClick={(event) => {
                          event.stopPropagation();

                          setShowActions(
                            (current) =>
                              current === expenseId
                                ? null
                                : expenseId
                          );
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-950"
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {showActions === expenseId && (
                        <ActionMenu
                          onEdit={() =>
                            handleEdit(expense)
                          }
                          onDelete={() =>
                            handleDeleteClick(
                              expense
                            )
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && hasTransactions && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
            <p className="text-sm text-zinc-500">
              {pagination.total ||
                expenses.length}{" "}
              transaction
              {(pagination.total ||
                expenses.length) === 1
                ? ""
                : "s"}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (current) => current - 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="min-w-16 text-center text-sm text-zinc-600">
                Page {pagination.page || page}{" "}
                of {pagination.pages || 1}
              </span>

              <button
                type="button"
                disabled={
                  page >=
                  (pagination.pages || 1)
                }
                onClick={() =>
                  setPage(
                    (current) => current + 1
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Add Expense */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() =>
            setShowAddExpense(false)
          }
          onSuccess={async () => {
            setShowAddExpense(false);
            await loadExpenses();
          }}
        />
      )}

      {/* Edit Expense */}
      {selectedExpense && (
        <EditExpenseModal
          expense={selectedExpense}
          onClose={() =>
            setSelectedExpense(null)
          }
          onSuccess={async () => {
            setSelectedExpense(null);
            await loadExpenses();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal &&
        expenseToDelete && (
          <DeleteModal
            expense={expenseToDelete}
            loading={deleteLoading}
            onCancel={() => {
              setShowDeleteModal(false);
              setExpenseToDelete(null);
            }}
            onConfirm={handleDelete}
          />
        )}

        {/* Toast */}
        {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   ACTION MENU
------------------------------------------------------- */

function ActionMenu({ onEdit, onDelete }) {
  return (
    <div
      onClick={(event) =>
        event.stopPropagation()
      }
      className="absolute right-0 top-9 z-30 w-36 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg"
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
      >
        <Pencil size={15} />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete
      </button>
    </div>
  );
}

/* -------------------------------------------------------
   EDIT MODAL
------------------------------------------------------- */

function EditExpenseModal({
  expense,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    title: expense.title || "",
    amount: expense.amount || "",
    category: expense.category || "",
    date: getDateInputValue(expense.date),
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError(
        "Please enter an expense title."
      );
      return;
    }

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      return;
    }

    if (!formData.category) {
      setError(
        "Please select a category."
      );
      return;
    }

    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    const expenseId = getExpenseId(expense);

    if (!expenseId) {
      setError(
        "Could not identify this expense."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateExpense(expenseId, {
        title: formData.title.trim(),
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
      });

      onSuccess();
    } catch (err) {
      console.error(err);

      const apiErrors =
        err.response?.data?.errors;

      if (
        Array.isArray(apiErrors) &&
        apiErrors.length > 0
      ) {
        setError(apiErrors[0].message);
      } else {
        setError(
          err.response?.data?.message ||
            "Could not update the expense."
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
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-zinc-950">
              Edit expense
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Update this transaction.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="edit-title"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Title
            </label>

            <input
              id="edit-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              autoComplete="off"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-amount"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                ₹
              </span>

              <input
                id="edit-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                inputMode="decimal"
                className="w-full rounded-xl border border-zinc-200 py-2.5 pl-8 pr-3.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-category"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Category
            </label>

            <select
              id="edit-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-date"
              className="mb-2 block text-sm font-medium text-zinc-800"
            >
              Date
            </label>

            <input
              id="edit-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   DELETE MODAL
------------------------------------------------------- */

function DeleteModal({
  expense,
  loading,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
          <Trash2
            size={19}
            className="text-red-600"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-zinc-950">
          Delete expense?
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Are you sure you want to delete{" "}
          <span className="font-medium text-zinc-900">
            {expense.title}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   STATES
------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
        Loading transactions...
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <Receipt
          size={17}
          className="text-red-500"
        />
      </div>

      <p className="mt-3 text-sm font-medium text-zinc-900">
        Something went wrong
      </p>

      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <Receipt
          size={20}
          className="text-zinc-500"
        />
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-900">
        No transactions found
      </p>

      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Try changing your search or category
        filter.
      </p>
    </div>
  );
}

export default Transactions;