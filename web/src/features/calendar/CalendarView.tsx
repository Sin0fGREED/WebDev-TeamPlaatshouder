import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { useEvents, useCreateEvent } from '../events/api';


export default function CalendarView() {
  const [range, setRange] = useState({
    from: new Date().toISOString(),
    to: new Date(Date.now() + 7 * 864e5).toISOString(),
  });
  const { data: events } = useEvents(range.from, range.to);
  const navigate = useNavigate()


  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Team Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={events?.map((e) => ({ id: e.id, title: e.title, start: e.startUtc, end: e.endUtc, roomId: e.roomId }))}
        selectable
        select={(sel) => {
          navigate(
            `/events/new?start=${encodeURIComponent(sel.startStr)}&end=${encodeURIComponent(sel.endStr)}`
          );
        }}
        datesSet={(arg) => setRange({ from: arg.startStr, to: arg.endStr })}
        height="auto"
      />
    </div>
  );
}
