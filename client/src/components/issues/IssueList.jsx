export default function IssueList({ issues, filters, setFilters, pagination, setPagination }) {
  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      {/* Responsive Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <input
          type="text"
          placeholder="Search issues by title or description..."
          value={filters.search}
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 md:flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border rounded-md text-sm bg-white"
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
            className="px-3 py-2 border rounded-md text-sm bg-white"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Issues Table / Cards for Mobile */}
      <div className="divide-y divide-slate-200 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {issues.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">No issues found.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${issue.type === 'BUG' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {issue.type}
                  </span>
                  <h3 className="font-medium text-slate-900">{issue.title}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Assigned to: {issue.assignee?.name || 'Unassigned'}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-100 text-slate-700 border">
                  {issue.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}