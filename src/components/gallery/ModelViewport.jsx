import { useEffect, useRef, useState } from 'react'

/**
 * A borderless WebGL viewport for a 3D lookbook node. The scene code (three.js) loads the first time
 * the cell nears the screen and pauses whenever it leaves. If WebGL is unavailable, a plain text
 * notice takes its place. Drag to rotate; with the canvas focused, the arrow keys rotate it too.
 * `subscribe` is from useGridInteraction: it feeds the smoothed cursor vector for the parallax pivot.
 */
export default function ModelViewport({ model, subscribe }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | unavailable

  useEffect(() => {
    const canvas = canvasRef.current
    let disposed = false
    let started = false
    let visible = false
    let unsubscribe = () => {}

    async function start() {
      try {
        const { createStudioScene } = await import('../../lib/scene3d')
        if (disposed) return
        const scene = createStudioScene({ canvas, mesh: model.mesh })
        sceneRef.current = scene
        canvas.dataset.polys = String(scene.polyCount)
        unsubscribe = subscribe ? subscribe((x, y) => scene.setPointer(x, y)) : unsubscribe
        scene.setVisible(visible)
        setStatus('ready')
      } catch {
        if (!disposed) setStatus('unavailable')
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !started) {
          started = true
          start()
        }
        sceneRef.current?.setVisible(visible)
      },
      { rootMargin: '200px' },
    )
    observer.observe(canvas)

    return () => {
      disposed = true
      observer.disconnect()
      unsubscribe()
      sceneRef.current?.dispose()
      sceneRef.current = null
    }
  }, [model.mesh, subscribe])

  function onKeyDown(event) {
    const step = 0.12
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step / 2], ArrowDown: [0, step / 2] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    sceneRef.current?.nudge(...move)
  }

  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <canvas
        ref={canvasRef}
        className="lookbook-canvas"
        tabIndex={0}
        role="img"
        aria-label={`Interactive 3D model: ${model.title}. Drag or use the arrow keys to rotate.`}
        data-status={status}
        onKeyDown={onKeyDown}
      />
      {status !== 'ready' && (
        <p className="label absolute inset-0 grid place-items-center text-[#b4b3ad]" role="status">
          {status === 'unavailable' ? '3D view is not available in this browser' : 'Preparing 3D view'}
        </p>
      )}
    </div>
  )
}
