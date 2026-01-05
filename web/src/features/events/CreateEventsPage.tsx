import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateEvent } from "./api";
import { UserDto, useUsersQuery } from "../presence/api";

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

  const [attendees, setAttendees] = useState<{ userId: string; email: string; role?: string }[]>([]);
  const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const { data: users, isLoading: usersLoading } = useUsersQuery(userQuery);

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

  function addAttendee(user: UserDto) {
    setAttendees((prev) => {
      if (prev.some((a) => a.userId === user.id)) return prev;
      return [...prev, { userId: user.id, email: user.email }];
    });
  }

  function removeAttendee(userId: string) {
    setAttendees((prev) => prev.filter((a) => a.userId !== userId));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Please provide a title and a valid time range (end after start).");
      return;
    }

    //public record EventDto(Guid Id, string Title, DateTime StartUtc, DateTime EndUtc, Guid? roomId)
    const payload = {
      title: title.trim(),
      startUtc: toIsoFromLocalInput(startLocal),
      endUtc: toIsoFromLocalInput(endLocal),
      roomId: undefined as string | undefined, // wire up when you add rooms
      attendees: attendees.map(u => ({ userId: u.userId })),
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

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm mb-1">Attendees</label>
              <button
                type="button"
                className="rounded-xl border border-border/60 bg-muted px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-white/10"
                onClick={() => setIsAttendeeModalOpen(true)}
              >
                + Add users
              </button>
            </div>

            {attendees.length === 0 ? (
              <div className="mt-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-gray-500 dark:text-gray-300">
                No attendees yet. Added users will be invited with status <span className="font-medium">Pending</span>.
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {attendees.map((a) => (
                  <div
                    key={a.userId}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{a.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">
                        Pending
                      </div>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg border border-border/60 px-2 py-1 text-xs hover:bg-gray-200 dark:hover:bg-white/10"
                      onClick={() => removeAttendee(a.userId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
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

        {isAttendeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsAttendeeModalOpen(false)}
            />

            <div className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-card p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Add users</div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                    Search users and invite them to the event.
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-border/60 px-2 py-1 text-sm hover:bg-gray-200 dark:hover:bg-white/10"
                  onClick={() => setIsAttendeeModalOpen(false)}
                >
                  Close
                </button>
              </div>

              <div className="mt-4">
                <input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by email..."
                  autoFocus
                />
              </div>

              <div className="mt-3 max-h-72 overflow-auto rounded-xl border border-border/60">
                {usersLoading && (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-300">
                    Loading users…
                  </div>
                )}

                {!usersLoading && (users ?? []).length === 0 && (
                  <div className="p-3 text-sm text-gray-500 dark:text-gray-300">
                    No users found.
                  </div>
                )}

                {!usersLoading && (users ?? []).map((u) => {
                  const alreadyAdded = attendees.some(a => a.userId === u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => addAttendee(u)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-100 disabled:opacity-60 dark:hover:bg-white/10"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">
                          {u.role} • {u.status}
                        </div>
                      </div>
                      <div className="text-sm">
                        {alreadyAdded ? "Added" : "Add"}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl border border-border/60 bg-muted px-4 py-2 hover:bg-gray-200 dark:hover:bg-white/10"
                  onClick={() => setIsAttendeeModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

