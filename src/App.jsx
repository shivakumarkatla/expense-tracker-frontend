import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "./components/layout/AppShell";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            element={<AppShell />}
          >
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/transactions"
              element={<Transactions />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;