import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, CircleUserRound, MessageSquare, Send, X } from 'lucide-react'
import { createComment, fetchIssueById, updateIssue } from '../../services/api'
import HistoryTimeline from './HistoryTimeline'

const workflowTransitions = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW'],
  IN_REVIEW: ['CLOSED'],
  CLOSED: ['OPEN'],
}

export default function IssueDetails({ issueId, onClose, onUpdated }) {
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
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

  async function changeStatus(status) {
    if (!issue) return

    setUpdating(true)
    setError('')

    try {
      const response = await updateIssue(issue.id, {
        status,
        userId: issue.reporterId,
      })
      setIssue(response.data)
      onUpdated(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to update issue status.')
    } finally {
      setUpdating(false)
    }
  }

  async function submitComment(event) {
    event.preventDefault()
    if (!issue || !commentText.trim()) return

    setCommenting(true)
    setError('')

    try {
      const response = await createComment(issue.id, {
        content: commentText.trim(),
        authorId: issue.reporterId,
      })
      setIssue((current) => ({
        ...current,
        comments: [...(current.comments || []), response.data],
      }))
      setCommentText('')
    } catch (requestError) {
      const details = requestError.response?.data?.details
      const detailMessage = details?.map(({ message }) => message).join(', ')
      setError(
        detailMessage
          ? `Unable to add comment: ${detailMessage}`
          : requestError.response?.data?.error || 'Unable to add comment.',
      )
    } finally {
      setCommenting(false)
    }
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Issue workspace</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Issue details</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-900"
          aria-label="Close issue details"
        >
          <X size={17} />
        </button>
      </div>

      {loading && <p className="p-6 text-sm text-slate-500">Loading issue details...</p>}
      {error && <p className="m-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {!loading && !error && issue && (
        <div className="space-y-6 p-6">
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
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">{issue.title}</h3>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{issue.description}</p>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Workflow action</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Move to:</span>
              {(workflowTransitions[issue.status] || []).map((status) => (
                <button
                  type="button"
                  key={status}
                  disabled={updating}
                  onClick={() => changeStatus(status)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? 'Updating...' : status}
                </button>
              ))}
            </div>
          </div>

          <dl className="grid gap-3 border-y border-slate-100 py-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400"><CircleUserRound size={13} /> Reporter</dt>
              <dd className="mt-1 font-medium text-slate-700">{issue.reporter?.name || 'Unknown'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Assignee</dt>
              <dd className="mt-1 text-slate-700">{issue.assignee?.name || 'Unassigned'}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400"><CalendarDays size={13} /> Created</dt>
              <dd className="mt-1 text-slate-700">{new Date(issue.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-400"><ArrowUpRight size={13} /> Updated</dt>
              <dd className="mt-1 text-slate-700">{new Date(issue.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>

          <HistoryTimeline history={issue.history} />

          <section className="border-t border-slate-100 pt-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare size={17} className="text-indigo-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Discussion</h4>
                <p className="text-xs text-slate-500">{issue.comments?.length || 0} comments</p>
              </div>
            </div>

            {issue.comments?.length > 0 && (
              <div className="mb-4 space-y-3">
                {issue.comments.map((comment) => (
                  <article key={comment.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-slate-700">{comment.author?.name || 'User'}</p>
                      <time className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-600">{comment.content}</p>
                  </article>
                ))}
              </div>
            )}

            <form onSubmit={submitComment} className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="issue-comment">Add a comment</label>
              <input
                id="issue-comment"
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Share an update..."
                maxLength={2000}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={15} />
                {commenting ? 'Posting...' : 'Comment'}
              </button>
            </form>
          </section>
        </div>
      )}
    </aside>
  )
}
