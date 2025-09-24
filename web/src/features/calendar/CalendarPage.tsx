import CalendarView from "./CalendarView";

export default function CalendarPage() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="card p-6">
        <div className="mb-4 text-lg font-semibold">Calendar</div>
        <CalendarView />
      </div>
    </div>
  );
}
