// The studio stage for 3D lookbook cells. Loaded on demand (dynamic import from ModelViewport), so
// three.js stays out of the main bundle until a 3D cell scrolls into view.
//
// The stage: a deep onyx backdrop, a low uniform fill, and one sharp spotlight to catch fabric
// texture and mesh contour. OrbitControls are constrained (no pan, no zoom, capped angles) and
// damped, so rotation never snaps. The meshes are procedural stand-ins generated here; they are not
// client work.

import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SpotLight,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { MESHES } from '../data/models'

const ONYX = 0x0a0a0a
const FOV = 32

/** Hanging cloth: pinned at the top, folds that deepen towards the hem. */
function drapeGeometry({ width, height, segX, segY }) {
  const g = new PlaneGeometry(width, height, segX, segY)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const y = p.getY(i)
    const t = (height / 2 - y) / height // 0 at the pinned top, 1 at the hem
    const fold = Math.sin(x * 6 + Math.sin(y * 1.7) * 0.9)
    const z = fold * (0.04 + 0.16 * t) + 0.18 * Math.sin(x * 1.4) * t + 0.25 * Math.sin(Math.PI * t) * Math.cos(x * 0.9)
    p.setXYZ(i, x * (1 - 0.08 * t), y, z)
  }
  g.computeVertexNormals()
  return g
}

/** A pleated panel: a triangle wave across the width, bowed gently along the height. */
function pleatGeometry({ width, height, segX, segY }) {
  const g = new PlaneGeometry(width, height, segX, segY)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i += 1) {
    const x = p.getX(i)
    const y = p.getY(i)
    const wave = Math.abs((((x * 3.4) % 1) + 1) % 1 - 0.5) * 2
    p.setZ(i, wave * 0.16 + Math.cos(y * 1.2) * 0.12)
  }
  g.computeVertexNormals()
  return g
}

function buildGeometry(spec) {
  if (spec.kind === 'torusKnot') return new TorusKnotGeometry(spec.radius, spec.tube, spec.tubular, spec.radial, 2, 3)
  return spec.shape === 'pleat' ? pleatGeometry(spec) : drapeGeometry(spec)
}

const triangles = (g) => (g.index ? g.index.count : g.attributes.position.count) / 3

/**
 * Builds the stage on `canvas` and returns a small control surface.
 * Throws if WebGL is unavailable; the caller shows a fallback.
 */
export function createStudioScene({ canvas, mesh }) {
  const spec = MESHES[mesh]
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(ONYX, 1)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  scene.background = new Color(ONYX)

  // Low, even fill plus one hard key light.
  scene.add(new AmbientLight(0xffffff, 0.16))
  const key = new SpotLight(0xffffff, 70, 0, 0.55, 0.32, 2)
  key.position.set(2.6, 3.4, 3.4)
  key.target.position.set(0, 0, 0)
  scene.add(key, key.target)

  const geometry = buildGeometry(spec)
  geometry.computeBoundingSphere()
  const material = new MeshPhysicalMaterial({
    color: 0xcfcdc6,
    roughness: 0.62,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.4,
    sheenColor: new Color(0xffffff),
    side: DoubleSide,
  })
  const pivot = new Group()
  pivot.add(new Mesh(geometry, material))
  scene.add(pivot)

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50)
  camera.position.set(0.9, 0.35, 5)
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.6
  controls.enablePan = false
  controls.enableZoom = false // the wheel keeps scrolling the page
  controls.minPolarAngle = Math.PI * 0.35
  controls.maxPolarAngle = Math.PI * 0.62
  controls.minAzimuthAngle = -Math.PI * 0.42
  controls.maxAzimuthAngle = Math.PI * 0.42
  canvas.style.touchAction = 'pan-y' // vertical swipes still scroll the page on touch

  const state = { px: 0, py: 0, yaw: 0, pitch: 0, dirty: true, visible: false }
  const radius = geometry.boundingSphere.radius

  function resize() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const vfov = MathUtils.degToRad(FOV)
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect)
    camera.position.setLength((radius * 1.1) / Math.sin(Math.min(vfov, hfov) / 2))
    camera.updateProjectionMatrix()
    state.dirty = true
  }
  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()

  function frame() {
    const moved = controls.update()
    pivot.rotation.y = state.px * 0.14 + state.yaw
    pivot.rotation.x = -state.py * 0.08 + state.pitch
    if (moved || state.dirty) {
      renderer.render(scene, camera)
      state.dirty = false
    }
  }

  return {
    polyCount: Math.round(triangles(geometry)),
    /** Cursor vector, each axis -1..1, already smoothed. A subtle pivot of the mesh. */
    setPointer(x, y) {
      state.px = x
      state.py = y
      state.dirty = true
    },
    /** Keyboard rotation. */
    nudge(dyaw, dpitch) {
      state.yaw = MathUtils.clamp(state.yaw + dyaw, -0.8, 0.8)
      state.pitch = MathUtils.clamp(state.pitch + dpitch, -0.3, 0.3)
      state.dirty = true
    },
    /** Render only while the cell is on screen. */
    setVisible(visible) {
      state.visible = visible
      renderer.setAnimationLoop(visible ? frame : null)
      if (visible) state.dirty = true
    },
    dispose() {
      renderer.setAnimationLoop(null)
      observer.disconnect()
      controls.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
