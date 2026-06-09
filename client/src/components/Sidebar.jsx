import {
  IconLayoutDashboard,
  IconScan,
  IconFiles,
  IconHistory,
  IconFileAnalytics,
  IconSettings,
} from '@tabler/icons-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard',     Icon: IconLayoutDashboard },
  { id: 'scan',      label: 'Scan Label',    Icon: IconScan },
  { id: 'batch',     label: 'Batch Upload',  Icon: IconFiles },
  { id: 'history',   label: 'History',       Icon: IconHistory },
  { id: 'reports',   label: 'Reports',       Icon: IconFileAnalytics },
  { id: 'settings',  label: 'Settings',      Icon: IconSettings },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/labelguard.png" alt="LabelGuard" className="sidebar-logo-img" onError={(e) => { e.target.style.display = 'none' }} />
        <div className="sidebar-brand">
          <span className="sidebar-wordmark">Label<span className="sidebar-blue">Guard</span></span>
          <span className="sidebar-subtitle">TTB Alcohol Label Compliance Verification</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav-item ${activePage === id ? 'nav-item-active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={17} stroke={1.6} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-about">
        <div className="sidebar-about-title">About LabelGuard</div>
        <p className="sidebar-about-text">
          AI-powered TTB label compliance verification built for government agency workflows.
          Powered by Claude Vision.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
