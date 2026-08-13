'use client'

import { useRef, useState, useEffect } from 'react'
import { Pencil, Eraser, RotateCcw, Download, Square, Circle } from 'lucide-react'

export function WhiteboardTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#0b5cff')
  const [lineWidth, setLineWidth] = useState(4)
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 1100
    canvas.height = 700

    // Fill background with white
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = tool === 'eraser' ? 24 : lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const downloadCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `zoom-whiteboard-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="whiteboard-container">
      {/* Toolbar */}
      <header className="whiteboard-toolbar">
        <button
          className={`wb-tool-btn ${tool === 'pencil' ? 'active' : ''}`}
          onClick={() => setTool('pencil')}
        >
          <Pencil style={{ width: 16, height: 16 }} />
          <span>Draw</span>
        </button>

        <button
          className={`wb-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
        >
          <Eraser style={{ width: 16, height: 16 }} />
          <span>Eraser</span>
        </button>

        <div className="wb-color-picker">
          {['#0b5cff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#000000'].map((c) => (
            <div
              key={c}
              className={`wb-color-swatch ${color === c && tool === 'pencil' ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => {
                setColor(c)
                setTool('pencil')
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Stroke:</span>
          {[2, 4, 8, 14].map((w) => (
            <button
              key={w}
              className={`wb-tool-btn ${lineWidth === w ? 'active' : ''}`}
              style={{ padding: '4px 8px', fontSize: '12px' }}
              onClick={() => setLineWidth(w)}
            >
              {w}px
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="wb-tool-btn" onClick={clearCanvas}>
            <RotateCcw style={{ width: 16, height: 16 }} />
            <span>Clear</span>
          </button>

          <button className="wb-tool-btn active" onClick={downloadCanvas}>
            <Download style={{ width: 16, height: 16 }} />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Canvas Wrapper */}
      <div className="whiteboard-canvas-wrapper">
        <canvas
          id="whiteboard-canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  )
}
