import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'

export default function IssueList({ issues, filters, setFilters, pagination, setPagination, selectedIssueId, onSelectIssue }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <span className="sr-only">Search issues</span>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />
        </label>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal size={15} /> Filters
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">All issues</h2>
            <p className="mt-0.5 text-xs text-slate-500">{pagination.total} issues in this workspace</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Updated recently</span>
        </div>
        {issues.length === 0 ? (
          <p className="p-12 text-center text-sm text-slate-500">No issues found. Try adjusting your filters.</p>
        ) : (
          issues.map((issue) => (
            <button
              type="button"
              key={issue.id}
              onClick={() => onSelectIssue(issue.id)}
              className={`group flex w-full flex-col justify-between gap-4 border-b border-slate-100 p-5 text-left transition last:border-0 hover:bg-slate-50 sm:flex-row sm:items-center ${selectedIssueId === issue.id ? 'bg-indigo-50/70' : ''}`}
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${issue.type === 'BUG' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {issue.type}
                  </span>
                  <span className="text-xs text-slate-400">#{issue.id.slice(0, 6)}</span>
                </div>
                <h3 className="font-semibold text-slate-900 transition group-hover:text-indigo-700">{issue.title}</h3>
                <p className="mt-1 text-xs text-slate-500">Assigned to {issue.assignee?.name || 'Unassigned'}</p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${issue.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-700' : issue.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
                  {issue.status}
                </span>
                <ChevronRight className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" size={18} />
              </div>
            </button>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}