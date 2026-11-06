// 3D lookbook nodes. These are procedural stand-ins, generated in lib/scene3d.js from the
// specifications below; they are demonstration content, not any photographer's real work. A node is
// flagged `type: '3d'`, and the lookbook renders a WebGL canvas for it in place of a photograph.
//
// `w` and `h` only choose the frame (wide → hero spread, narrow → tall column), the same way a
// photograph's own shape does.

const HOUR = 3_600_000
const BUILD_TIME = Date.now()

/** Mesh specifications. Segment counts fix the polygon count, so it can be shown without loading three.js. */
export const MESHES = {
  drape: { kind: 'plane', shape: 'drape', width: 2.2, height: 3, segX: 120, segY: 160 },
  pleat: { kind: 'plane', shape: 'pleat', width: 2.6, height: 2.4, segX: 160, segY: 80 },
  knot: { kind: 'torusKnot', radius: 0.62, tube: 0.2, tubular: 220, radial: 36 },
}

const MESH_LABELS = { drape: 'Draped cloth', pleat: 'Pleated panel', knot: 'Knot form' }

/** Triangles in a mesh specification: two per quad of the grid. */
export function polyCountOf(mesh) {
  const m = MESHES[mesh]
  return m.kind === 'plane' ? m.segX * m.segY * 2 : m.tubular * m.radial * 2
}

export const meshLabel = (mesh) => MESH_LABELS[mesh]

const ROWS = [
  ['m1', 'studio_karthik', 'Drape Study No. 1', 'Salt Season', 'drape', [4, 5], 'Lisbon', ['Linen', 'Sheen test'], 3],
  ['m2', 'mika.sato', 'Pleat Panel', 'Quiet Rooms', 'pleat', [16, 9], 'Osaka', ['Pleats', 'Studio light'], 9],
  ['m3', 'ona-verne', 'Knot Form', 'Linen Weather', 'knot', [16, 9], 'Marseille', ['Sculpture', 'Contour'], 15],
  ['m4', 'noor_haddad', 'Drape Study No. 2', 'After Hours', 'drape', [4, 5], 'Mumbai', ['Silk', 'Backlight'], 22],
]

export const models = ROWS.map(([id, userHandle, title, series, mesh, [w, h], location, tags, hoursAgo]) => ({
  id,
  type: '3d',
  userHandle,
  title,
  category: '3D Study',
  series,
  mesh,
  w,
  h,
  year: 2024,
  location,
  tags,
  polyCount: polyCountOf(mesh),
  createdAt: BUILD_TIME - hoursAgo * HOUR,
}))

export const modelsFor = (handle) => models.filter((m) => m.userHandle === handle)
