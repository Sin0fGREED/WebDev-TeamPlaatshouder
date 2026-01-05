import CalendarView from "../../calendar/CalendarView";
import { useOutletContext } from "react-router-dom";
type RootOutletCtx = { collapsed: boolean };

export default function DashboardPage() {
  const { collapsed } = useOutletContext<RootOutletCtx>();
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <section className="card p-6">
        <div className="mb-4 text-lg font-semibold">Monthly Calendar</div>
        <CalendarView layoutKey={`sidebar-${collapsed ? "collapsed" : "open"}`} />
      </section>

      <aside className="card p-6">
        <div className="text-lg font-semibold">Next Event</div>
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-300">Budget Review</div>
        <div className="mt-4 space-y-2 text-sm">
          <div>🕘 Thu, Sep 25 at 10:00 AM</div>
          <div>📍 Conference Room B</div>
        </div>
        <button className="mt-6 w-full rounded-xl border border-border/60 bg-muted px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-white/10">
          View Details
        </button>
      </aside>

      <section className="card p-6 lg:col-span-2">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-3 text-lg font-semibold">Team Presence</div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Live overview of in-office / remote.</p>
          </div>
          <div>
            <div className="mb-3 text-lg font-semibold">Upcoming Events</div>
            <p className="text-sm text-gray-500 dark:text-gray-300">Your next meetings for this week.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
