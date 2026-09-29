import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

function AppShell() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main
          id="main-content"
          className="flex-1 p-5 md:p-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;