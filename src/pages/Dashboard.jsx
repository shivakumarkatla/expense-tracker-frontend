import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  IndianRupee,
  MoreHorizontal,
  Plus,
  Receipt,
  TrendingUp,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  WalletCards,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  getDashboard,
} from "../services/expenseService";

import AddExpenseModal from "../components/AddExpenseModal";

const CATEGORY_ICONS = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Travel: Car,
  Entertainment: Film,
};

const CATEGORY_COLORS = [
  "#18181b",
  "#52525b",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#e4e4e7",
  "#3f3f46",
  "#27272a",
];

function formatCurrency(value = 0) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatShortDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatFullDate(date) {
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

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddExpense, setShowAddExpense] =
    useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboard();

      setData(response?.data ?? response);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Could not load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const categoryData = useMemo(() => {
    return data?.categoryWiseTotals || [];
  }, [data]);

  const spendingTrend = useMemo(() => {
    return (data?.spendingTrend || []).map(
      (item) => ({
        ...item,
        label: formatShortDate(item.date),
      })
    );
  }, [data]);

  const recentTransactions =
    data?.recentTransactions || [];

  const hasExpenses =
    Number(data?.totalCount || 0) > 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorState
          message={error}
          onRetry={loadDashboard}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            A quick overview of your spending.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowAddExpense(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          <Plus size={17} />
          Add expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total spending"
          value={formatCurrency(
            data?.totalExpenses
          )}
          icon={CircleDollarSign}
        />

        <SummaryCard
          label="This month"
          value={formatCurrency(
            data?.monthlyExpenses
          )}
          icon={CalendarDays}
        />

        <SummaryCard
          label="Total expenses"
          value={data?.totalCount || 0}
          icon={Receipt}
        />

        <SummaryCard
          label="Monthly expenses"
          value={data?.monthlyCount || 0}
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Spending Trend */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Spending trend
              </p>

              <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                This month
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
              <TrendingUp
                size={18}
                className="text-zinc-700"
              />
            </div>
          </div>

          {!hasExpenses ||
          spendingTrend.length === 0 ? (
            <ChartEmptyState
              message="Add expenses to see your spending trend."
            />
          ) : (
            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={spendingTrend}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e4e4e7"
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#71717a",
                    }}
                    dy={8}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 12,
                      fill: "#71717a",
                    }}
                    tickFormatter={(value) =>
                      `₹${value}`
                    }
                    width={55}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#d4d4d8",
                    }}
                    formatter={(value) => [
                      formatCurrency(value),
                      "Spending",
                    ]}
                    labelFormatter={(_, payload) => {
                      const date =
                        payload?.[0]?.payload
                          ?.date;

                      return date
                        ? formatFullDate(date)
                        : "";
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#18181b"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#18181b",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Category Breakdown */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Breakdown
              </p>

              <h2 className="mt-1 text-xl font-semibold text-zinc-950">
                By category
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
              <WalletCards
                size={18}
                className="text-zinc-700"
              />
            </div>
          </div>

          {!hasExpenses ||
          categoryData.length === 0 ? (
            <ChartEmptyState
              message="Add expenses to see your category breakdown."
            />
          ) : (
            <>
              <div className="relative mt-4 h-56">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="category"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {categoryData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${entry.category}`}
                            fill={
                              CATEGORY_COLORS[
                                index %
                                  CATEGORY_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Spending",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs text-zinc-500">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-semibold text-zinc-950">
                    {formatCurrency(
                      data?.monthlyExpenses
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {categoryData
                  .slice(0, 5)
                  .map((item, index) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[
                                index %
                                  CATEGORY_COLORS.length
                              ],
                          }}
                        />

                        <span className="text-sm text-zinc-600">
                          {item.category}
                        </span>
                      </div>

                      <span className="text-sm font-medium text-zinc-950">
                        {formatCurrency(
                          item.total
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Monthly Snapshot */}
      <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Monthly snapshot
            </p>

            <h2 className="mt-1 text-xl font-semibold text-zinc-950">
              September spending
            </h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
            <IndianRupee
              size={18}
              className="text-zinc-700"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <SnapshotCard
            label="Spent this month"
            value={formatCurrency(
              data?.monthlyExpenses
            )}
          />

          <SnapshotCard
            label="Transactions"
            value={data?.monthlyCount || 0}
          />

          <SnapshotCard
            label="Average transaction"
            value={formatCurrency(
              data?.monthlyCount
                ? data.monthlyExpenses /
                    data.monthlyCount
                : 0
            )}
          />
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-zinc-500">
              Activity
            </p>

            <h2 className="mt-1 text-xl font-semibold text-zinc-950">
              Recent transactions
            </h2>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            View all
            <ChevronRight size={16} />
          </button>
        </div>

        {!hasExpenses ? (
          <EmptyTransactions />
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentTransactions.map(
              (expense) => {
                const Icon =
                  CATEGORY_ICONS[
                    expense.category
                  ] || CreditCard;

                return (
                  <div
                    key={expense._id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-zinc-50"
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
                          {formatFullDate(
                            expense.date
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="shrink-0 text-sm font-semibold text-zinc-950">
                        {formatCurrency(
                          expense.amount
                        )}
                      </p>

                      <MoreHorizontal
                        size={18}
                        className="text-zinc-300"
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() =>
            setShowAddExpense(false)
          }
          onSuccess={async () => {
            setShowAddExpense(false);
            await loadDashboard();
          }}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------
   COMPONENTS
------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-zinc-500">
          {label}
        </p>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100">
          <Icon
            size={17}
            className="text-zinc-700"
          />
        </div>
      </div>

      <p className="mt-5 text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function SnapshotCard({ label, value }) {
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function ChartEmptyState({ message }) {
  return (
    <div className="flex h-72 items-center justify-center text-center">
      <div>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
          <TrendingUp
            size={18}
            className="text-zinc-500"
          />
        </div>

        <p className="mt-3 text-sm font-medium text-zinc-800">
          No spending data
        </p>

        <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
          {message}
        </p>
      </div>
    </div>
  );
}

function EmptyTransactions() {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
        <Receipt
          size={20}
          className="text-zinc-500"
        />
      </div>

      <p className="mt-4 text-sm font-medium text-zinc-900">
        No transactions yet
      </p>

      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Add your first expense to start
        tracking your spending.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-950" />
        Loading dashboard...
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
        <ArrowDownRight
          size={19}
          className="text-red-600"
        />
      </div>

      <p className="mt-4 text-sm font-semibold text-zinc-950">
        Something went wrong
      </p>

      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}

export default Dashboard;