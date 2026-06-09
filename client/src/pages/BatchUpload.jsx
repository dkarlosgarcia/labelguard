import { useState, useRef } from 'react'
import { analyzeLabel } from '../utils/api'
import { addHistoryEntry } from '../utils/history'

function statusClass(s) {
  if (s === 'PASS')    return 'badge-pass'
  if (s === 'WARNING') return 'badge-warning'
  return 'badge-fail'
}

function BatchUpload() {
  const [files,      setFiles]      = useState([])
  const [results,    setResults]    = useState([])
  const [processing, setProcessing] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(null)
  const fileRef = useRef(null)

  const onFileChange = (e) => {
    setFiles(Array.from(e.target.files))
    setResults([])
  }

  const runBatch = async () => {
    if (!files.length) return
    setProcessing(true)
    setResults([])
    const acc = []

    for (let i = 0; i < files.length; i++) {
      setCurrentIdx(i)
      const file = files[i]
      try {
        const data = await analyzeLabel(file)
        const fieldsFound = [
          data.fields.brand_name, data.fields.class_type,
          data.fields.alcohol_content, data.fields.net_contents,
          data.fields.country_of_origin,
          data.fields.government_warning?.present ? 'present' : null,
        ].filter(Boolean).length

        const entry = {
          filename: file.name,
          brand:    data.fields.brand_name || '—',
          status:   data.result.status,
          fieldsFound,
          elapsed:  data.elapsed,
          error:    null,
        }
        acc.push(entry)
        addHistoryEntry({
          id: Date.now() + i,
          timestamp: new Date().toISOString(),
          filename:  file.name,
          brand:     entry.brand,
          status:    entry.status,
          fieldsFound,
          elapsed:   entry.elapsed,
        })
      } catch {
        acc.push({ filename: file.name, brand: '—', status: 'ERROR', fieldsFound: 0, elapsed: null, error: true })
      }
      setResults([...acc])
    }

    setProcessing(false)
    setCurrentIdx(null)
  }

  const passCount  = results.filter(r => r.status === 'PASS').length
  const warnCount  = results.filter(r => r.status === 'WARNING').length
  const failCount  = results.filter(r => r.status === 'FAIL' || r.error).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Select Images</h2>
        </div>
        <p className="panel-desc">
          Select multiple label images. They will be analyzed one at a time and results appear as each scan completes.
        </p>
        <div className="batch-actions">
          <button className="btn-secondary" onClick={() => fileRef.current.click()}>
            Browse Files
          </button>
          {files.length > 0 && (
            <button className="btn-primary" onClick={runBatch} disabled={processing}>
              {processing
                ? `Processing ${currentIdx + 1} of ${files.length}…`
                : `Analyze ${files.length} Label${files.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onFileChange} />

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, i) => {
              const r = results[i]
              return (
                <div key={i} className="file-chip">
                  <span className="file-chip-name">{f.name}</span>
                  {processing && currentIdx === i && <span className="chip-scanning">Scanning…</span>}
                  {r && (
                    <span className={`chip-status chip-${r.status.toLowerCase()}`}>
                      {r.status}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Batch Results</h2>
          </div>
          <table className="fields-table">
            <thead>
              <tr>
                <th className="th-field">Filename</th>
                <th>Brand Name</th>
                <th>Status</th>
                <th>Fields Found</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="field-name" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.filename}
                  </td>
                  <td className="field-value">{r.brand}</td>
                  <td className="field-value">
                    <span className={`badge ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="field-value">{r.fieldsFound}</td>
                  <td className="field-value">{r.elapsed ? `${r.elapsed}s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="batch-summary">
            <span className="summary-item"><span className="dot dot-pass" />{passCount} Passed</span>
            <span className="summary-item"><span className="dot dot-warn" />{warnCount} Warning</span>
            <span className="summary-item"><span className="dot dot-fail" />{failCount} Failed</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchUpload
