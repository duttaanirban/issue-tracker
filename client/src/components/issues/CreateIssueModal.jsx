import { useState } from 'react'
import { X } from 'lucide-react'
import { createIssue } from '../../services/api'

const initialForm = {
  title: '',
  description: '',
  type: 'TASK',
  priority: 'MEDIUM',
  labels: '',
}

export default function CreateIssueModal({ projectId, reporterId, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!projectId || !reporterId) {
      setError('Load a workspace issue before creating a new issue.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await createIssue({
        title: form.title,
        description: form.description,
        type: form.type,
        priority: form.priority,
        labels: form.labels.split(',').map((label) => label.trim()).filter(Boolean),
        projectId,
        reporterId,
      })
      onCreated(response.data)
      setForm(initialForm)
      onClose()
    } catch (requestError) {
      const details = requestError.response?.data?.details
      const detailMessage = details?.map(({ message }) => message).join(', ')
      setError(detailMessage || requestError.response?.data?.error || 'Unable to create issue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="create-issue-title">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Workspace action</p>
            <h2 id="create-issue-title" className="mt-1 text-lg font-bold text-slate-900">Create a new issue</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900" aria-label="Close create issue form">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div>
            <label htmlFor="issue-title" className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
            <input id="issue-title" name="title" value={form.title} onChange={updateField} required maxLength={200} placeholder="What needs to be done?" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
          </div>

          <div>
            <label htmlFor="issue-description" className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea id="issue-description" name="description" value={form.description} onChange={updateField} required rows={4} placeholder="Add context, steps, or acceptance criteria..." className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="issue-type" className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
              <select id="issue-type" name="type" value={form.type} onChange={updateField} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
              </select>
            </div>
            <div>
              <label htmlFor="issue-priority" className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
              <select id="issue-priority" name="priority" value={form.priority} onChange={updateField} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="issue-labels" className="mb-1.5 block text-sm font-medium text-slate-700">Labels <span className="font-normal text-slate-400">(optional, comma-separated)</span></label>
            <input id="issue-labels" name="labels" value={form.labels} onChange={updateField} placeholder="frontend, ui" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'Creating...' : 'Create issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
