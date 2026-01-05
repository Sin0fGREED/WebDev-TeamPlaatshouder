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

      <aside className="card p-0 lg:sticky lg:top-6 lg:self-start">
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold">Upcoming Events</div>
            <button
              className="rounded-xl border border-border/60 bg-muted px-3 py-1.5 text-xs hover:bg-gray-200 dark:hover:bg-white/10"
              onClick={() => navigate("/calendar")}
            >
              Open Calendar
            </button>
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            Next {upcomingEvents.length || 0} event{upcomingEvents.length === 1 ? "" : "s"}
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-300">Loading…</div>
        ) : isError ? (
          <div className="px-6 pb-6 text-sm text-rose-500">
            Failed to load events{error ? `: ${String((error as any)?.message ?? error)}` : "."}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-gray-500 dark:text-gray-300">No upcoming events.</div>
        ) : (
          <div className="px-4 pb-4">
            <div className="max-h-[420px] space-y-3 overflow-auto pr-2">
              {upcomingEvents.map((e) => (
                <button
                  key={e.id}
                  className="group w-full rounded-2xl border border-border/60 bg-card/60 p-4 text-left shadow-sm transition hover:border-border hover:bg-card"
                  onClick={() => navigate(`/events/${e.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{e.title}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-300">
                        <span className="inline-flex items-center gap-2">
                          <span>🕘</span>
                          <span>{formatNextEventTime(e.startUtc)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 rounded-full border border-border/60 bg-muted px-3 py-1 text-[11px] text-gray-600 dark:text-gray-300 group-hover:bg-muted/80">
                      Details
                    </div>
                  </div>

                  {e.description ? (
                    <div className="mt-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-300">
                      {e.description}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}
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
