import { useState, useCallback } from 'react'

export function DropZone({ onImageLoaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const processFile = (file) => {
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      onImageLoaded(e.target.result)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)
    
    const file = e.dataTransfer.files[0]
    processFile(file)
  }

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    processFile(file)
  }

  return (
    <div 
      className={`glass-panel drop-zone ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: '4rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center',
        border: '2px dashed var(--border-glass)',
        borderColor: isDragging ? 'var(--accent-primary)' : 'var(--border-glass)',
        background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-glass)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        boxShadow: isDragging ? '0 20px 40px -10px rgba(59, 130, 246, 0.3)' : 'var(--shadow-lg)'
      }}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input 
        type="file" 
        id="file-input" 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={handleFileInput}
      />
      
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.5rem',
        border: '1px solid var(--border-glass)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </div>

      <div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Drop your image here
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          or click to browse from your computer
        </p>
      </div>

      {error && (
        <div style={{ 
          color: 'var(--error)', 
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
