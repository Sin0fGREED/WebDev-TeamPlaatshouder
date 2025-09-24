import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CalendarView from './features/calendar/CalendarView';
import { useEffect, useRef } from 'react';
import { hub } from './lib/realtime';
import * as signalR from '@microsoft/signalr';


const qc = new QueryClient();


export default function App() {
  const started = useRef(false);

  useEffect(() => {
    if (!started.current && hub.state === signalR.HubConnectionState.Disconnected) {
      started.current = true;
      hub.start().catch(() => { started.current = false; });
    }
    return () => { hub.stop(); };
  }, []);


  return (
    <QueryClientProvider client={qc}>
      <main className="min-h-dvh bg-slate-50">
        <CalendarView />
      </main>
    </QueryClientProvider>
  );
}
