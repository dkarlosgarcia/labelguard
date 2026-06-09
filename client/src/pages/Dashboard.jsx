import { getHistory } from '../utils/history'

function Dashboard() {
  const history = getHistory()
  const total   = history.length
  const passed  = history.filter(h => h.status === 'PASS').length
  const warned  = history.filter(h => h.status === 'WARNING').length
  const failed  = history.filter(h => h.status === 'FAIL').length
  const avgTime = total > 0
    ? (history.reduce((s, h) => s + parseFloat(h.elapsed || 0), 0) / total).toFixed(2)
    : null

  return (
    <div>
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <div className="stat-box">
          <div className="stat-num">{total}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: '#16a34a' }}>{passed}</div>
          <div className="stat-label">Passed</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: '#d97706' }}>{warned}</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: '#dc2626' }}>{failed}</div>
          <div className="stat-label">Failed</div>
        </div>
      </div>

      {avgTime && (
        <div className="panel" style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13.5, color: '#64748b' }}>
            Average process time: <strong style={{ color: '#0f172a' }}>{avgTime}s</strong> across {total} scan{total !== 1 ? 's' : ''}.
            {parseFloat(avgTime) <= 5 && <span style={{ color: '#16a34a' }}> Within the 5-second TTB agent target.</span>}
          </p>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Getting Started</h2>
        </div>
        <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6 }}>
          Use <strong>Scan Label</strong> to verify a single label image against TTB compliance requirements.
          Use <strong>Batch Upload</strong> to process multiple images sequentially.
          All scans are automatically saved to your local <strong>History</strong> (last 20 entries).
        </p>
      </div>
    </div>
  )
}

export default Dashboard
