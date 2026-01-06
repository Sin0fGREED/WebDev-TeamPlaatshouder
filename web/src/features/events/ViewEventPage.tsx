import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useEvent } from "./api";

function fmtDateUtc(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtTimeUtc(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  // HH:MM only
  return d.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function initials(email?: string) {
  if (!email) return "?";
  const name = email.split("@")[0] ?? email;
  const parts = name.split(/[._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? name[0] ?? "?";
  const b = parts[1]?.[0] ?? (name.length > 1 ? name[1] : "");
  return (a + b).toUpperCase();
}

function responseLabel(r?: string) {
  const v = (r ?? "").toLowerCase();
  if (v.includes("accept")) return { text: "Accepted", cls: "bg-green-500/15 text-green-700 dark:text-green-200" };
  if (v.includes("decline")) return { text: "Declined", cls: "bg-red-500/15 text-red-700 dark:text-red-200" };
  if (v.includes("tent")) return { text: "Tentative", cls: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-200" };
  if (v.includes("maybe")) return { text: "Tentative", cls: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-200" };
  return { text: r ?? "No response", cls: "bg-gray-500/15 text-gray-700 dark:text-gray-200" };
}

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

  const when = useMemo(() => {
    const start = event?.startUtc;
    const end = event?.endUtc;

    const date = fmtDateUtc(start);
    const startTime = fmtTimeUtc(start);
    const endTime = fmtTimeUtc(end);

    return { date, startTime, endTime };
  }, [event?.startUtc, event?.endUtc]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="card p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold truncate">
              {event?.title ?? "Event"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
              {event?.id}
            </p>
          </div>

          {/* When card */}
          <div className="shrink-0 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
              When (UTC)
            </div>
            <div className="mt-1 text-base font-semibold">
              {when.date || "—"}
            </div>
            <div className="mt-1 text-sm text-gray-700 dark:text-gray-200">
              {when.startTime || "—"}
              {when.endTime ? ` – ${when.endTime}` : ""}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-border/60" />

        {/* Attendees */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Attendees</h3>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            {event?.attendees?.length ?? 0} total
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {(event?.attendees ?? []).map((a) => {
            const email = a.email;
            const badge = responseLabel(a.response.toString());

            return (
              <div
                key={a.userId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-white/40 p-4 dark:bg-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-200 flex items-center justify-center font-semibold">
                    {initials(email)}
                  </div>

                  {/* Identity */}
                  <div className="min-w-0">
                    <div className="font-medium truncate">{email}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 truncate">
                      Employee
                    </div>
                  </div>
                </div>

                {/* Response badge */}
                <div className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}>
                  {badge.text}
                </div>
              </div>
            );
          })}

          {!event?.attendees?.length && (
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm text-gray-500 dark:text-gray-300">
              No attendees for this event.
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
