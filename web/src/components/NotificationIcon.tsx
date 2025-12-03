import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { hub } from "@/lib/realtime";
import { useNavigate } from "react-router-dom";

type Notification = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  message: string;
  eventId?: string | null;
  timestamp: string;
  isRead?: boolean;
};

export default function NotificationIcon() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [allItems, setAllItems] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function ensure() {
      if (hub.state === "Disconnected") {
        try { await hub.start(); } catch { /* ignore */ }
      }
    }

    ensure();

    // load persisted notifications (first page) and set unread count
    async function loadInitial() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notifications?page=1&pageSize=20`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            setItems(json);
            setUnreadCount(json.length);
          }
        }
      } catch {
        // ignore
      }
    }

    loadInitial();

    const handler = (payload: any) => {
      const n: Notification = {
        id: payload.id ?? `${Date.now()}`,
        actorId: payload.actorId ?? payload.actorID ?? "",
        actorName: payload.actorName ?? payload.actorName ?? "Unknown",
        action: payload.action ?? "",
        message: payload.message ?? "",
        eventId: payload.eventId ?? null,
        timestamp: payload.timestamp ?? new Date().toISOString(),
      };
      if (!mounted) return;
      setItems(s => [n, ...s].slice(0, 20));
      setUnreadCount(c => c + 1);
      // keep the full list in sync so "See all" reflects realtime notifications too
      setAllItems(a => [n, ...a].slice(0, 200));
    };

    hub.on("notification:created", handler);

    return () => {
      mounted = false;
      hub.off("notification:created", handler);
    };
  }, []);

  const unread = unreadCount;

  // fetch all notifications (used by "See all notifications")
  async function fetchAllNotifications() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notifications?page=1&pageSize=200`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          setAllItems(json);
        }
      }
    } catch {
      // ignore
    }
  }

  const navigate = useNavigate();

  return (
    <div className="relative">
      <button aria-label="Notifications" onClick={() => setOpen(s => !s)} className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unread > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-600 rounded-full">{unread}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-border/60 rounded-lg shadow-lg z-50 overflow-hidden">
          {!showAll ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="text-sm font-semibold">Notifications</div>
                <button onClick={() => { setItems([]); setUnreadCount(0); }} className="text-xs text-gray-500 hover:text-gray-700">Clear</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {items.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
                {items.map(n => (
                  <div key={n.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-border/40">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-semibold">{n.actorName?.[0] ?? "?"}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{n.actorName} <span className="text-xs text-gray-400">· {n.action}</span></div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                      </div>
                      <button
                        onClick={async () => {
                          // dismiss on server for this user
                          try {
                            const token = localStorage.getItem("token");
                            await fetch(`${import.meta.env.VITE_API_BASE}/api/notifications/${n.id}`, {
                              method: "DELETE",
                              headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                            });
                          } catch {
                            // ignore errors - still remove locally
                          }
                          setItems(s => s.filter(x => x.id !== n.id));
                          setUnreadCount(c => Math.max(0, c - 1));
                          // mark as read in the allItems cache so the All Notifications page shows it as read
                          setAllItems(a => a.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-border/60 text-center">
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  See all notifications
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                <div className="text-sm font-semibold">All Notifications</div>
                <button onClick={() => setShowAll(false)} className="text-xs text-gray-500 hover:text-gray-700">Close</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {allItems.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
                {allItems.map(n => (
                  <div key={n.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-border/40">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-semibold">{n.actorName?.[0] ?? "?"}</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{n.actorName} <span className="text-xs text-gray-400">· {n.action}</span></div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{n.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
