import { useEffect, useState } from 'react'
import { fetchIssues } from './services/api'
import IssueList from './components/issues/IssueList'
import IssueDetails from './components/issues/IssueDetails'
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
  }, [filters, pagination.page, pagination.limit])

  function updateFilters(update) {
    setFilters((current) => (
      typeof update === 'function' ? update(current) : update
    ))
    setPagination((current) => ({ ...current, page: 1 }))
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8">
      <header className="mx-auto mb-4 max-w-7xl px-4">
        <h1 className="text-3xl font-bold text-slate-900">Issue Tracker</h1>
        <p className="mt-1 text-sm text-slate-600">
          Search, filter, and review project issues.
        </p>
      </header>

      {error && (
        <p className="mx-auto mb-4 max-w-7xl rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mx-auto max-w-7xl px-4 text-sm text-slate-600">
          Loading issues...
        </p>
      ) : (
        <>
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
            <div className="mx-auto mt-4 max-w-7xl px-4">
              <IssueDetails
                issueId={selectedIssueId}
                onClose={() => setSelectedIssueId(null)}
              />
            </div>
          )}
        </>
      )}
    </main>
  )
}

export default App
