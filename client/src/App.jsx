import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, CircleDot, Clock3, LayoutDashboard } from 'lucide-react'
import { fetchIssues } from './services/api'
import IssueList from './components/issues/IssueList'
import IssueDetails from './components/issues/IssueDetails'
import PageSkeleton from './components/PageSkeleton'
import CreateIssueModal from './components/issues/CreateIssueModal'
import './App.css'

const initialFilters = {
  search: '',
  status: '',
  priority: '',
}

const initialPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
}

function App() {
  const [issues, setIssues] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedIssueId, setSelectedIssueId] = useState(null)
  const [showCreateIssue, setShowCreateIssue] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let active = true

    async function loadIssues() {
      setLoading(true)
      setError('')

      try {
        const response = await fetchIssues({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        })

        if (!active) return

        setIssues(response.data.issues)
        setPagination((current) => ({
          ...current,
          total: response.data.total,
          totalPages: response.data.totalPages,
        }))
      } catch (requestError) {
        if (!active) return
        setError(requestError.response?.data?.error || 'Unable to load issues.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadIssues()

    return () => {
      active = false
    }
  }, [filters, pagination.page, pagination.limit, refreshToken])

  function updateFilters(update) {
    setFilters((current) => (
      typeof update === 'function' ? update(current) : update
    ))
    setPagination((current) => ({ ...current, page: 1 }))
  }

  function updateIssueInList(updatedIssue) {
    setIssues((current) => current.map((issue) => (
      issue.id === updatedIssue.id ? { ...issue, ...updatedIssue } : issue
    )))
  }

  function handleIssueCreated(issue) {
    setSelectedIssueId(issue.id)
    setPagination((current) => ({ ...current, page: 1 }))
    setRefreshToken((current) => current + 1)
  }

  const metrics = [
    { label: 'Total issues', value: pagination.total, icon: LayoutDashboard, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Open', value: issues.filter(({ status }) => status === 'OPEN').length, icon: CircleDot, color: 'text-sky-600 bg-sky-50' },
    { label: 'In progress', value: issues.filter(({ status }) => status === 'IN_PROGRESS').length, icon: Clock3, color: 'text-amber-600 bg-amber-50' },
    { label: 'Closed', value: issues.filter(({ status }) => status === 'CLOSED').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {loading ? (
        <PageSkeleton />
      ) : (
        <>
          <header className="border-b border-slate-200/80 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold">ISSUE-TRACKER</p>
              </div>
              <div className="hidden items-center gap-3 sm:flex">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">AN</div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Workspace overview</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Good morning, Anirban</h1>
            <p className="mt-2 text-sm text-slate-500">Stay on top of delivery and keep every issue moving forward.</p>
          </div>
          <button type="button" onClick={() => setShowCreateIssue(true)} className="w-fit rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700">
            + New issue
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${color}`}><Icon size={16} /></span>
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </p>
        )}

          <IssueList
            issues={issues}
            filters={filters}
            setFilters={updateFilters}
            pagination={pagination}
            setPagination={setPagination}
            selectedIssueId={selectedIssueId}
            onSelectIssue={setSelectedIssueId}
          />
          {selectedIssueId && (
            <div className="mt-6">
              <IssueDetails issueId={selectedIssueId} onClose={() => setSelectedIssueId(null)} onUpdated={updateIssueInList} />
            </div>
          )}
          </div>
        </>
      )}
      {showCreateIssue && (
        <CreateIssueModal
          projectId={issues[0]?.projectId}
          reporterId={issues[0]?.reporterId}
          onClose={() => setShowCreateIssue(false)}
          onCreated={handleIssueCreated}
        />
      )}
    </main>
  )
}

export default App
