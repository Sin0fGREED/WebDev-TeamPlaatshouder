import { useEffect } from "react";
import { hub } from "./realtime";
import { useQueryClient } from "@tanstack/react-query";

export default function RealtimeBridge() {
  const qc = useQueryClient();

  useEffect(() => {
    let stopped = false;

    async function ensureStarted() {
      if (hub.state === "Disconnected") {
        try { await hub.start(); } catch { /* retry on reconnect */ }
      }
    }

    const bump = () => qc.invalidateQueries({ queryKey: ["events"] });

    hub.on("event:created", bump);
    hub.on("event:updated", bump);
    hub.on("event:deleted", bump);

    ensureStarted();

    const onReconnected = () => bump();
    const onClose = () => { /* optional logging */ };

    hub.onreconnected(onReconnected);
    hub.onclose(onClose);

    return () => {
      if (!stopped) {
        hub.off("event:created", bump);
        hub.off("event:updated", bump);
        hub.off("event:deleted", bump);
        hub.onreconnected(undefined as any);
        hub.onclose(undefined as any);
        // don't stop() here—keep connection global across route switches
      }
    };
  }, [qc]);

  return null;
}
