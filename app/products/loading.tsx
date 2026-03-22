export default function ProductsLoading() {
  return (
    <div className="shell">
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">Products</div>
        </div>
        <div className="content">
          <div
            style={{
              height: '400px',
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  )
}
