import { useState } from 'react'
import { getHistory, clearHistory } from '../utils/history'

function History() {
  const [history, setHistory] = useState(getHistory)

  const handleClear = () => {
    if (window.confirm('Clear all scan history stored on this device?')) {
      clearHistory()
      setHistory([])
    }
  }

  return (
    <div className="panel">
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <h2 className="panel-title">Recent Scans</h2>
        {history.length > 0 && (
          <button className="btn-ghost" onClick={handleClear}>Clear History</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          No scans yet. Upload a label on the Scan Label page to get started.
        </div>
      ) : (
        <table className="fields-table">
          <thead>
            <tr>
              <th className="th-field">Timestamp</th>
              <th>Filename</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Fields</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id}>
                <td className="field-name" style={{ whiteSpace: 'nowrap' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="field-value" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.filename}
                </td>
                <td className="field-value">{entry.brand}</td>
                <td className="field-value">
                  <span className={`badge badge-${entry.status.toLowerCase()}`}>{entry.status}</span>
                </td>
                <td className="field-value">{entry.fieldsFound}</td>
                <td className="field-value">{entry.elapsed}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default History
