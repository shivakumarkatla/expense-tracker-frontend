import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: Receipt,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("expense_token");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-zinc-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-white">
          <WalletCards size={21} />
        </div>

        <div>
          <h1 className="text-sm font-semibold text-zinc-950">
            Expense Tracker
          </h1>

          <p className="text-xs text-zinc-500">
            Personal finance
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-100 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;