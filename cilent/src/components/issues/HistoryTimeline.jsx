
export default function HistoryTimeline({ history }) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-slate-400">No activity history recorded yet.</p>;
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-sm font-semibold text-slate-700">Audit Trail History</h4>
      <ul className="border-l-2 border-slate-200 ml-2 pl-4 space-y-4 text-xs text-slate-600">
        {history.map((item) => (
          <li key={item.id} className="relative">
            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
            <p className="font-medium text-slate-800">
              {item.changedBy?.name || 'User'} updated <span className="font-semibold text-blue-600">{item.fieldName}</span>
            </p>
            <p className="text-slate-500">
              Changed from <code className="bg-slate-100 px-1 py-0.5 rounded">{item.oldValue}</code> to{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">{item.newValue}</code>
            </p>
            <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}