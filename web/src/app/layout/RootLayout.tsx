import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  UserCircle2,
  Plus,
  Cog,
  LogOut,
  Layout,
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { useAuth } from "../providers/AuthProvider";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 transition ${
    isActive
      ? "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
      : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200"
  }`;

export default function RootLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-6 border-r border-border/60 bg-[rgb(var(--panel))] p-4">
          <div className="flex items-center gap-2 px-2 pt-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <div className="font-semibold">Office Calendar</div>
          </div>

          <nav className="flex flex-col gap-1">
            <NavLink to="/dashboard" className={navLink}>
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink to="/calendar" className={navLink}>
              <CalendarDays className="h-5 w-5" />
              Calendar
            </NavLink>
            <NavLink to="/presence" className={navLink}>
              <UserCircle2 className="h-5 w-5" />
              Team Presence
            </NavLink>
            <NavLink to="/events/new" className={navLink}>
              <Plus className="h-5 w-5" />
              Create Event
            </NavLink>

            <div className="mt-4 px-2 text-xs uppercase text-gray-400">
              Settings
            </div>
            <NavLink to="/account" className={navLink}>
              <Cog className="h-5 w-5" />
              Account Settings
            </NavLink>
          </nav>

          <div className="mt-auto">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
            <div className="mt-6 px-2 text-xs text-gray-400">Made with ♥</div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-border/60 bg-[rgb(var(--bg))]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-6">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `relative group inline-block text-sm px-2 py-1 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300"
                    }`
                  }
                >
                  Dashboard
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </NavLink>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `relative group inline-block text-sm px-2 py-1 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300"
                    }`
                  }
                >
                  Calendar
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </NavLink>
                <NavLink
                  to="/presence"
                  className={({ isActive }) =>
                    `relative group inline-block text-sm px-2 py-1 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300"
                    }`
                  }
                >
                  Team presence
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                  />
                </NavLink>
              </div>
              <div className="flex items-center gap-3">
                <NavLink
                  to="/events/new"
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" /> New Event
                </NavLink>
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* Routed content */}
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
