import { Bell } from "lucide-react";

function Header({ activePage }) {
  const pageTitle =
    activePage === "transactions"
      ? "Transactions"
      : "Dashboard";

  const pageLabel =
    activePage === "transactions"
      ? "Activity"
      : "Overview";

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-5 md:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {pageLabel}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-zinc-950">
          {pageTitle}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
        >
          <Bell size={18} />
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-semibold text-white">
          S
        </div>
      </div>
    </header>
  );
}

export default Header;