const people = [
  { name: "Alice Johnson", role: "Software Engineer", status: "In Office" },
  { name: "Bob Williams", role: "Product Manager", status: "Remote" },
  { name: "Carol Davis", role: "UX Designer", status: "Out of Office" },
  { name: "David Lee", role: "Data Scientist", status: "In Office" },
  { name: "Eve Martinez", role: "Marketing Specialist", status: "Remote" },
  { name: "Frank White", role: "Sales Executive", status: "In Office" },
  { name: "Grace Taylor", role: "HR Business Partner", status: "Out of Office" },
  { name: "Henry Kim", role: "Backend Developer", status: "In Office" },
];

const pillClasses = (s: string) =>
  s === "In Office" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
    : s === "Remote" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300"
      : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300";

export default function PresencePage() {
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
          className="w-full max-w-md rounded-xl border border-border/60 bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          {["All", "In Office", "Remote", "Out of Office"].map((t) => (
            <button key={t} className="rounded-xl border border-border/60 bg-card px-3 py-1.5 text-sm hover:bg-muted">
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {people.map((p) => (
          <div key={p.name} className="card p-4">
            <div className="mb-2 text-base font-medium">{p.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300">{p.role}</div>
            <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs ${pillClasses(p.status)}`}>
              {p.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
