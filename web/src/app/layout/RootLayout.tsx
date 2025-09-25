import { Link, Outlet, NavLink } from "react-router-dom";
import type { NavLinkProps, NavLinkRenderProps } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function RootLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">OfficeCalendar</Link>
          <nav className="flex items-center gap-4">
            {isAuthenticated && (
              <>
                <NavLink to="/" className={({ isActive }: NavLinkRenderProps) => isActive ? "text-blue-600 font-medium" : "text-gray-700"}>
                  Dashboard
                </NavLink>
                <NavLink to="/calendar" className={({ isActive }: NavLinkRenderProps) => isActive ? "text-blue-600 font-medium" : "text-gray-700"}>
                  Calendar
                </NavLink>
                <NavLink to="/presence" className={({ isActive }: NavLinkRenderProps) => isActive ? "text-blue-600 font-medium" : "text-gray-700"}>
                  Team Presence
                </NavLink>
              </>
            )}
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className="text-gray-700">Login</NavLink>
                <NavLink to="/register" className="text-gray-700">Register</NavLink>
              </>
            ) : (
              <button
                onClick={logout}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-800"
              >
                Logout {user?.email ? `(${user.email})` : ""}
              </button>
            )}
          </nav>
        </div>
      </header >

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div >
  );
}
