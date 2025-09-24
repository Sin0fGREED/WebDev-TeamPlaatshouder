import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import RequireAuth from "./providers/RequireAuth";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CalendarView from "../features/calendar/CalendarView";

// When ready, you can point these to your existing feature pages:
// import CalendarPage from "@/features/events/pages/CalendarPage";
// import TeamPresencePage from "@/features/presence/pages/TeamPresencePage";

function Placeholder({ title }: { title: string }) {
  return <div><h1 className="text-xl font-semibold">{title}</h1></div>;
}

const TeamPresencePage = () => <Placeholder title="Team Presence" />;

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <RequireAuth><DashboardPage /></RequireAuth> },
      { path: "/calendar", element: <RequireAuth><CalendarView /></RequireAuth> },
      { path: "/presence", element: <RequireAuth><TeamPresencePage /></RequireAuth> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
]);
