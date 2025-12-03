import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, CalendarDays, UserCircle2, Plus, Cog, LogOut, Menu } from "lucide-react";
import {ThemeToggle} from "../../components/ThemeToggle";
import Magnifier from "../../components/Magnifier";
import { useAuth } from "../providers/AuthProvider";
import { useEffect, useState } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import NotificationIcon from "@/components/NotificationIcon";

const navLink =
  ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-3 py-2 overflow-hidden transition-all duration-150 ease-in-out ${
    isActive 
    ? "rounded-xl hover:text-white bg-blue-500 dark:bg-white-700/15 text-white dark:bg-white/10 dark:text-white shadow-sm"
    : "hover:rounded-xl hover:bg-blue-900/10 hover:text-blue-700 nav-inactive"}`;

export default function RootLayout() {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('sidebar-collapsed') === 'true');

  useEffect(() => { localStorage.setItem('sidebar-collapsed', String(collapsed)); }, [collapsed]);

  return (
    <div className="min-h-screen">
      {/* Mount global magnifier (listens for access-magnifier class) */}
      <Magnifier />
      <div className="flex">
        {/* Sidebar */}
  <aside className={`hidden md:flex sticky top-0 self-start ${collapsed ? 'w-20' : 'w-64'} h-screen flex-col gap-6 border-r border-border/60 bg-[rgb(var(--panel))] p-4 overflow-y-auto transition-width duration-200` }>
          <div className="flex items-center gap-0 px-3 pt-3">
            <div className="h-8 w-8 rounded-lg brand" />
            {!collapsed && <div className="font-semibold">Office Calendar</div>}
            <button aria-label="Toggle sidebar" onClick={() => setCollapsed(c => !c)} className="ml-auto rounded p-1 hover:bg-white/5">
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <NavLink to="/dashboard" className={navLink}>
              <LayoutDashboard className="h-5 w-5" />
              {!collapsed && 'Dashboard'}
            </NavLink>
            <NavLink to="/calendar" className={navLink}>
              <CalendarDays className="h-5 w-5" />
              {!collapsed && 'Calendar'}
            </NavLink>
            <NavLink to="/presence" className={navLink}>
              <UserCircle2 className="h-5 w-5" />
              {!collapsed && 'Team Presence'}
            </NavLink>
            <NavLink to="/events/new" className={navLink}>
              <Plus className="h-5 w-5" />
              {!collapsed && 'Create Event'}
            </NavLink>

            <div className="mt-4 px-2 text-xs uppercase text-gray-400">Settings</div>
            <NavLink to="/account" className={navLink}>
              <Cog className="h-5 w-5" />
              {!collapsed && 'Account Settings'}
            </NavLink>
          </nav>

          <div className="mt-auto">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && 'Logout'}
            </button>
            <div className="mt-6 px-2 text-xs text-gray-400">Made with ♥</div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <div className="sticky top-0 z-10 border-b border-border/60 bg-[rgb(var(--bg))]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--bg))]/60">
            <div className="flex w-full items-center justify-between px-6 py-3">
              <div className="flex items-center gap-6">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `relative group inline-block overflow-hidden text-sm px-2 py-1 transition-all duration-150 ease-in-out ${
                      isActive
                        ? "rounded-xl hover:text-white bg-blue-500 dark:bg-white-700/15 text-white dark:bg-white/10 dark:text-white shadow-sm"
                        : "hover:rounded-xl hover:bg-blue-900/10 hover:text-blue-700 nav-inactive text-gray-600 dark:text-gray-300"}`
                  }
                >
                  Dashboard
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  />
                </NavLink>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    `relative group inline-block overflow-hidden text-sm px-2 py-1 transition-all duration-150 ease-in-out ${
                      isActive
                        ? "rounded-xl hover:text-white bg-blue-500 dark:bg-white-700/15 text-white dark:bg-white/10 dark:text-white shadow-sm"
                        : "hover:rounded-xl hover:bg-blue-900/10 hover:text-blue-700 nav-inactive text-gray-600 dark:text-gray-300"}`
                  }>
                  Calendar
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  />
                </NavLink>
                <NavLink
                  to="/presence"
                  className={({ isActive }) =>
                    `relative group inline-block overflow-hidden text-sm px-2 py-1 transition-all duration-150 ease-in-out ${
                      isActive
                        ? "rounded-xl hover:text-white bg-blue-500 dark:bg-white-700/15 text-white dark:bg-white/10 dark:text-white shadow-sm"
                        : "hover:rounded-xl hover:bg-blue-900/10 hover:text-blue-700 nav-inactive text-gray-600 dark:text-gray-300"}`
                  }
                >
                  Team presence
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#8b1e3f] origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  />
                </NavLink>
              </div>
              <div className="flex items-center gap-3">
                <NavLink
                  to="/events/new"
                  className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transform transition-all duration-150 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" /> New Event
                </NavLink>
                <NotificationIcon />
                <HamburgerMenu />
              </div>
            </div>
          </div>

          {/* Floating New Event button for small screens / quick access */}
          <NavLink to="/events/new" className="fixed right-4 top-4 z-50 inline-flex items-center gap-2 rounded-full px-4 py-2 btn-accent shadow-lg sm:hidden transform transition-all duration-150 ease-out hover:-translate-y-1 hover:scale-105 hover:shadow-xl" aria-label="New Event">
            <Plus className="h-4 w-4" /> New Event
          </NavLink>

          {/* Routed content */}
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
