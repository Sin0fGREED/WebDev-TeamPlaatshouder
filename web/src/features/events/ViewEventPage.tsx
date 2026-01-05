import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEvent } from "./api";

function formatRange(startUtc?: string, endUtc?: string) {
  if (!startUtc || !endUtc) return "";
  const s = new Date(startUtc);
  const e = new Date(endUtc);
  const date = s.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "2-digit" });
  const startTime = s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endTime = e.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} · ${startTime} – ${endTime}`;
}

export default function ViewEventPage() {
  const { event_id } = useParams();

  const { data: event, isLoading, isError } = useEvent(event_id!);
  const timeRange = useMemo(() => formatRange(event?.startUtc, event?.endUtc), [event?.startUtc, event?.endUtc]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        {isLoading ? (
          <div className="text-sm text-gray-500 dark:text-gray-300">Loading…</div>
        ) : isError ? (
          <div className="text-sm text-rose-500">Failed to load event.</div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-semibold">{event?.title}</h2>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">{timeRange}</div>
              </div>
              <div className="shrink-0 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                Event
              </div>
            </div>

            {event?.description ? (
              <div className="mt-4 rounded-xl border border-border/40 bg-muted/40 p-4 text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                {event.description}
              </div>
            ) : null}

            {event?.attendees?.length ? (
              <div className="mt-6">
                <div className="mb-3 text-sm font-semibold">Attendees</div>
                <div className="grid gap-3">
                  {event.attendees.map((a) => (
                    <div key={a.id} className="rounded-xl border border-border/60 bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{a.employee.user.email}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">{a.employee.role}</div>
                        </div>
                        <div className="shrink-0 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs">
                          {a.response}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div >
  );
}

