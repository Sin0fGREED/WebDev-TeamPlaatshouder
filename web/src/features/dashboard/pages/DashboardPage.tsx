import CalendarView from "../../calendar/CalendarView";
import { useOutletContext } from "react-router-dom";

import { useEvents } from "../../events/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type RootOutletCtx = { collapsed: boolean };


function formatNextEventTime(startUtc: string) {
  const d = new Date(startUtc);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();
  const { data: events, isLoading, isError, error, refetch } = useEvents(from, to);

  const { collapsed } = useOutletContext<RootOutletCtx>();

  useEffect(() => {
    // helps ensure dashboard is fresh after navigation
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upcomingEvents = (events ?? [])
    .filter((e) => new Date(e.startUtc).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startUtc).getTime() - new Date(b.startUtc).getTime())
    .slice(0, 5);

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

                  {e.roomId ? (
                    <div className="mt-3 line-clamp-2 text-xs text-gray-500 dark:text-gray-300">
                      {e.roomId}
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
