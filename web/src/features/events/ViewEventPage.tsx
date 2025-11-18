import { useParams } from "react-router-dom";
import { useEvent } from "./api";

export default function ViewEventPage() {
  const { event_id } = useParams();

  const { data: event } = useEvent(event_id!);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">{event?.title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          {event?.startUtc} - {event?.endUtc}
        </p>
        {event?.attendees?.map((a) => (
          <div key={a.id} className="card p-4">
            <div className="mb-2 text-base font-medium">{a.employee.user.email}</div>
            <div className="mb-2 text-base font-medium">{a.employee.role}</div>
            {a.response}
          </div>
        ))}
      </div>
    </div >
  );
}

