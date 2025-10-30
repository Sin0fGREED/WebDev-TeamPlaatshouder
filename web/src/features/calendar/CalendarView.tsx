import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from 'react';
import { useEvents } from '../events/api';
import { EventContentArg } from '@fullcalendar/core';
import "./Calendar.css"

export default function CalendarView() {
  const [range, setRange] = useState({
    from: new Date().toISOString(),
    to: new Date(Date.now() + 7 * 864e5).toISOString(),
  });

  const { data: events } = useEvents(range.from, range.to);
  const navigate = useNavigate();

  // --- Zoom state ---
  // slotHeight controls visual height; slotDuration controls grid granularity
  const [zoom, setZoom] = useState(2); // 1x, 1.25x, 1.5x…
  const [slotDuration, setSlotDuration] = useState<'00:15:00' | '00:30:00' | '01:00:00'>('00:30:00')

  const slotHeightPx = useMemo(() => Math.round(28 * zoom), [zoom]);

  // derive min/max hours from events currently in view
  const { slotMinTime, slotMaxTime } = useMemo(() => {
    const baseMin = 7;      // your “working hours” start
    const baseMax = 20;     // your “working hours” end
    if (!events?.length) return { slotMinTime: `${String(baseMin).padStart(2, '0')}:00:00`, slotMaxTime: `${baseMax}:00:00` };

    const starts = events.map(e => new Date(e.startUtc));
    const ends = events.map(e => new Date(e.endUtc ?? e.startUtc));

    const earliest = Math.min(...starts.map(d => d.getHours()));
    const latest = Math.max(...ends.map(d => d.getHours() + (ends[0].getMinutes() ? 1 : 0)));

    const minHour = Math.min(baseMin, earliest);
    const maxHour = Math.max(baseMax, latest + 1); // +1 to avoid clipping the end

    return {
      slotMinTime: `${String(minHour).padStart(2, '0')}:00:00`,
      slotMaxTime: `${String(Math.min(24, maxHour)).padStart(2, '0')}:00:00`,
    };
  }, [events]);

  useEffect(() => {
    // Update the CSS variable so our CSS rules take effect
    document.documentElement.style.setProperty('--fc-slot-h', `${slotHeightPx}px`);
  }, [slotHeightPx]);

  const formattedEvents = useMemo(() => (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startUtc,     // FullCalendar wants `start`/`end`
    end: e.endUtc,
    extendedProps: {
      roomId: e.roomId,
      attendees: [{ id: '123', name: 'Feyo' }],
    },
  })), [events]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team Calendar</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70">Granularity</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value as any)}
          >
            <option value="01:00:00">60 min</option>
            <option value="00:30:00">30 min</option>
            <option value="00:15:00">15 min</option>
          </select>

          <div className="ml-3 flex items-center gap-1">
            <button
              className="border rounded px-2 py-1 text-sm"
              onClick={() => setZoom(z => Math.max(0.75, +(z - 0.25).toFixed(2)))}
              title="Zoom out"
            >−</button>
            <span className="w-10 text-center text-sm">{(zoom * 100).toFixed(0)}%</span>
            <button
              className="border rounded px-2 py-1 text-sm"
              onClick={() => setZoom(z => Math.min(2, +(z + 0.25).toFixed(2)))}
              title="Zoom in"
            >+</button>
          </div>
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={formattedEvents}
        eventClick={(eca) => {
        }}
        eventContent={(eventInfo) => <CustomEventContent eventInfo={eventInfo} />}
        eventClassNames={() => ['oc-event']}
        selectable
        select={(sel) => {
          navigate(`/events/new?start=${encodeURIComponent(sel.startStr)}&end=${encodeURIComponent(sel.endStr)}`);
        }}
        datesSet={(arg) => setRange({ from: arg.startStr, to: arg.endStr })}
        height="auto"

        /* Make the visible window smaller to increase vertical space per slot */
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        scrollTime="08:00:00"

        /* Granularity */
        slotDuration={slotDuration}
        slotLabelInterval={slotDuration}

        /* Helps when events overlap */
        eventOverlap={true}
        dayMaxEventRows={false}
        nowIndicator
      />
    </div>
  );
}

const CustomEventContent = ({ eventInfo }: { eventInfo: EventContentArg }) => {
  const { title } = eventInfo.event;
  const { roomId, attendees = [] } = eventInfo.event.extendedProps as { roomId?: string, attendees?: { id: string, name: string }[] };

  const fmt = (d?: Date) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';


  return (
    <div className="h-full w-full overflow-hidden rounded-md text-white p-1.5 bg-indigo-600">
      < p className="font-bold truncate" > {title}</p >

      <div className="mt-1 flex items-center space-x-1 opacity-90">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>
          {fmt(eventInfo.event.start!)}
          {eventInfo.event.end ? ` - ${fmt(eventInfo.event.end!)}` : ''}
        </span>
      </div>

      {
        roomId && (
          <div className="mt-1 flex items-center space-x-1 opacity-90">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span className="truncate">{roomId}</span>
          </div>
        )
      }

      {
        !!attendees.length && (
          <div className="mt-2 flex items-center -space-x-2">
            {attendees.slice(0, 3).map((att) => (
              <p key={att.id}>{att.name}</p>
            ))}
            {attendees.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center text-white text-[10px]">
                +{attendees.length - 3}
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};
