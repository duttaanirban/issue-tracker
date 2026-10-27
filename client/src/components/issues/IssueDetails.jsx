import { useEffect, useState } from 'react'
import { fetchIssueById } from '../../services/api'
import HistoryTimeline from './HistoryTimeline'

export default function IssueDetails({ issueId, onClose }) {
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadIssue() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchIssueById(issueId)
        if (active) setIssue(response.data)
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.error || 'Unable to load issue details.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadIssue()

    return () => {
      active = false
    }
  }, [issueId])

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Issue details</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close issue details"
        >
          Close
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading issue details...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && issue && (
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${issue.type === 'BUG' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {issue.type}
              </span>
              <span className="rounded-full border bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {issue.status}
              </span>
              <span className="rounded-full border bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {issue.priority}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">{issue.title}</h3>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{issue.description}</p>

          <dl className="grid gap-3 border-y border-slate-100 py-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Reporter</dt>
              <dd className="mt-1 text-slate-700">{issue.reporter?.name || 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Assignee</dt>
              <dd className="mt-1 text-slate-700">{issue.assignee?.name || 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Created</dt>
              <dd className="mt-1 text-slate-700">{new Date(issue.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Updated</dt>
              <dd className="mt-1 text-slate-700">{new Date(issue.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>

          <HistoryTimeline history={issue.history} />
        </div>
      )}
    </aside>
  )
}
