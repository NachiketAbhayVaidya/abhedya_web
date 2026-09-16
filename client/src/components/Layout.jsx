import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/auth";
import { Button } from "./ui";
import toast from "react-hot-toast";

const NAV_ITEMS = {
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/guards", label: "Guards" },
    { to: "/admin/clients", label: "Clients" },
    { to: "/admin/sites", label: "Sites" },
    { to: "/admin/payments", label: "Payments" },
    { to: "/admin/complaints", label: "Complaints" },
  ],
  guard: [
    { to: "/guard", label: "Dashboard", end: true },
    { to: "/guard/shifts", label: "Shift History" },
    { to: "/guard/payments", label: "Payments" },
  ],
  client: [
    { to: "/client", label: "Dashboard", end: true },
    { to: "/client/complaints", label: "Complaints" },
    { to: "/client/subscription", label: "Subscription" },
  ],
};

export default function Layout() {
  const { user, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const items = NAV_ITEMS[user?.role] || [];

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      clearSession();
      navigate("/login");
      toast.success("Logged out");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold text-indigo-700">Abhedya Security</span>
            <nav className="hidden gap-1 md:flex">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <p className="font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs capitalize text-slate-400">{user?.role}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1 md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
