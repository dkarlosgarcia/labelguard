function ResultPanel({ result, loading, error }) {
  if (loading) {
    return (
      <div className="panel result-panel">
        <h2 className="panel-title">2. Verification Result</h2>
        <div className="loading-state">Analyzing label with AI...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel result-panel">
        <h2 className="panel-title">2. Verification Result</h2>
        <div className="error-state">{error}</div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="panel result-panel">
        <h2 className="panel-title">2. Verification Result</h2>
        <div className="empty-state">Upload a label to see results</div>
      </div>
    )
  }

  const { fields, result: compliance, elapsed } = result
  const warning = fields.government_warning

  const statusColors = {
    PASS: '#16a34a',
    WARNING: '#d97706',
    FAIL: '#dc2626'
  }

  const statusEmoji = {
    PASS: '✅',
    WARNING: '⚠️',
    FAIL: '❌'
  }

  const fieldRows = [
    { label: 'Brand Name', value: fields.brand_name },
    { label: 'Class/Type', value: fields.class_type },
    { label: 'Alcohol Content', value: fields.alcohol_content },
    { label: 'Net Contents', value: fields.net_contents },
    { label: 'Country of Origin', value: fields.country_of_origin },
    {
      label: 'Government Warning',
      value: warning.present
        ? (warning.format_valid ? 'Present — valid format' : `Present — format issue: ${warning.format_issues}`)
        : 'Not found'
    }
  ]

  const missing = fieldRows.filter(f => !f.value).length
  const passed = fieldRows.filter(f => f.value).length

  return (
    <div className="panel result-panel">
      <h2 className="panel-title">2. Verification Result</h2>

      <div className="status-banner" style={{ borderColor: statusColors[compliance.status] }}>
        <span className="status-emoji">{statusEmoji[compliance.status]}</span>
        <div>
          <div className="status-label" style={{ color: statusColors[compliance.status] }}>
            {compliance.status}
          </div>
          <div className="status-reason">{compliance.reason}</div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-num">{fieldRows.length}</div>
          <div className="stat-label">Fields Checked</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: '#16a34a' }}>{passed}</div>
          <div className="stat-label">Passed</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: '#dc2626' }}>{missing}</div>
          <div className="stat-label">Missing</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{elapsed}s</div>
          <div className="stat-label">Process Time</div>
        </div>
      </div>

      <h3 className="section-title">Extracted Fields</h3>
      <table className="fields-table">
        <tbody>
          {fieldRows.map((row) => (
            <tr key={row.label}>
              <td className="field-name">{row.label}</td>
              <td className="field-value">{row.value || '—'}</td>
              <td className="field-status">{row.value ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {fields.image_quality === 'poor' && (
        <div className="quality-warning">
          ⚠️ Image quality is poor — consider retaking the photo for more accurate results.
        </div>
      )}
    </div>
  )
}

export default ResultPanel
