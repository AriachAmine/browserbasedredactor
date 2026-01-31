import { useRef, useEffect, useState, useCallback } from 'react'

const Icons = {
  Blur: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Solid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="3" x2="21" y2="21" />
      <line x1="21" y1="3" x2="3" y2="21" />
    </svg>
  ),
  Select: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  ),
  Undo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  Reset: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function Editor({ imageSrc, onCancel }) {
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  
  // State
  const [redactions, setRedactions] = useState([]) // { id, x, y, w, h, type, color? }
  const [tool, setTool] = useState('blur') // 'blur' | 'solid' | 'select'
  const [solidColor, setSolidColor] = useState('#000000')
  const [selectedId, setSelectedId] = useState(null)
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [currentRect, setCurrentRect] = useState(null)

  // Load Image
  useEffect(() => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      setImage(img)
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
  }, [imageSrc])

  // Key Listeners (Delete, Undo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) deleteSelected()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, redactions]) // Re-bind when select/redactions change due to closure

  // Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext('2d')
    
    // Clear & Draw Base
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.filter = 'none'
    ctx.drawImage(image, 0, 0)

    // Draw Redactions
    const all = [...redactions]
    if (currentRect) {
      all.push({ ...currentRect, type: tool, color: solidColor, id: 'temp' })
    }

    all.forEach(r => {
      const { x, y, w, h, type, color, id } = r
      
      if (type === 'solid') {
        ctx.fillStyle = color || '#000000'
        ctx.fillRect(x, y, w, h)
      } else if (type === 'blur') {
        ctx.save()
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.clip()
        ctx.filter = 'blur(15px)' 
        ctx.drawImage(image, 0, 0)
        ctx.restore()
      }

      // Highlight Selection
      if (id === selectedId) {
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth = 3
        ctx.strokeRect(x, y, w, h)
        
        // Handles (visual only for now)
        ctx.fillStyle = '#3b82f6'
        const handleSize = 8
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize)
        ctx.fillRect(x + w - handleSize/2, y + h - handleSize/2, handleSize, handleSize)
        ctx.fillRect(x + w - handleSize/2, y - handleSize/2, handleSize, handleSize)
        ctx.fillRect(x - handleSize/2, y + h - handleSize/2, handleSize, handleSize)
      }
    })
    
    // Draw dragging outline
    if (currentRect) {
        ctx.strokeStyle = tool === 'blur' ? '#f43f5e' : solidColor
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.strokeRect(currentRect.x, currentRect.y, currentRect.w, currentRect.h)
        ctx.setLineDash([])
    }

  }, [image, redactions, currentRect, tool, selectedId, solidColor])

  useEffect(() => {
    render()
  }, [render])

  // Mouse Handlers
  const getCoords = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const handleMouseDown = (e) => {
    const pos = getCoords(e)

    if (tool === 'select') {
      // Hit testing
      // Search in reverse for top-most
      for (let i = redactions.length - 1; i >= 0; i--) {
        const r = redactions[i]
        if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
          setSelectedId(r.id)
          return
        }
      }
      setSelectedId(null) // Click on empty space deselects
    } else {
      // Drawing mode
      setSelectedId(null)
      setIsDrawing(true)
      setStartPos(pos)
      setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    const pos = getCoords(e)
    const w = pos.x - startPos.x
    const h = pos.y - startPos.y
    setCurrentRect({
      x: w > 0 ? startPos.x : pos.x,
      y: h > 0 ? startPos.y : pos.y,
      w: Math.abs(w),
      h: Math.abs(h)
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    if (currentRect && currentRect.w > 2 && currentRect.h > 2) {
      const newRedaction = { 
        ...currentRect, 
        type: tool, 
        color: tool === 'solid' ? solidColor : null,
        id: Date.now().toString() 
      }
      setRedactions(prev => [...prev, newRedaction])
      
      // Auto-switch to select if desired? No, keep drawing for speed.
      // But maybe select the new one?
      // setSelectedId(newRedaction.id)
    }
    setCurrentRect(null)
  }

  // Actions
  const deleteSelected = () => {
    if (selectedId) {
      setRedactions(prev => prev.filter(r => r.id !== selectedId))
      setSelectedId(null)
    }
  }

  const undo = () => {
    setRedactions(prev => {
      const newArr = prev.slice(0, -1)
      setSelectedId(null)
      return newArr
    })
  }
  
  const reset = () => {
     if(window.confirm('Clear all redactions?')) {
        setRedactions([])
        setSelectedId(null)
     }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    // Render final clean pass without selection indicators
    const ctx = canvas.getContext('2d')
    const originalId = selectedId
    setSelectedId(null)
    
    // We need to wait for state/render delay? No, synchronous drawing works on same ref
    // But Render depends on state. We must manually toggle off selection draw in render loop or force a redraw
    // Simplest: Render loop already handles selectedId === null check
    // HOWEVER, `render` is a callback.
    // Hack: Quick redraw without selection
    // Or just export immediately after setting null? State update is async.
    
    // Better: Do a one-off draw to a temp canvas or just draw over current canvas cleanly
    // Since we want to maintain the "Editor" state, let's just use the current canvas but stripped of UI overlay
    // Actually, `render()` is called on every change. 
    
    requestAnimationFrame(() => {
        // Force a clean render logic inline here for export
        // ... (Similar to render but skipping selection border) -> 
        // Actually, easiest way is to re-run the render logic locally
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0)
        redactions.forEach(r => {
             // ... draw redactions
             if (r.type === 'solid') {
                ctx.fillStyle = r.color || '#000000'
                ctx.fillRect(r.x, r.y, r.w, r.h)
             } else if (r.type === 'blur') {
                ctx.save()
                ctx.beginPath()
                ctx.rect(r.x, r.y, r.w, r.h)
                ctx.clip()
                ctx.filter = 'blur(15px)' 
                ctx.drawImage(image, 0, 0)
                ctx.restore()
             }
        })
        
        const link = document.createElement('a')
        link.download = 'redacted-image.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
        
        // Restore selection state visual
        // (Actually `selectedId` constraint in react state didn't change, so next render will restore it. 
        // But we manually dirtied canvas. Next react render fix it? 
        // Just call render() explicitly if needed, but the loop dependency array handles it if we changed state.)
        // We didn't change state here. So we should probably call render() again.
        render() 
    })
  }

  return (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        padding: '2rem',
        overflow: 'hidden'
    }}>
      {/* Enhanced Toolbar */}
      <div className="glass-panel" style={{
        padding: '0.75rem 1.5rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Tools */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '10px' }}>
          <ToolButton 
             isActive={tool === 'select'} 
             onClick={() => setTool('select')}
             label="Select"
             icon={<Icons.Select />}
          />
          <ToolButton 
             isActive={tool === 'blur'} 
             onClick={() => setTool('blur')}
             activeColor="var(--tool-blur)"
             label="Blur"
             icon={<Icons.Blur />}
          />
          <ToolButton 
             isActive={tool === 'solid'} 
             onClick={() => setTool('solid')}
             activeColor={solidColor}
             label="Solid"
             icon={<Icons.Solid />}
          />
        </div>

        <div className="divider" style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

        {/* Options */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>COLOR</span>
                <div style={{ 
                    position: 'relative', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '2px solid var(--border-glass)',
                    cursor: 'pointer'
                }}>
                    <input 
                        type="color" 
                        value={solidColor} 
                        onChange={(e) => {
                            setSolidColor(e.target.value)
                            // Update selected if it's a solid block
                            if (selectedId) {
                                setRedactions(prev => prev.map(r => 
                                    (r.id === selectedId && r.type === 'solid') ? { ...r, color: e.target.value } : r
                                ))
                            }
                        }}
                        style={{
                            position: 'absolute',
                            top: '-50%', left: '-50%',
                            width: '200%', height: '200%',
                            cursor: 'pointer',
                            border: 'none',
                            padding: 0,
                            margin: 0
                        }}
                    />
                </div>
            </div>
        </div>

        <div className="divider" style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <IconButton onClick={deleteSelected} disabled={!selectedId} icon={<Icons.Trash />} color="var(--error)" title="Delete Selection (Del)" />
           <IconButton onClick={undo} disabled={!redactions.length} icon={<Icons.Undo />} title="Undo (Ctrl+Z)" />
           <IconButton onClick={reset} disabled={!redactions.length} icon={<Icons.Reset />} title="Reset All" />
        </div>

        <div className="divider" style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>

        <button 
          onClick={handleDownload}
          style={{
            padding: '0.6rem 1.2rem',
            background: 'var(--accent-primary)',
            borderRadius: '8px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            color: 'white'
          }}
        >
          <Icons.Download /> <span>Export</span>
        </button>

         <button 
          onClick={onCancel}
          style={{
            padding: '0.6rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Close Editor"
        >
          <Icons.Close />
        </button>
      </div>

      {/* Canvas Container */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'auto',
        position: 'relative',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        padding: '2rem'
      }}>
        {dimensions.width > 0 && (
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    boxShadow: '0 20px 50px -12px rgba(0,0,0,0.5)',
                    borderRadius: '4px',
                    cursor: tool === 'select' ? 'default' : 'crosshair',
                }}
            />
        )}
      </div>
      
      <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', gap: '2rem' }}>
        <span>Use <b>Select Tool</b> to modify items</span>
        <span><b>Del</b> to remove selected</span>
        <span><b>Ctrl+Z</b> to undo</span>
      </div>
    </div>
  )
}

function ToolButton({ isActive, onClick, icon, label, activeColor }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '0.5rem 0.8rem',
                borderRadius: '6px',
                background: isActive ? (activeColor || 'var(--bg-tertiary)') : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
            }}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

function IconButton({ onClick, disabled, icon, color, title }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                padding: '0.6rem',
                borderRadius: '8px',
                color: disabled ? 'var(--text-secondary)' : (color || 'var(--text-primary)'),
                opacity: disabled ? 0.3 : 1,
                background: 'transparent',
                border: '1px solid transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onMouseOver={(e) => !disabled && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            onMouseOut={(e) => !disabled && (e.currentTarget.style.background = 'transparent')}
        >
            {icon}
        </button>
    )
}
