// Engraving primitives for Belle Food dish plates.
// Antique menu-engraving vocabulary: contour outlines, parallel hatching,
// stipple shading — gold linework on a wine ground.

export const GOLD = '#C9A24B'
export const SOFT = '#E3C878'
export const PEPPER = '#C1442E'
export const CREAM = '#F4E8D8'
export const INK = '#170B0E'
export const WINE = '#2B1520'

let uid = 0
export const nid = (p = 'u') => `${p}${++uid}`
/** Reset the id counter so each drawing's generated ids are reproducible. */
export const resetIds = () => {
  uid = 0
}

export function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const at = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')

// ── stroke weights ────────────────────────────────────────────────────────
export const OUT = {
  fill: 'none',
  stroke: GOLD,
  'stroke-width': 4.4,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
}
export const DET = {
  fill: 'none',
  stroke: GOLD,
  'stroke-width': 2.8,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  opacity: 0.9,
}
export const FINE = {
  fill: 'none',
  stroke: GOLD,
  'stroke-width': 1.8,
  'stroke-linecap': 'round',
  opacity: 0.62,
}
export const HI = {
  fill: 'none',
  stroke: SOFT,
  'stroke-width': 2.6,
  'stroke-linecap': 'round',
  opacity: 0.95,
}

// ── atoms ─────────────────────────────────────────────────────────────────
export const el = (cx, cy, rx, ry, s = OUT) => `<ellipse ${at({ cx, cy, rx, ry, ...s })}/>`
export const ci = (cx, cy, r, s = OUT) => `<circle ${at({ cx, cy, r, ...s })}/>`
export const pa = (d, s = OUT) => `<path ${at({ d, ...s })}/>`
export const ln = (x1, y1, x2, y2, s = OUT) => `<line ${at({ x1, y1, x2, y2, ...s })}/>`
export const grp = (kids, a = {}) => `<g ${at(a)}>${[].concat(kids).join('')}</g>`

// ── shading ───────────────────────────────────────────────────────────────
/** Parallel-line hatching clipped to a shape. */
export function hatch(shape, { bbox, angle = 40, gap = 11, w = 1.7, opacity = 0.34, stroke = GOLD }) {
  const id = nid('h')
  const { x, y, width, height } = bbox
  const cx = x + width / 2
  const cy = y + height / 2
  const d = Math.hypot(width, height)
  let lines = ''
  for (let o = -d / 2; o <= d / 2; o += gap) {
    lines += `<line x1="${(cx - d / 2).toFixed(1)}" y1="${(cy + o).toFixed(1)}" x2="${(cx + d / 2).toFixed(1)}" y2="${(cy + o).toFixed(1)}"/>`
  }
  // The clip must sit on an OUTER group: a transform on the clipped element
  // rotates its clip region too, which leaks hatching outside the shape.
  return `<clipPath id="${id}" clip-rule="evenodd">${shape}</clipPath><g clip-path="url(#${id})"><g transform="rotate(${angle} ${cx} ${cy})" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" opacity="${opacity}">${lines}</g></g>`
}

/** Stipple dots clipped to a shape — for grains, thick soups, texture. */
export function stipple(shape, { bbox, n = 170, seed = 7, r = 2.6, opacity = 0.6, fill = GOLD }) {
  const id = nid('s')
  const rand = rng(seed)
  const { x, y, width, height } = bbox
  let dots = ''
  for (let i = 0; i < n; i++) {
    const px = x + rand() * width
    const py = y + rand() * height
    const rr = r * (0.55 + rand() * 0.75)
    dots += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rr.toFixed(2)}"/>`
  }
  return `<clipPath id="${id}" clip-rule="evenodd">${shape}</clipPath><g clip-path="url(#${id})" fill="${fill}" opacity="${opacity}">${dots}</g>`
}

/** Contour lines following a dome — for swallow, mounds. */
export function contours(cx, cy, rx, ry, rows = 4, s = FINE) {
  let out = ''
  for (let i = 1; i <= rows; i++) {
    const t = i / (rows + 1)
    const w = rx * Math.sqrt(1 - t * t) * 0.92
    const yy = cy - ry * t * 0.8
    out += pa(`M ${cx - w} ${yy} q ${w} ${ry * 0.16} ${w * 2} 0`, s)
  }
  return out
}

// ── vessels ───────────────────────────────────────────────────────────────
export function plate(cx, cy, rx) {
  const ry = rx * 0.34
  const wellX = rx * 0.72
  const wellY = ry * 0.72
  return (
    el(cx, cy, rx, ry, OUT) +
    el(cx, cy, wellX, wellY, DET) +
    hatch(`<path d="M ${cx - rx} ${cy} a ${rx} ${ry} 0 0 0 ${rx * 2} 0 a ${rx} ${ry} 0 0 0 ${-rx * 2} 0 Z M ${cx - wellX} ${cy} a ${wellX} ${wellY} 0 0 0 ${wellX * 2} 0 a ${wellX} ${wellY} 0 0 0 ${-wellX * 2} 0 Z"/>`, {
      bbox: { x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2 },
      angle: 28,
      gap: 7,
      opacity: 0.28,
    })
  )
}

export function bowl(cx, cy, rx, depth = 1) {
  const ry = rx * 0.3
  const h = rx * 0.72 * depth
  const body = `M ${cx - rx} ${cy} C ${cx - rx} ${cy + h * 0.85} ${cx - rx * 0.55} ${cy + h} ${cx} ${cy + h} C ${cx + rx * 0.55} ${cy + h} ${cx + rx} ${cy + h * 0.85} ${cx + rx} ${cy}`
  return (
    pa(body, OUT) +
    el(cx, cy, rx, ry, OUT) +
    pa(`M ${cx - rx * 0.26} ${cy + h + 2} q ${rx * 0.26} ${rx * 0.1} ${rx * 0.52} 0`, DET) +
    hatch(`<path d="${body} L ${cx + rx} ${cy} a ${rx} ${ry} 0 0 1 ${-rx * 2} 0 Z"/>`, {
      bbox: { x: cx - rx, y: cy, width: rx * 2, height: h },
      angle: 62,
      gap: 8,
      opacity: 0.3,
    })
  )
}

export function glass(cx, cy, w, h) {
  const topW = w
  const botW = w * 0.76
  const top = cy - h / 2
  const bot = cy + h / 2
  const body = `M ${cx - topW / 2} ${top} L ${cx - botW / 2} ${bot} Q ${cx} ${bot + w * 0.12} ${cx + botW / 2} ${bot} L ${cx + topW / 2} ${top}`
  return (
    pa(body, OUT) +
    el(cx, top, topW / 2, topW * 0.17, OUT) +
    hatch(`<path d="${body} Z"/>`, {
      bbox: { x: cx - topW / 2, y: top, width: topW, height: h },
      angle: 78,
      gap: 11,
      opacity: 0.22,
    })
  )
}

export function board(cx, cy, w, h) {
  const x = cx - w / 2
  const y = cy - h / 2
  return (
    pa(`M ${x} ${y} h ${w} a ${h * 0.28} ${h * 0.28} 0 0 1 0 ${h} h ${-w} a ${h * 0.28} ${h * 0.28} 0 0 1 0 ${-h} Z`, OUT) +
    pa(`M ${x + w * 0.06} ${y + h * 0.16} h ${w * 0.88}`, FINE) +
    pa(`M ${x + w * 0.06} ${y + h * 0.84} h ${w * 0.88}`, FINE)
  )
}

// ── contents ──────────────────────────────────────────────────────────────
export function mound(cx, cy, rx, ry, { seed = 3, dots = 190 } = {}) {
  // cy is the FRONT base line. A dome plus a bulging front arc reads as a
  // three-dimensional pile; a bare half-ellipse reads as a saucer.
  const domeD = `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry * 1.62} ${cx + rx} ${cy - ry * 1.62} ${cx + rx} ${cy}`
  const baseD = `M ${cx - rx} ${cy} a ${rx} ${rx * 0.3} 0 0 0 ${rx * 2} 0`
  const closed = `${domeD} a ${rx} ${rx * 0.3} 0 0 1 ${-rx * 2} 0 Z`
  return (
    pa(domeD, OUT) +
    pa(baseD, { ...DET, opacity: 0.7 }) +
    stipple(`<path d="${closed}"/>`, {
      bbox: { x: cx - rx, y: cy - ry * 1.35, width: rx * 2, height: ry * 1.35 + rx * 0.3 },
      n: dots,
      seed,
      r: 2.7,
      opacity: 0.6,
    }) +
    hatch(`<path d="${closed}"/>`, {
      bbox: { x: cx - rx, y: cy - ry * 1.35, width: rx * 2, height: ry * 1.35 + rx * 0.3 },
      angle: 30,
      gap: 13,
      opacity: 0.16,
    })
  )
}

export function dome(cx, cy, rx, ry) {
  return (
    pa(`M ${cx - rx} ${cy} a ${rx} ${ry} 0 0 1 ${rx * 2} 0`, OUT) +
    pa(`M ${cx - rx} ${cy} a ${rx} ${rx * 0.24} 0 0 0 ${rx * 2} 0`, DET) +
    contours(cx, cy, rx, ry, 4)
  )
}

/** Spiral snail shell — a classic engraving subject. */
export function snail(cx, cy, r, turns = 2.6) {
  const pts = []
  const steps = 90
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2
    const rr = r * (i / steps)
    pts.push(`${(cx + Math.cos(t) * rr).toFixed(1)},${(cy + Math.sin(t) * rr * 0.9).toFixed(1)}`)
  }
  return (
    ci(cx, cy, r, OUT) +
    pa('M ' + pts.join(' L '), { ...DET, 'stroke-width': 2.2 }) +
    pa(`M ${cx + r * 0.72} ${cy + r * 0.5} q ${r * 0.5} ${r * 0.3} ${r * 0.85} ${r * 0.05}`, DET)
  )
}

export function fish(cx, cy, len, { barbels = false } = {}) {
  const hx = len / 2
  const hy = len * 0.22
  const body = `M ${cx - hx} ${cy} Q ${cx - hx * 0.4} ${cy - hy} ${cx + hx * 0.55} ${cy - hy * 0.55} Q ${cx + hx * 0.9} ${cy - hy * 0.3} ${cx + hx} ${cy} Q ${cx + hx * 0.9} ${cy + hy * 0.3} ${cx + hx * 0.55} ${cy + hy * 0.55} Q ${cx - hx * 0.4} ${cy + hy} ${cx - hx} ${cy} Z`
  let out = pa(body, OUT)
  // tail
  out += pa(`M ${cx + hx} ${cy} l ${len * 0.16} ${-hy * 0.85} q ${-len * 0.05} ${hy * 0.85} 0 ${hy * 1.7} Z`, DET)
  // dorsal + pectoral
  out += pa(`M ${cx - hx * 0.15} ${cy - hy * 0.82} q ${len * 0.12} ${-hy * 0.5} ${len * 0.24} ${hy * 0.1}`, DET)
  out += pa(`M ${cx - hx * 0.1} ${cy + hy * 0.5} q ${len * 0.1} ${hy * 0.42} ${len * 0.2} ${-hy * 0.06}`, DET)
  // gill + eye
  out += pa(`M ${cx - hx * 0.66} ${cy - hy * 0.5} q ${len * 0.05} ${hy * 0.5} 0 ${hy}`, DET)
  out += ci(cx - hx * 0.8, cy - hy * 0.16, len * 0.022, { ...OUT, 'stroke-width': 3 })
  out += ci(cx - hx * 0.8, cy - hy * 0.16, len * 0.009, { fill: GOLD, stroke: 'none' })
  if (barbels) {
    out += pa(`M ${cx - hx * 0.95} ${cy + hy * 0.1} q ${-len * 0.09} ${hy * 0.3} ${-len * 0.14} ${hy * 0.12}`, FINE)
    out += pa(`M ${cx - hx * 0.95} ${cy + hy * 0.2} q ${-len * 0.07} ${hy * 0.45} ${-len * 0.13} ${hy * 0.4}`, FINE)
  }
  // scale hatching
  out += hatch(`<path d="${body}"/>`, {
    bbox: { x: cx - hx, y: cy - hy, width: len, height: hy * 2 },
    angle: 52,
    gap: 8,
    opacity: 0.26,
  })
  return out
}

export function steam(cx, cy, h, n = 3, spread = 26) {
  let out = ''
  for (let i = 0; i < n; i++) {
    const x = cx + (i - (n - 1) / 2) * spread
    const s = i % 2 ? 1 : -1
    out += pa(
      `M ${x} ${cy} q ${14 * s} ${-h * 0.28} 0 ${-h * 0.5} q ${-14 * s} ${-h * 0.24} ${2 * s} ${-h * 0.44}`,
      { ...FINE, opacity: 0.5, 'stroke-width': 2.4 },
    )
  }
  return out
}

export function leaf(cx, cy, len, rot = 0) {
  return grp(
    pa(`M ${-len / 2} 0 q ${len / 4} ${-len * 0.3} ${len / 2} 0 q ${-len / 4} ${len * 0.3} ${-len / 2} 0 Z`, DET) +
      ln(-len / 2, 0, len / 2, 0, FINE),
    { transform: `translate(${cx} ${cy}) rotate(${rot})` },
  )
}

export function citrus(cx, cy, r) {
  let out = ci(cx, cy, r, OUT) + ci(cx, cy, r * 0.78, FINE)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    out += ln(cx + Math.cos(a) * r * 0.1, cy + Math.sin(a) * r * 0.1, cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74, FINE)
  }
  return out
}

export function chunks(cx, cy, spread, n, seed = 5, size = 26) {
  const rand = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand()
    const d = spread * (0.35 + rand() * 0.62)
    const x = cx + Math.cos(a) * d
    const y = cy + Math.sin(a) * d * 0.45
    const s = size * (0.7 + rand() * 0.6)
    const shape = `<path d="M ${x - s / 2} ${y} q ${s * 0.1} ${-s * 0.6} ${s * 0.55} ${-s * 0.42} q ${s * 0.5} ${-s * 0.05} ${s * 0.45} ${s * 0.42} q ${-s * 0.15} ${s * 0.5} ${-s * 0.5} ${s * 0.4} q ${-s * 0.4} ${s * 0.06} ${-s * 0.5} ${-s * 0.4} Z"/>`
    out += pa(
      `M ${x - s / 2} ${y} q ${s * 0.1} ${-s * 0.6} ${s * 0.55} ${-s * 0.42} q ${s * 0.5} ${-s * 0.05} ${s * 0.45} ${s * 0.42} q ${-s * 0.15} ${s * 0.5} ${-s * 0.5} ${s * 0.4} q ${-s * 0.4} ${s * 0.06} ${-s * 0.5} ${-s * 0.4} Z`,
      DET,
    )
    out += hatch(shape, { bbox: { x: x - s, y: y - s, width: s * 2, height: s * 2 }, angle: 34, gap: 5.5, opacity: 0.3 })
  }
  return out
}

export function skewer(cx, cy, len, cubes = 4, rot = 0) {
  let out = ln(-len / 2, 0, len / 2, 0, { ...DET, 'stroke-width': 1.8 })
  const step = (len * 0.72) / cubes
  for (let i = 0; i < cubes; i++) {
    const x = -len * 0.34 + i * step + step / 2
    const s = step * 0.78
    const shape = `<rect x="${x - s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="${s * 0.22}"/>`
    out += `<rect ${at({ x: x - s / 2, y: -s / 2, width: s, height: s, rx: s * 0.22, ...OUT, 'stroke-width': 1.8 })}/>`
    out += hatch(shape, { bbox: { x: x - s, y: -s, width: s * 2, height: s * 2 }, angle: 45, gap: 5, opacity: 0.34 })
  }
  return grp(out, { transform: `translate(${cx} ${cy}) rotate(${rot})` })
}

export function spheres(cx, cy, r, layout) {
  let out = ''
  for (const [dx, dy, sc = 1] of layout) {
    const rr = r * sc
    out += ci(cx + dx, cy + dy, rr, OUT)
    out += pa(`M ${cx + dx - rr * 0.55} ${cy + dy + rr * 0.3} a ${rr * 0.7} ${rr * 0.7} 0 0 0 ${rr * 1.1} ${-rr * 0.12}`, FINE)
    out += hatch(`<circle cx="${cx + dx}" cy="${cy + dy}" r="${rr}"/>`, {
      bbox: { x: cx + dx - rr, y: cy + dy - rr, width: rr * 2, height: rr * 2 },
      angle: 38,
      gap: 6,
      opacity: 0.26,
    })
  }
  return out
}

export function cylinder(cx, cy, len, r, rot = 0) {
  const shape = `<rect x="${-len / 2}" y="${-r}" width="${len}" height="${r * 2}" rx="${r}"/>`
  return grp(
    `<rect ${at({ x: -len / 2, y: -r, width: len, height: r * 2, rx: r, ...OUT })}/>` +
      el(len / 2 - r * 0.15, 0, r * 0.4, r * 0.92, DET) +
      hatch(shape, { bbox: { x: -len, y: -r * 2, width: len * 2, height: r * 4 }, angle: 60, gap: 6, opacity: 0.28 }),
    { transform: `translate(${cx} ${cy}) rotate(${rot})` },
  )
}

export function drumstick(cx, cy, len, rot = 0) {
  // meaty end + tapering bone + knuckle, so it reads as a leg not a blob
  const meat = `M ${len * 0.06} ${-len * 0.02} q ${len * 0.06} ${-len * 0.3} ${len * 0.24} ${-len * 0.26} q ${len * 0.26} ${len * 0.04} ${len * 0.22} ${len * 0.24} q ${len * 0.03} ${len * 0.25} ${-len * 0.22} ${len * 0.27} q ${-len * 0.21} ${len * 0.02} ${-len * 0.24} ${-len * 0.25} Z`
  return grp(
    pa(meat, OUT) +
    hatch(`<path d="${meat}"/>`, {
      bbox: { x: 0, y: -len * 0.4, width: len * 0.6, height: len * 0.8 },
      angle: 42, gap: 9, opacity: 0.32,
    }) +
    // bone shaft
    pa(`M ${len * 0.07} ${-len * 0.05} L ${-len * 0.34} ${-len * 0.1}`, { ...OUT, 'stroke-width': 3.4 }) +
    pa(`M ${len * 0.07} ${len * 0.05} L ${-len * 0.34} ${len * 0.06}`, { ...OUT, 'stroke-width': 3.4 }) +
    // knuckle
    ci(-len * 0.4, -len * 0.09, len * 0.07, OUT) +
    ci(-len * 0.4, len * 0.06, len * 0.07, OUT) +
    // a couple of char marks
    pa(`M ${len * 0.16} ${-len * 0.14} q ${len * 0.09} ${len * 0.05} ${len * 0.03} ${len * 0.14}`, FINE) +
    pa(`M ${len * 0.3} ${-len * 0.08} q ${len * 0.07} ${len * 0.06} ${len * 0.01} ${len * 0.13}`, FINE),
    { transform: `translate(${cx} ${cy}) rotate(${rot})` },
  )
}

export function pepperRing(cx, cy, r) {
  return ci(cx, cy, r, DET) + ci(cx, cy, r * 0.45, FINE)
}

// ── ground ────────────────────────────────────────────────────────────────
export function ground(w, h, seed = 1) {
  const gid = nid('g')
  const nid2 = nid('n')
  return `
  <defs>
    <radialGradient id="${gid}" cx="50%" cy="44%" r="72%">
      <stop offset="0%" stop-color="#3A1E2B"/>
      <stop offset="58%" stop-color="#26121B"/>
      <stop offset="100%" stop-color="${INK}"/>
    </radialGradient>
    <filter id="${nid2}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.045 0"/>
    </filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#${gid})"/>
  <rect width="${w}" height="${h}" filter="url(#${nid2})"/>`
}

export function svg(w, h, body, seed = 1) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${ground(w, h, seed)}${body}</svg>`
}

/** Same artwork with no ground — a cut-out for floating over a page. */
export function svgCutout(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`
}
