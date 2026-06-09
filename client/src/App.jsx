import { useState } from 'react'
import UploadPanel from './components/UploadPanel'
import ResultPanel from './components/ResultPanel'
import './index.css'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <img src="/ocg-shield.png" alt="OCG Shield" className="shield-logo" />
          <div className="header-text">
            <span className="brand-label">Label<span className="brand-guard">Guard</span></span>
            <span className="brand-sub">TTB Alcohol Label Compliance Verification</span>
          </div>
        </div>
      </header>

      <main className="main">
        <h1 className="page-title">Label Compliance Verification</h1>
        <p className="page-sub">Upload an alcohol label image to extract and verify required TTB information.</p>

        <div className="panels">
          <UploadPanel
            setResult={setResult}
            setLoading={setLoading}
            setError={setError}
            loading={loading}
          />
          <ResultPanel result={result} loading={loading} error={error} />
        </div>
      </main>

      <footer className="footer">
        <span>⊕ Powered by <strong>Overwatch Cyber Group</strong></span>
      </footer>
    </div>
  )
}

export default App
