import { useState, useRef } from 'react'
import { analyzeLabel } from '../utils/api'
import { addHistoryEntry } from '../utils/history'

function statusColor(s) {
  return s === 'PASS' ? '#16a34a' : s === 'WARNING' ? '#d97706' : '#dc2626'
}
function statusBg(s) {
  return s === 'PASS' ? '#f0fdf4' : s === 'WARNING' ? '#fffbeb' : '#fef2f2'
}
function statusBorder(s) {
  return s === 'PASS' ? '#bbf7d0' : s === 'WARNING' ? '#fde68a' : '#fecaca'
}

function buildFieldRows(fields) {
  const w = fields.government_warning
  return [
    { key: 'brand_name',        label: 'Brand Name',        value: fields.brand_name,        required: true  },
    { key: 'class_type',        label: 'Class / Type',       value: fields.class_type,        required: true  },
    { key: 'alcohol_content',   label: 'Alcohol Content',    value: fields.alcohol_content,   required: true  },
    { key: 'net_contents',      label: 'Net Contents',       value: fields.net_contents,      required: true  },
    { key: 'country_of_origin', label: 'Country of Origin',  value: fields.country_of_origin, required: false },
    {
      key: 'government_warning',
      label: 'Government Warning',
      value: w.present
        ? (w.format_valid ? 'Present — valid format' : `Present — ${w.format_issues}`)
        : null,
      required: true,
      hasIssue: w.present && !w.format_valid,
    },
  ]
}

function ScanLabel() {
  const [preview,  setPreview]  = useState(null)
  const [filename, setFilename] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [result,   setResult]   = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const processFile = async (file) => {
    setFilename(file.name)
    setLoading(true)
    setError(null)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
    try {
      const data = await analyzeLabel(file)
      setResult(data)
      addHistoryEntry({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filename: file.name,
        brand: data.fields.brand_name || '—',
        status: data.result.status,
        fieldsFound: buildFieldRows(data.fields).filter(r => r.value).length,
        elapsed: data.elapsed,
      })
    } catch {
      setError('Analysis failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const onFileChange = (e) => { const f = e.target.files[0]; if (f) processFile(f) }
  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]; if (f) processFile(f)
  }

  const rows     = result ? buildFieldRows(result.fields) : []
  const found    = rows.filter(r => r.value).length
  const passed   = rows.filter(r => r.value && !r.hasIssue).length
  const warnings = rows.filter(r => r.hasIssue).length
  const missing  = rows.filter(r => !r.value && r.required).length

  const compliance = result?.result

  return (
    <div className="scan-grid">

      {/* ── Panel 1: Upload ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-num">1</span>
          <h2 className="panel-title">Upload Label Image</h2>
        </div>
        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current.click()}
        >
          {preview ? (
            <img src={preview} alt="Label preview" className="preview-img" />
          ) : (
            <>
              <div className="upload-icon">⬆</div>
              <p>Drag and drop your image here</p>
              <p className="upload-hint">or <span className="link">click to browse</span></p>
              <p className="upload-meta">Supports: JPG, PNG, WEBP · Max 10 MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
        {loading && <p className="loading-text">Analyzing with Claude Vision…</p>}
        {filename && !loading && <p className="filename-text">File: {filename}</p>}
        {error    && <p className="error-inline">{error}</p>}
      </div>

      {/* ── Panel 2: Verification Result ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-num">2</span>
          <h2 className="panel-title">Verification Result</h2>
        </div>
        {!result && !loading && <div className="empty-state">Upload a label to see results</div>}
        {loading  && <div className="empty-state">Analyzing…</div>}
        {result   && (
          <>
            <div className="status-banner" style={{
              borderColor: statusBorder(compliance.status),
              background:  statusBg(compliance.status),
            }}>
              <span className="status-dot" style={{ background: statusColor(compliance.status) }} />
              <div>
                <div className="status-label" style={{ color: statusColor(compliance.status) }}>
                  {compliance.status}
                </div>
                <div className="status-reason">{compliance.reason}</div>
              </div>
            </div>

            <div className="stats-row" style={{ marginBottom: 14 }}>
              <div className="stat-box">
                <div className="stat-num">{found}</div>
                <div className="stat-label">Fields Found</div>
              </div>
              <div className="stat-box">
                <div className="stat-num" style={{ color: '#16a34a' }}>{passed}</div>
                <div className="stat-label">Passed</div>
              </div>
              <div className="stat-box">
                <div className="stat-num" style={{ color: '#d97706' }}>{warnings}</div>
                <div className="stat-label">Warnings</div>
              </div>
              <div className="stat-box">
                <div className="stat-num" style={{ color: '#dc2626' }}>{missing}</div>
                <div className="stat-label">Missing</div>
              </div>
            </div>

            <p className="process-time">
              Process time: <strong>{result.elapsed}s</strong>
              {parseFloat(result.elapsed) <= 5 && (
                <span style={{ color: '#16a34a' }}> · Within 5s target ✓</span>
              )}
            </p>

            {result.fields.image_quality === 'poor' && (
              <div className="quality-warning">
                ⚠ Poor image quality — retake the photo for more reliable extraction.
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Panel 3: Extracted Label Information ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-num">3</span>
          <h2 className="panel-title">Extracted Label Information</h2>
        </div>
        {!result ? (
          <div className="empty-state">No data yet</div>
        ) : (
          <table className="fields-table">
            <thead>
              <tr>
                <th className="th-field">Field</th>
                <th>Extracted Value</th>
                <th className="th-check"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="field-name">{row.label}</td>
                  <td className="field-value">
                    {row.value || <span className="not-found">Not found</span>}
                  </td>
                  <td className="field-check">
                    {row.value && !row.hasIssue && <span className="check-pass">✓</span>}
                    {row.hasIssue                && <span className="check-warn">!</span>}
                    {!row.value                  && <span className="check-fail">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Panel 4: Compliance Check ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-num">4</span>
          <h2 className="panel-title">Compliance Check</h2>
        </div>
        {!result ? (
          <div className="empty-state">No data yet</div>
        ) : (
          <div className="compliance-list">
            {rows.map((row) => {
              const ok       = row.value && !row.hasIssue
              const issue    = row.hasIssue
              const absent   = !row.value && row.required
              const optional = !row.value && !row.required

              const dot    = ok ? '#16a34a' : issue ? '#d97706' : absent ? '#dc2626' : '#94a3b8'
              const bg     = ok ? '#f0fdf4' : issue ? '#fffbeb' : absent ? '#fef2f2' : '#f8fafc'
              const fg     = ok ? '#16a34a' : issue ? '#d97706' : absent ? '#dc2626' : '#94a3b8'
              const border = ok ? '#bbf7d0' : issue ? '#fde68a' : absent ? '#fecaca' : '#e2e8f0'
              const label  = ok ? 'Compliant' : issue ? 'Format Issue' : optional ? 'Optional' : 'Missing'

              return (
                <div key={row.key} className="compliance-row">
                  <div className="compliance-left">
                    <span className="compliance-dot" style={{ background: dot }} />
                    <span className="compliance-label">{row.label}</span>
                  </div>
                  <span className="compliance-badge" style={{ background: bg, color: fg, borderColor: border }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

export default ScanLabel
