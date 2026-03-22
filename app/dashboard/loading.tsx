export default function DashboardLoading() {
  return (
    <div className="shell">
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">Dashboard</span>
        </div>
        <div className="content">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--ink-100)',
                borderTop: '3px solid var(--blue)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
