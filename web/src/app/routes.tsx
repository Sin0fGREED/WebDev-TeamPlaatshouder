import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import DashboardPage from "../features/dashboard/pages/DashboardPage"
import PresencePage from "../features/presence/PresencePage";
import CreateEventPage from "../features/events/CreateEventsPage";
import LoginPage from "../features/auth/pages/LoginPage";
import RequireAuth from "./providers/RequireAuth";
import CalendarPage from "../features/calendar/CalendarPage";
import ViewEventPage from "../features/events/ViewEventPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <RequireAuth><RootLayout /></RequireAuth>, // gate everything below
    children: [

      { path: "/", element: <DashboardPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/calendar", element: <CalendarPage /> },
      { path: "/presence", element: <PresencePage /> },
      { path: "/events/new", element: <CreateEventPage /> },
      { path: "/events/:event_id", element: <ViewEventPage /> },
      { path: "/account", element: <div className="card p-6">Account Settings</div> }
    ],
  },
]);
