import { useState } from "react";
import { UserDto, useUsers } from "./api";

const pillClasses = (s: string) =>
  s === "In Office" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
    : s === "Remote" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
      : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";


export default function PresencePage() {
  const { data: people } = useUsers();
  const [searchInput, setSearchInput] = useState('');
  const [statusInput, setStatusInput] = useState('All')

  const searchFilter = (person: UserDto) => {
    const term = searchInput.toLowerCase().trim();
    if (!term) return true;

    // adjust field names to your data shape
    const name = person.email?.toLowerCase() ?? '';
    const role = person.role?.toLowerCase() ?? '';

    return name.includes(term) || role.includes(term);
  }

  const statusFilter = (person: UserDto) => {
    if (statusInput == 'All') return true;
    return person.status == statusInput;

  }

  const filteredPeople = people?.filter(person => {
    return searchFilter(person) && statusFilter(person);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Team Presence</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
          View who is in the office, remote, or out of office.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          placeholder="Search by name or role..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border/60 bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          {["All", "In Office", "Remote", "Out of Office"].map((t) => (
            <button
              key={t}
              onClick={e => setStatusInput(t)}
              className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-sm hover:bg-muted"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredPeople?.map((p) => (
          <div key={p.id} className="card p-4">
            <div className="mb-2 text-base font-medium">{p.email}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">User</div>
            <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs ${pillClasses(p.status)}`}>
              {p.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
