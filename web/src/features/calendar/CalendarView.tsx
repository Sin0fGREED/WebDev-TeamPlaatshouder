import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { useEvents } from '../events/api';
import { EventContentArg } from '@fullcalendar/core';
import "./Calendar.css"

export default function CalendarView() {
  const calRef = useRef<FullCalendar | null>(null);

  const [range, setRange] = useState({
    from: new Date().toISOString(),
    to: new Date(Date.now() + 7 * 864e5).toISOString(),
  });

  const { data: events } = useEvents(range.from, range.to);
  const navigate = useNavigate();

  const [zoom, setZoom] = useState(1.5);
  const [slotDuration, setSlotDuration] =
    useState<'00:15:00' | '00:30:00' | '01:00:00'>('01:00:00');

  // derive min/max hours from events currently in view
  const { slotMinTime, slotMaxTime } = useMemo(() => {
    const baseMin = 7;
    const baseMax = 20;
    if (!events?.length) {
      return {
        slotMinTime: `${String(baseMin).padStart(2, '0')}:00:00`,
        slotMaxTime: `${String(baseMax).padStart(2, '0')}:00:00`
      };
    }

    const starts = events.map(e => new Date(e.startUtc));
    const ends = events.map(e => new Date(e.endUtc ?? e.startUtc));

    const earliest = Math.min(...starts.map(d => d.getUTCHours()));
    const latest = Math.max(...ends.map(d => d.getUTCHours() + (ends[0].getUTCMinutes() ? 1 : 0)));

    const minHour = Math.min(baseMin, earliest);
    const maxHour = Math.max(baseMax, latest + 1);

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

  /**
   * Fixed slot height:
   * - deterministic (no DOM measurement)
   * - scales only with zoom
   * - clamp to avoid unusable extremes
   */
  const slotHeightPx = useMemo(() => {
    const base = 50;     // baseline compactness
    const scaled = Math.round(base * zoom);
    return Math.max(18, Math.min(scaled, 80));
  }, [zoom]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--fc-slot-h', `${slotHeightPx}px`);

    // Ensure FC recomputes geometry after we change CSS variables
    requestAnimationFrame(() => {
      calRef.current?.getApi().updateSize();
    });
  }, [slotHeightPx, slotDuration, slotMinTime, slotMaxTime]);

  return (
    <div className="p-6 w-full">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team Calendar</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm opacity-70">Granularity</label>

          <select
            className="border rounded px-2 py-1 text-sm bg-white text-gray-900 dark:bg-zinc-900 dark:text-gray-100 border-gray-300 dark:border-white/10"
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
        ref={calRef}
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
        eventClick={(eca) => navigate(`/events/${eca.event.id}`)}
        eventContent={(eventInfo) => <CustomEventContent eventInfo={eventInfo} />}
        eventClassNames={() => ['oc-event']}
        selectable
        select={(sel) => navigate(`/events/new?start=${encodeURIComponent(sel.startStr)}&end=${encodeURIComponent(sel.endStr)}`)}
        datesSet={(arg) => setRange({ from: arg.startStr, to: arg.endStr })}
        height="auto"

        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}

        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        scrollTime="08:00:00"

        slotDuration={slotDuration}
        slotLabelInterval={slotDuration}

        eventOverlap={true}
        dayMaxEventRows={false}
        nowIndicator
      />
    </div>
  );
}

const CustomEventContent = ({ eventInfo }: { eventInfo: EventContentArg }) => {
  const { title } = eventInfo.event;
  const { roomId, attendees = [] } = eventInfo.event.extendedProps as {
    roomId?: string,
    attendees?: { id: string, name: string }[]
  };

  const fmt = (d?: Date) =>
    d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' }) : '';

  return (
    <div className="oc-event-inner">
      <div className="oc-title" title={title}>{title}</div>

      <div className="oc-meta" title={`${fmt(eventInfo.event.start!)}${eventInfo.event.end ? ` - ${fmt(eventInfo.event.end!)}` : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="oc-meta-text">
          {fmt(eventInfo.event.start!)}
          {eventInfo.event.end ? ` - ${fmt(eventInfo.event.end!)}` : ''}
        </span>
      </div>

      {roomId && (
        <div className="oc-meta" title={roomId}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="oc-meta-text">{roomId}</span>
        </div>
      )}

      {!!attendees.length && (
        <div className="attendees-inline">
          {attendees.slice(0, 3).map((att) => (
            <div key={att.id} className="attendee-badge" title={att.name}>
              {att.name[0]}
            </div>
          ))}
          {attendees.length > 3 && (
            <div className="attendee-badge" title={`${attendees.length - 3} more`}>
              +{attendees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
