import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateEvent } from "./api";

export default function ViewEventPage() {
  const navigate = useNavigate();
  const params = useParams;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold">Event</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          This is an event
        </p>
      </div>
    </div>
  );
}

