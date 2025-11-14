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
  // Default zoom 1.5 => 150%
  const [zoom, setZoom] = useState(1.5); // 1x, 1.25x, 1.5x…
  // Default granularity: 60 minutes
  const [slotDuration, setSlotDuration] = useState<'00:15:00' | '00:30:00' | '01:00:00'>('01:00:00')


  // derive min/max hours from events currently in view
  const { slotMinTime, slotMaxTime } = useMemo(() => {
    const baseMin = 7;      // your “working hours” start
    const baseMax = 20;     // your “working hours” end
    if (!events?.length) return { slotMinTime: `${String(baseMin).padStart(2, '0')}:00:00`, slotMaxTime: `${baseMax}:00:00` };

  const starts = events.map(e => new Date(e.startUtc));
  const ends = events.map(e => new Date(e.endUtc ?? e.startUtc));

    const earliest = Math.min(...starts.map(d => d.getUTCHours()));
    const latest = Math.max(...ends.map(d => d.getUTCHours() + (ends[0].getUTCMinutes() ? 1 : 0)));

    const minHour = Math.min(baseMin, earliest);
    const maxHour = Math.max(baseMax, latest + 1); // +1 to avoid clipping the end

    return {
      slotMinTime: `${String(minHour).padStart(2, '0')}:00:00`,
      slotMaxTime: `${String(Math.min(24, maxHour)).padStart(2, '0')}:00:00`,
    };
  }, [events]);



  const formattedEvents = useMemo(() => (events ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startUtc,
    end: e.endUtc,
    extendedProps: {
      roomId: e.roomId,
      attendees: [{ id: '123', name: 'Feyo' }],
    },
  })), [events]);
  const [computedSlotHeight, setComputedSlotHeight] = useState<number | null>(null);

  // compute estimated slot height: small by default, increase only if multiple attendees
  const slotEstimatedPx = useMemo(() => {
    const base = 28; // keep slots compact by default
    const maxAttendees = (formattedEvents ?? []).reduce((mx, ev) => Math.max(mx, (ev.extendedProps?.attendees?.length ?? 0)), 0);
    const metaExtra = 6;
    const extraPerAttendee = 16;
    // only add attendee-driven height when there's more than one attendee
    const attendeeExtra = Math.max(0, maxAttendees - 1) * extraPerAttendee;
    const desired = base + metaExtra + attendeeExtra;
    const clamped = Math.min(desired, 120); // avoid excessive heights
    return Math.round(clamped * zoom);
  }, [zoom, formattedEvents]);
  useEffect(() => {
    const final = Math.max(slotEstimatedPx, computedSlotHeight ?? 0);
    document.documentElement.style.setProperty('--fc-slot-h', `${final}px`);
  }, [slotEstimatedPx, computedSlotHeight]);


  // parse slotDuration 'HH:MM:SS' -> milliseconds
  const slotDurationMs = useMemo(() => {
    const parts = slotDuration.split(':').map(Number);
    return ((parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0)) * 1000;
  }, [slotDuration]);

  const onEventMount = (info: any) => {
    try {
      const el = info.el.querySelector('.fc-event-main') || info.el;
      if (!el) return;
  // content height we need to fit
      const contentH = el.scrollHeight || el.offsetHeight;
      // compute event duration in milliseconds
      const start = info.event.start as Date | null;
      const end = info.event.end as Date | null;
      const durationMs = Math.max(1, ((end?.getTime() ?? start?.getTime() ?? 0) - (start?.getTime() ?? 0)));
      const slots = Math.max(1, Math.round(durationMs / Math.max(1, slotDurationMs)));
      const neededPerSlot = Math.ceil(contentH / slots);
      setComputedSlotHeight((prev) => Math.max(prev ?? 0, Math.round(neededPerSlot * zoom)));
    } catch (e) {
      // ignore measurement errors
    }
  };

  useEffect(() => {
    if (computedSlotHeight) {
      document.documentElement.style.setProperty('--fc-slot-h', `${computedSlotHeight}px`);
    }
  }, [computedSlotHeight]);

  return (
    <div className="p-6 w-full">
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
        locale="en-GB"
        timeZone="UTC"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        views={{
          timeGridWeek: {
            titleFormat: { day: 'numeric', month: 'short', year: 'numeric' },
          },
        }}
        initialView="timeGridWeek"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        events={formattedEvents}
        eventContent={(eventInfo) => <CustomEventContent eventInfo={eventInfo} />}
        eventClassNames={() => ['oc-event']}
        selectable
        select={(sel) => {
          navigate(`/events/new?start=${encodeURIComponent(sel.startStr)}&end=${encodeURIComponent(sel.endStr)}`);
        }}
        datesSet={(arg) => setRange({ from: arg.startStr, to: arg.endStr })}
        height="auto"

  /* show times as 24-hour with leading zeros e.g. 06:00 */
  slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}

        /* Make the visible window smaller to increase vertical space per slot */
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        scrollTime="08:00:00"

        /* Granularity */
        slotDuration={slotDuration}
        slotLabelInterval={slotDuration}

  eventDidMount={onEventMount}

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

  // format times in UTC to match the calendar's timezone
  const fmt = (d?: Date) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';


  return (
    <div className="h-full w-full overflow-hidden p-1.5 oc-event-inner">
      <p className="font-bold truncate">{title}</p>

      <div className="mt-1 flex items-center space-x-1 meta">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>
          {fmt(eventInfo.event.start!)}
          {eventInfo.event.end ? ` - ${fmt(eventInfo.event.end!)}` : ''}
        </span>
      </div>

      {roomId && (
        <div className="mt-1 flex items-center space-x-1 meta">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span className="truncate">{roomId}</span>
        </div>
      )}

      {!!attendees.length && (
        <div className="mt-2 flex items-center space-x-2 attendees-inline">
          {attendees.map((att) => (
            <div key={att.id} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] text-white">
              {att.name[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
