import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateEvent } from "./api";

// Helpers to convert between ISO and <input type="datetime-local">
function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  // format: YYYY-MM-DDTHH:mm (local)
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function toIsoFromLocalInput(value: string) {
  // value is local like "2025-09-18T10:30"
  // new Date(value) treats it as local & we serialize to ISO (UTC)
  return new Date(value).toISOString();
}

export default function CreateEventPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const create = useCreateEvent();

  // Prefill from query params (from the calendar selection)
  const startQ = search.get("start");
  const endQ = search.get("end");

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startLocal, setStartLocal] = useState(toLocalInputValue(startQ));
  const [endLocal, setEndLocal] = useState(toLocalInputValue(endQ));
  const [error, setError] = useState<string | null>(null);

  // basic derived validity
  const isValid = useMemo(() => {
    if (!title.trim()) return false;
    if (!startLocal || !endLocal) return false;
    const s = new Date(startLocal);
    const e = new Date(endLocal);
    return s < e;
  }, [title, startLocal, endLocal]);

  useEffect(() => {
    setError(null);
  }, [title, startLocal, endLocal]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Please provide a title and a valid time range (end after start).");
      return;
    }

    const payload = {
      title: title.trim(),
      startUtc: toIsoFromLocalInput(startLocal),
      endUtc: toIsoFromLocalInput(endLocal),
      roomId: undefined as string | undefined, // wire up when you add rooms
    };

    try {
      await create.mutateAsync(payload);
      // React Query invalidates ["events"] in the hook’s onSuccess already.
      navigate("/dashboard"); // or go back to the calendar page you prefer
    } catch (err: any) {
      setError(err?.response?.data?.title ?? "Failed to create event. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Create New Event</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          Fill in the details to schedule your event.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm mb-1">Event Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Budget Review"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">Start</label>
              <input
                type="datetime-local"
                value={startLocal}
                onChange={(e) => setStartLocal(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End</label>
              <input
                type="datetime-local"
                value={endLocal}
                onChange={(e) => setEndLocal(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Conference Room A / Virtual"
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-300/50 bg-rose-50 px-3 py-2 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-border/60 bg-muted px-4 py-2 hover:bg-gray-200 dark:hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              disabled={create.isPending || !isValid}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {create.isPending ? "Saving..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
