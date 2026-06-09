import { useState } from 'react'
import Sidebar     from './components/Sidebar'
import Dashboard   from './pages/Dashboard'
import ScanLabel   from './pages/ScanLabel'
import BatchUpload from './pages/BatchUpload'
import History     from './pages/History'
import Reports     from './pages/Reports'
import Settings    from './pages/Settings'
import './index.css'

const PAGES = {
  dashboard: { title: 'Dashboard',                    subtitle: 'Overview of recent compliance activity.',                                          Component: Dashboard   },
  scan:      { title: 'Label Compliance Verification', subtitle: 'Upload an alcohol label image to extract and verify required TTB information.',     Component: ScanLabel   },
  batch:     { title: 'Batch Upload',                  subtitle: 'Process multiple label images sequentially and review results in a single view.',   Component: BatchUpload },
  history:   { title: 'Scan History',                  subtitle: 'Last 20 label scans stored locally on this device.',                               Component: History     },
  reports:   { title: 'Reports',                       subtitle: 'Compliance reporting and analytics.',                                               Component: Reports     },
  settings:  { title: 'Settings',                      subtitle: 'Configure LabelGuard for your workflow.',                                           Component: Settings    },
}

function App() {
  const [activePage, setActivePage] = useState('scan')
  const { title, subtitle, Component } = PAGES[activePage]

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="main-area">
        <div className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <p className="topbar-subtitle">{subtitle}</p>
        </div>

        <div className="content">
          <Component />
        </div>

        <footer className="footer">
          Powered by <strong>Overwatch Cyber Group</strong>
        </footer>
      </div>
    </div>
  )
}

export default App
