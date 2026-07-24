export default function Loading() {
  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ height: 32, width: 240, background: 'var(--surface-2)', borderRadius: 8, marginBottom: 24, animation: 'skeleton 1.2s ease-in-out infinite' }} />
        <div className="grid-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', background: 'white', border: '1px solid var(--border)' }}>
              <div style={{ paddingTop: '62%', background: 'var(--surface-2)', animation: 'skeleton 1.2s ease-in-out infinite' }} />
              <div style={{ padding: 16 }}>
                <div style={{ height: 14, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 8, animation: 'skeleton 1.2s ease-in-out infinite' }} />
                <div style={{ height: 14, width: '70%', background: 'var(--surface-2)', borderRadius: 4, marginBottom: 12, animation: 'skeleton 1.2s ease-in-out infinite' }} />
                <div style={{ height: 20, width: '50%', background: 'var(--surface-2)', borderRadius: 4, animation: 'skeleton 1.2s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes skeleton {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
