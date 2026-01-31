import { useState } from 'react'
import { DropZone } from './components/DropZone'
import { Editor } from './components/Editor'
import './index.css'

function App() {
  const [imageSrc, setImageSrc] = useState(null)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100%',
      background: 'radial-gradient(circle at 50% 0%, var(--bg-secondary) 0%, var(--bg-primary) 70%)'
    }}>
      {!imageSrc ? (
        <>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            letterSpacing: '-2px'
          }}>
            Redact.
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '1.25rem',
            marginBottom: '3rem'
          }}>
            Secure, client-side data redaction.
          </p>
          
          <DropZone onImageLoaded={setImageSrc} />
        </>
      ) : (
        <Editor 
          imageSrc={imageSrc} 
          onCancel={() => setImageSrc(null)} 
        />
      )}
    </div>
  )
}

export default App
