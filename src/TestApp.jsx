// Simple test to verify React is working
export default function TestApp() {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#FFF7ED', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#1E293B', fontSize: '2rem', marginBottom: '1rem' }}>
        React is Working! ✅
      </h1>
      <p style={{ color: '#475569' }}>
        If you see this, React is rendering correctly.
      </p>
    </div>
  )
}
