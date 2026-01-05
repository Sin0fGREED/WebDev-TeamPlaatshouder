import { useEffect, useState } from "react";
import { X } from "lucide-react";

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

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    fetchPage();
  }, []);

  async function fetchPage() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notifications?page=1&pageSize=200&includeRead=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) setItems(json);
      }
    } catch {
    }
  }

  async function dismiss(id: string) {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok || res.status === 204) {
        setItems(i => i.map(it => it.id === id ? { ...it, isRead: true } : it));
      }
    } catch {
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      {items.length === 0 && <div className="text-sm text-gray-500">No notifications</div>}
      <div className="flex flex-col gap-3">
        {items.map(n => (
          <div key={n.id} className="p-3 border border-border/40 rounded">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{n.actorName} <span className="text-xs text-gray-400">· {n.action}</span></div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
              </div>
              <button onClick={() => dismiss(n.id)} className="p-2 text-gray-500 hover:text-gray-700"><X className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
