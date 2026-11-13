// The home hero's 3D layer. Loaded on demand from HeroStage, so three.js stays out of the main bundle.
//
// Two canvases, so the page's text can sit between them:
//   back  : three background rings, then the lens (a procedural camera lens, drawn on top of them)
//   front : six foreground rings (above the text)
// The lens orbits toward the cursor, rotated 25 degrees like the brief's can. The rings drift, rotate,
// are pushed away from the pointer, and slide with parallax. A change of look plays the brief's
// choreography: the lens spins 360 degrees with a blur, swaps its paint at the peak, then settles at
// 720; the rings implode to the centre, swap shape, and explode out to new places.
//
// All numbers below come from the brief. The meshes are procedural stand-ins, not client work.

import {
  ACESFilmicToneMapping,
  BoxGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  LatheGeometry,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const TAU = Math.PI * 2
const rad = MathUtils.degToRad
const lerp = MathUtils.lerp

// gsap power2.in, and gsap back.out(overshoot)
const powerIn2 = (t) => t * t
const linear = (t) => t
const backOut = (s) => (t) => {
  const u = t - 1
  return u * u * ((s + 1) * u + s) + 1
}

const LOOKS = {
  teal: { barrel: 0x12a58f, rings: [0xfbcfe8, 0xf9a8d4, 0xffffff], shape: 'ring' },
  blue: { barrel: 0x2a7fd6, rings: [0xbfe3ff, 0x93c5fd, 0xffffff], shape: 'orb' },
}

// [id, top %, left %, size px, opacity, layer]. Order is the brief's DOM order: the three background
// ones first, since the float durations below are indexed by it.
const ORBS = [
  ['b7', 15, 40, 80, 0.7, 'back'],
  ['b8', 50, 55, 70, 0.6, 'back'],
  ['b9', 80, 35, 75, 0.7, 'back'],
  ['b1', 25, 30, 220, 1, 'front'],
  ['b2', 60, 42, 100, 1, 'front'],
  ['b3', 30, 62, 250, 1, 'front'],
  ['b4', 15, 48, 140, 1, 'front'],
  ['b5', 75, 20, 120, 1, 'front'],
  ['b6', 45, 75, 180, 1, 'front'],
]
const FLOAT_DUR = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10]
const PARALLAX = { front: 60, back: -30 }
const REPEL = { radius: 400, strength: 80, lerp: 0.1 }

function makeRenderer(canvas) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)) // two full-window canvases: keep the pixel count sane
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  return renderer
}

function makeEnvironment(renderer) {
  const generator = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const texture = generator.fromScene(room, 0.04).texture
  generator.dispose()
  return texture
}

function lights(scene) {
  const key = new DirectionalLight(0xffffff, 2.2)
  key.position.set(-300, 500, 700)
  const rim = new DirectionalLight(0xfbcfe8, 1.4)
  rim.position.set(500, -200, -300)
  scene.add(key, rim)
}

/** A camera lens seen along its axis: barrel, ridged focus ring, a pink band, and a dark coated front element. */
function buildLens(look) {
  const group = new Group()
  const livery = new MeshStandardMaterial({ color: LOOKS[look].barrel, metalness: 0.65, roughness: 0.32 })
  const rubber = new MeshStandardMaterial({ color: 0x0c0f0f, metalness: 0.2, roughness: 0.6 })
  const grip = new MeshStandardMaterial({ color: 0x1b2222, metalness: 0.3, roughness: 0.5 })
  const steel = new MeshStandardMaterial({ color: 0xb9c2c4, metalness: 1, roughness: 0.25 })
  const pink = new MeshStandardMaterial({
    color: 0xfbcfe8,
    metalness: 0.3,
    roughness: 0.3,
    emissive: 0xfbcfe8,
    emissiveIntensity: 0.12,
  })
  const glass = new MeshPhysicalMaterial({
    color: 0x03151c,
    metalness: 0,
    roughness: 0.03,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    iridescence: 1,
    iridescenceIOR: 1.35,
    iridescenceThicknessMinimum: 150,
    iridescenceThicknessMaximum: 420,
    envMapIntensity: 1.6,
  })
  const lathe = (points, material) =>
    new Mesh(new LatheGeometry(points.map(([r, y]) => new Vector2(r, y)), 96), material)

  const body = new Group() // built along +Y, turned to point along +Z below
  body.add(lathe([[0, -1.32], [0.68, -1.32], [0.7, -1.28], [0.7, -1.12], [0.84, -1.08], [0.84, -1.0]], steel))
  body.add(lathe([[0.84, -1.0], [0.95, -0.92], [0.95, 0.22], [0.92, 0.26]], livery))
  body.add(lathe([[0.92, 0.26], [1.03, 0.26], [1.03, 0.98], [0.92, 0.98]], rubber))

  const ridgeCount = 64
  const ridges = new InstancedMesh(new BoxGeometry(0.05, 0.62, 0.07), grip, ridgeCount)
  const dummy = new Object3D()
  for (let k = 0; k < ridgeCount; k += 1) {
    const a = (k / ridgeCount) * TAU
    dummy.position.set(Math.cos(a) * 1.045, 0.62, Math.sin(a) * 1.045)
    dummy.rotation.set(0, -a, 0)
    dummy.updateMatrix()
    ridges.setMatrixAt(k, dummy.matrix)
  }
  body.add(ridges)

  const band = new Mesh(new TorusGeometry(0.99, 0.03, 16, 96), pink)
  band.rotation.x = Math.PI / 2
  band.position.y = 1.02
  body.add(band)
  body.add(lathe([[0.98, 1.0], [0.98, 1.26], [0.84, 1.26], [0.84, 1.1]], livery))

  const front = new Mesh(new SphereGeometry(1.4, 64, 24, 0, TAU, 0, 0.64), glass)
  front.position.y = -0.22
  body.add(front)
  for (const [r, y] of [[0.6, 1.05], [0.3, 1.15]]) {
    const ring = new Mesh(new TorusGeometry(r, 0.014, 12, 72), steel)
    ring.rotation.x = Math.PI / 2
    ring.position.y = y
    body.add(ring)
  }
  const dot = new Mesh(new SphereGeometry(0.045, 16, 12), pink)
  dot.position.set(0, 0.1, -0.95)
  body.add(dot)

  body.rotation.x = Math.PI / 2 // the front element now faces +Z, toward the camera
  const rig = new Group()
  rig.add(body)
  rig.rotation.y = rad(30) // a three-quarter view at rest
  group.add(rig)

  return {
    group,
    paint: (next) => livery.color.setHex(LOOKS[next].barrel),
    dispose() {
      group.traverse((o) => {
        o.geometry?.dispose()
      })
      for (const m of [livery, rubber, grip, steel, pink, glass]) m.dispose()
    },
  }
}

/**
 * Builds the hero scene. Throws if WebGL is unavailable; the caller shows the page without it.
 * `layout` is the pixel rectangle the brief's percentages are measured against (the hero content box).
 */
export function createHeroScene({ backCanvas, frontCanvas, look = 'teal', reduced = false }) {
  const backRenderer = makeRenderer(backCanvas)
  let frontRenderer
  try {
    frontRenderer = makeRenderer(frontCanvas)
  } catch (error) {
    backRenderer.dispose()
    throw error
  }

  const backEnv = makeEnvironment(backRenderer)
  const frontEnv = makeEnvironment(frontRenderer)

  const backScene = new Scene()
  backScene.environment = backEnv
  lights(backScene)
  const frontScene = new Scene()
  frontScene.environment = frontEnv
  lights(frontScene)
  const lensScene = new Scene()
  lensScene.environment = backEnv
  lights(lensScene)

  const orthoBack = new OrthographicCamera(0, 1, 0, -1, -2000, 2000)
  orthoBack.position.z = 1000
  const orthoFront = new OrthographicCamera(0, 1, 0, -1, -2000, 2000)
  orthoFront.position.z = 1000
  const lensCamera = new PerspectiveCamera(30, 1, 0.1, 100)
  const LENS_DISTANCE = 11

  const lens = buildLens(look)
  lensScene.add(lens.group)

  // Shared geometry for the rings; materials are per ring.
  const ringGeometry = new TorusGeometry(0.36, 0.14, 28, 56) // outer diameter 1
  const orbGeometry = new SphereGeometry(0.34, 40, 28)
  const bandGeometry = new TorusGeometry(0.46, 0.035, 12, 64)

  /** The meshes and materials of one ring (Teal) or banded orb (Blue). */
  function orbParts(nextLook, color, opacity) {
    const material = new MeshPhysicalMaterial({
      color,
      roughness: nextLook === 'teal' ? 0.22 : 0.1,
      metalness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      iridescence: nextLook === 'teal' ? 0 : 0.6,
      transparent: true,
      opacity,
    })
    if (LOOKS[nextLook].shape === 'ring') return { meshes: [new Mesh(ringGeometry, material)], materials: [material] }
    const band = material.clone()
    return { meshes: [new Mesh(orbGeometry, material), new Mesh(bandGeometry, band)], materials: [material, band] }
  }

  function fillOrb(orb, nextLook) {
    for (const child of [...orb.group.children]) orb.group.remove(child)
    for (const m of orb.materials) m.dispose()
    const config = LOOKS[nextLook]
    const parts = orbParts(nextLook, config.rings[orb.i % config.rings.length], orb.baseOpacity * Math.max(0, Math.min(1, orb.o)))
    orb.materials = parts.materials
    orb.group.add(...parts.meshes)
  }

  const orbs = ORBS.map(([id, top, left, size, opacity, layer], i) => {
    const orb = {
      id,
      top,
      left,
      size,
      baseOpacity: opacity,
      layer,
      i,
      group: new Group(),
      materials: [],
      rx: 0,
      ry: 0,
      angle: Math.random() * 360,
      baseX: 0,
      baseY: 0,
      s: 1,
      o: 1,
      extra: 0,
      ox: null,
      oy: null,
      lx: 0,
      ly: 0,
      sx: -9999,
      sy: -9999,
      floatAmp: 1,
      seed: Math.random() * TAU,
    }
    fillOrb(orb, look)
    ;(layer === 'front' ? frontScene : backScene).add(orb.group)
    return orb
  })

  // Compile the shaders before the first frame (asynchronously where the browser can), so the hero
  // does not appear with a stall. The other look's shapes are compiled afterwards, in the background,
  // so the first change of look does not stall when it swaps them in.
  const warm = []
  for (const id of Object.keys(LOOKS)) {
    if (id === look) continue
    for (const [scene, env] of [[new Scene(), backEnv], [new Scene(), frontEnv]]) {
      scene.environment = env
      lights(scene)
      const parts = orbParts(id, 0xffffff, 1)
      scene.add(...parts.meshes)
      warm.push({ scene, parts, front: env === frontEnv })
    }
  }
  const ready = Promise.all([
    backRenderer.compileAsync(backScene, orthoBack),
    backRenderer.compileAsync(lensScene, lensCamera),
    frontRenderer.compileAsync(frontScene, orthoFront),
  ]).then(
    () => undefined,
    () => undefined, // if compiling in the background is not possible, the first frame compiles instead
  )
  // The other look's shapes are compiled a moment later, once the hero is already on screen.
  ready.then(() => {
    window.setTimeout(() => {
      if (state.disposed) return
      for (const w of warm) (w.front ? frontRenderer : backRenderer).compileAsync(w.scene, w.front ? orthoFront : orthoBack).catch(() => {})
    }, 1500)
  })

  const state = {
    layout: { x0: 0, y0: 0, w: 1, h: 1, unit: 1 },
    lensDistance: LENS_DISTANCE,
    width: 1,
    height: 1,
    spin: 0,
    visible: true,
    disposed: false,
    current: look,
    switching: false,
    pending: null,
  }

  /* ---- tiny tweens: the brief's GSAP timeline, without GSAP ---- */
  const tweens = []
  function tween(duration, ease, update) {
    return new Promise((resolve) => {
      tweens.push({ t: 0, duration, ease, update, resolve })
    })
  }
  function stepTweens(dt) {
    for (let i = tweens.length - 1; i >= 0; i -= 1) {
      const w = tweens[i]
      w.t = Math.min(w.duration, w.t + dt)
      w.update(w.ease(w.t / w.duration))
      if (w.t >= w.duration) {
        tweens.splice(i, 1)
        w.resolve()
      }
    }
  }

  const setBlur = (px) => {
    backCanvas.style.filter = px > 0.05 ? `blur(${px.toFixed(2)}px)` : ''
  }

  const homeOf = (orb) => ({
    x: state.layout.x0 + (orb.left / 100) * state.layout.w + (orb.size * state.layout.unit) / 2,
    y: state.layout.y0 + (orb.top / 100) * state.layout.h + (orb.size * state.layout.unit) / 2,
  })

  async function orbCycle(orb, target) {
    const start = { x: orb.lx, y: orb.ly }
    const centre = { x: state.width / 2, y: state.height / 2 }
    await tween(0.5, powerIn2, (p) => {
      orb.ox = lerp(start.x, centre.x, p)
      orb.oy = lerp(start.y, centre.y, p)
      orb.s = 1 - 0.9 * p
      orb.o = 1 - p
      orb.extra = 45 * p
    })
    if (state.disposed) return
    fillOrb(orb, target) // swap the model while it is hidden
    await tween(0.3, linear, () => {})
    if (state.disposed) return
    const nextX = (Math.random() - 0.5) * 200
    const nextY = (Math.random() - 0.5) * 200
    const home = homeOf(orb)
    await tween(0.9, backOut(1.5), (p) => {
      orb.ox = lerp(centre.x, home.x + nextX, p)
      orb.oy = lerp(centre.y, home.y + nextY, p)
      orb.s = 0.1 + 0.9 * p
      orb.o = Math.min(1, p)
      orb.extra = 45 + 45 * p
    })
    orb.angle += 90
    orb.extra = 0
    orb.baseX = nextX
    orb.baseY = nextY
    orb.ox = null
    orb.oy = null
    orb.s = 1
    orb.o = 1
    orb.rx = 0
    orb.ry = 0
    orb.floatAmp = 0 // the drift eases back in
  }

  function applyLookNow(next) {
    lens.paint(next)
    for (const orb of orbs) {
      orb.o = 1
      fillOrb(orb, next)
    }
    state.current = next
  }

  async function transition(next) {
    if (state.disposed) return
    if (state.switching) {
      state.pending = next
      return
    }
    if (next === state.current) return
    if (reduced) {
      applyLookNow(next)
      return
    }
    state.switching = true
    const orbsDone = Promise.all(orbs.map((orb) => orbCycle(orb, next)))
    await tween(0.6, powerIn2, (p) => {
      state.spin = 360 * p
      setBlur(15 * p)
    })
    if (state.disposed) return
    lens.paint(next) // the swap happens at the peak of the spin, behind the blur
    await tween(1.5, backOut(0.7), (p) => {
      state.spin = 360 + 360 * p
      setBlur(Math.max(0, 15 * (1 - p)))
    })
    state.spin = 0
    setBlur(0)
    await orbsDone
    if (state.disposed) return
    state.current = next
    state.switching = false
    const queued = state.pending
    state.pending = null
    if (queued && queued !== state.current) transition(queued)
  }

  function resize(width, height) {
    state.width = Math.max(1, width)
    state.height = Math.max(1, height)
    for (const renderer of [backRenderer, frontRenderer]) renderer.setSize(state.width, state.height, false)
    for (const cam of [orthoBack, orthoFront]) {
      cam.left = 0
      cam.right = state.width
      cam.top = 0
      cam.bottom = -state.height
      cam.updateProjectionMatrix()
    }
    lensCamera.aspect = state.width / state.height
    lensCamera.updateProjectionMatrix()
    // A tall, narrow window pulls the lens back so it keeps its place beside the text.
    state.lensDistance = LENS_DISTANCE * Math.max(1, 0.72 / lensCamera.aspect)
  }

  /**
   * One frame. `time` and `dt` are seconds; `m` is the pointer: x and y are the smoothed position from
   * -0.5 to 0.5 across the window, cx and cy the pointer in canvas pixels.
   */
  function frame(time, dt, m) {
    if (state.disposed || !state.visible) return
    const step = Math.min(dt * 60, 4) // the brief's per-frame constants, at any refresh rate
    stepTweens(dt)

    // the lens: orbit toward the cursor, then roll the picture 25 degrees
    const theta = rad(m.x * 40 + state.spin)
    const phi = rad(90 + m.y * 20)
    const d = state.lensDistance
    lensCamera.position.set(d * Math.sin(phi) * Math.sin(theta), d * Math.cos(phi), d * Math.sin(phi) * Math.cos(theta))
    lensCamera.up.set(0, 1, 0)
    lensCamera.lookAt(0, 0, 0)
    lensCamera.rotateZ(rad(25))

    // the rings
    for (const orb of orbs) {
      const home = homeOf(orb)
      const par = PARALLAX[orb.layer]
      const offX = m.x * par
      const offY = m.y * par
      let floatAngle = 0
      if (orb.ox === null) {
        if (!state.switching) {
          const dx = m.cx - orb.sx
          const dy = m.cy - orb.sy
          const distance = Math.hypot(dx, dy)
          let tx = 0
          let ty = 0
          let speed = 1
          if (distance < REPEL.radius && distance > 0.0001) {
            const force = (REPEL.radius - distance) / REPEL.radius
            tx = (dx / distance) * force * -REPEL.strength
            ty = (dy / distance) * force * -REPEL.strength
            speed = 1 + force * 5
          }
          const k = 1 - (1 - REPEL.lerp) ** step
          orb.rx += (tx - orb.rx) * k
          orb.ry += (ty - orb.ry) * k
          orb.angle += 0.2 * speed * step
          orb.floatAmp = Math.min(1, orb.floatAmp + dt / 0.4)
        }
        const phase = (time + orb.i * 0.7) * (TAU / FLOAT_DUR[orb.i])
        const floatY = Math.sin(phase) * 15 * orb.floatAmp
        floatAngle = Math.cos(phase) * 6 * orb.floatAmp
        orb.lx = home.x + orb.baseX + orb.rx
        orb.ly = home.y + orb.baseY + orb.ry + floatY
      } else {
        orb.lx = orb.ox
        orb.ly = orb.oy
      }
      orb.sx = orb.lx + offX
      orb.sy = orb.ly + offY

      orb.group.position.set(orb.sx, -orb.sy, 0)
      orb.group.scale.setScalar(orb.size * state.layout.unit * orb.s)
      const spinDeg = orb.angle + floatAngle + orb.extra
      orb.group.rotation.set(0.95 + Math.sin(time * 0.35 + orb.seed) * 0.45, Math.sin(rad(spinDeg) * 0.5) * 0.9, -rad(spinDeg))
      const opacity = orb.baseOpacity * Math.max(0, Math.min(1, orb.o))
      for (const material of orb.materials) material.opacity = opacity
      orb.group.visible = opacity > 0.01
    }

    backRenderer.autoClear = false
    backRenderer.clear()
    backRenderer.render(backScene, orthoBack)
    backRenderer.clearDepth()
    backRenderer.render(lensScene, lensCamera)
    frontRenderer.render(frontScene, orthoFront)
  }

  return {
    /** Resolves once every shader is compiled; draw only after this. */
    ready,
    frame,
    resize,
    /** The pixel box the brief's percentages are measured against. */
    setLayout(box) {
      state.layout = box
    },
    /** Plays the look change (or applies it at once under reduced motion). */
    setLook: transition,
    isSwitching: () => state.switching,
    setVisible(visible) {
      state.visible = visible
    },
    /** Lower the drawing resolution on a slow machine: level 1 is 75%, level 2 is 50% of the window. */
    setQuality(level) {
      const ratio = Math.min(window.devicePixelRatio || 1, level >= 2 ? 0.5 : level === 1 ? 0.75 : 1.5)
      for (const renderer of [backRenderer, frontRenderer]) {
        renderer.setPixelRatio(ratio)
        renderer.setSize(state.width, state.height, false)
      }
    },
    dispose() {
      state.disposed = true
      tweens.length = 0
      setBlur(0)
      lens.dispose()
      for (const orb of orbs) for (const m of orb.materials) m.dispose()
      for (const w of warm) for (const m of w.parts.materials) m.dispose() // kept alive until now so their shaders stay compiled
      ringGeometry.dispose()
      orbGeometry.dispose()
      bandGeometry.dispose()
      backEnv.dispose()
      frontEnv.dispose()
      for (const renderer of [backRenderer, frontRenderer]) {
        renderer.dispose()
        renderer.forceContextLoss()
      }
    },
  }
}
