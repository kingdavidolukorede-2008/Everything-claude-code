// Composes one bespoke engraved plate per dish, plus interior scenes.
// Run: node scripts/generate-plates.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import {
  GOLD, SOFT, PEPPER, OUT, DET, FINE, HI,
  el, ci, pa, ln, grp, hatch, stipple,
  plate, bowl, glass, board, mound, dome, snail, fish, steam, leaf,
  citrus, chunks, skewer, spheres, cylinder, drumstick, pepperRing, svg,
} from './engrave-lib.mjs'

const OUTDIR = new URL('../public/images/', import.meta.url).pathname
mkdirSync(OUTDIR, { recursive: true })

const D = 1000            // dish canvas (square — crop-safe to 4:3)
const CX = 500
const PY = 560            // plate line
const R = 358             // plate radius

// ── dish plates ───────────────────────────────────────────────────────────
const dishes = {
  'sc-snail': () =>
    plate(CX, PY, R) +
    snail(CX - 108, PY - 46, 74) +
    snail(CX + 96, PY - 30, 66) +
    snail(CX - 6, PY - 112, 58) +
    pepperRing(CX - 168, PY + 22, 17) +
    pepperRing(CX + 172, PY + 30, 14) +
    pepperRing(CX + 40, PY + 40, 12) +
    leaf(CX + 152, PY - 84, 86, -24) +
    leaf(CX - 186, PY - 62, 72, 32),

  'sc-puffpuff': () =>
    bowl(CX, PY - 40, 210, 0.9) +
    spheres(CX, PY - 108, 62, [
      [-104, 22, 1], [4, 30, 1.05], [108, 20, 0.95],
      [-52, -62, 0.92], [58, -58, 0.98], [2, -140, 0.85],
    ]),

  'sc-springrolls': () =>
    board(CX, PY - 10, 520, 210) +
    cylinder(CX - 132, PY - 62, 230, 34, -12) +
    cylinder(CX - 96, PY + 4, 230, 34, -6) +
    cylinder(CX + 44, PY - 54, 220, 32, 9) +
    cylinder(CX + 80, PY + 16, 220, 32, 15) +
    bowl(CX + 214, PY - 96, 74, 0.75) +
    leaf(CX - 232, PY + 74, 66, 18),

  'sc-suya': () =>
    board(CX, PY + 6, 540, 200) +
    skewer(CX - 12, PY - 84, 400, 4, -7) +
    skewer(CX + 6, PY - 6, 400, 4, 2) +
    skewer(CX - 4, PY + 72, 400, 4, 8) +
    pa(`M ${CX - 226} ${PY + 8} q 40 -22 82 -6`, FINE) +
    pa(`M ${CX - 232} ${PY + 30} q 46 -26 94 -8`, FINE) +
    pepperRing(CX + 232, PY - 96, 15),

  'ss-eforiro': () => {
    const cy = PY - 70
    return (
      bowl(CX, cy, 258, 1.05) +
      stipple(`<ellipse cx="${CX}" cy="${cy}" rx="248" ry="74"/>`, {
        bbox: { x: CX - 248, y: cy - 74, width: 496, height: 148 }, n: 120, seed: 11, r: 2.1, opacity: 0.4,
      }) +
      leaf(CX - 108, cy - 16, 108, -14) + leaf(CX + 6, cy + 14, 118, 8) +
      leaf(CX + 116, cy - 22, 100, -26) + leaf(CX - 34, cy - 40, 92, 22) +
      chunks(CX, cy + 4, 150, 4, 21, 40) +
      steam(CX, cy - 96, 190, 3, 74)
    )
  },

  'ss-egusi': () => {
    const cy = PY - 70
    return (
      bowl(CX, cy, 258, 1.05) +
      stipple(`<ellipse cx="${CX}" cy="${cy}" rx="248" ry="74"/>`, {
        bbox: { x: CX - 248, y: cy - 74, width: 496, height: 148 }, n: 380, seed: 5, r: 2.6, opacity: 0.55,
      }) +
      chunks(CX, cy, 148, 5, 9, 44) +
      steam(CX, cy - 96, 190, 3, 74)
    )
  },

  'ss-peppersoup': () => {
    const cy = PY - 60
    return (
      bowl(CX, cy, 268, 0.86) +
      el(CX, cy, 258, 76, { ...FINE, opacity: 0.4 }) +
      grp(fish(0, 0, 300, { barbels: true }), { transform: `translate(${CX - 20} ${cy - 8}) rotate(-9)` }) +
      leaf(CX + 150, cy + 22, 88, -20) + leaf(CX - 158, cy + 30, 80, 16) +
      pepperRing(CX - 60, cy + 46, 16) + pepperRing(CX + 76, cy + 50, 13) +
      steam(CX, cy - 100, 200, 3, 78)
    )
  },

  'ss-swallow': () =>
    plate(CX, PY, R) +
    dome(CX - 8, PY - 34, 176, 178) +
    leaf(CX + 196, PY + 6, 78, -30),

  'rg-jollof': () =>
    plate(CX, PY, R) +
    mound(CX - 14, PY - 34, 196, 132, { seed: 4, dots: 340 }) +
    el(CX + 158, PY - 44, 54, 26, DET) + el(CX + 158, PY - 44, 32, 14, FINE) +
    el(CX + 190, PY + 4, 50, 24, DET) + el(CX + 190, PY + 4, 30, 13, FINE) +
    drumstick(CX - 186, PY - 26, 250, -16) +
    leaf(CX + 66, PY - 168, 74, -34),

  'rg-friedrice': () =>
    plate(CX, PY, R) +
    mound(CX, PY - 30, 188, 120, { seed: 12, dots: 330 }) +
    pepperRing(CX - 96, PY - 76, 15) + pepperRing(CX + 62, PY - 104, 13) +
    pepperRing(CX + 116, PY - 46, 14) + pepperRing(CX - 30, PY - 132, 12) +
    leaf(CX - 168, PY - 66, 66, 26) + leaf(CX + 172, PY - 58, 62, -22),

  'rg-ofada': () => {
    const wrap = `M ${CX - 190} ${PY - 30} q 40 -150 190 -150 q 150 0 190 150 q -190 60 -380 0 Z`
    return (
      plate(CX, PY, R) +
      pa(wrap, OUT) +
      hatch(`<path d="${wrap}"/>`, { bbox: { x: CX - 190, y: PY - 180, width: 380, height: 210 }, angle: 24, gap: 9, opacity: 0.24 }) +
      stipple(`<path d="${wrap}"/>`, { bbox: { x: CX - 190, y: PY - 180, width: 380, height: 210 }, n: 210, seed: 17, r: 2.2, opacity: 0.45 }) +
      pa(`M ${CX - 150} ${PY - 132} q 150 -46 300 0`, FINE) +
      bowl(CX + 214, PY - 40, 86, 0.8) +
      pepperRing(CX + 214, PY - 56, 18)
    )
  },

  'rg-coconut': () =>
    plate(CX, PY, R) +
    mound(CX - 34, PY - 32, 180, 124, { seed: 23, dots: 320 }) +
    ci(CX + 178, PY - 68, 76, OUT) + ci(CX + 178, PY - 68, 58, DET) +
    hatch(`<circle cx="${CX + 178}" cy="${PY - 68}" r="58"/>`, {
      bbox: { x: CX + 100, y: PY - 146, width: 156, height: 156 }, angle: 50, gap: 7, opacity: 0.26,
    }) +
    leaf(CX - 176, PY - 92, 76, 28),

  'gm-catfish': () =>
    el(CX, PY, 330, 116, OUT) + el(CX, PY, 292, 94, DET) +
    grp(fish(0, 0, 566, { barbels: true }), { transform: `translate(${CX} ${PY - 40}) rotate(-6)` }) +
    citrus(CX - 216, PY + 26, 44) +
    leaf(CX + 200, PY + 30, 96, -22) + leaf(CX + 152, PY + 52, 80, 12) +
    pepperRing(CX + 26, PY + 66, 15) + pepperRing(CX - 96, PY + 70, 12),

  'gm-chicken': () =>
    plate(CX, PY, R) +
    drumstick(CX - 140, PY - 44, 250, -16) +
    drumstick(CX + 128, PY - 58, 240, 14) +
    drumstick(CX - 6, PY - 136, 232, -4) +
    pepperRing(CX - 190, PY + 34, 17) + pepperRing(CX + 186, PY + 40, 15) +
    pepperRing(CX + 44, PY + 46, 13),

  'gm-turkey': () => {
    let fries = ''
    // shorter, chunkier chips tumbled rather than fanned
    const chips = [
      [96, 6, -62], [136, -14, -44], [178, 4, -70], [212, -20, -52],
      [124, -58, -34], [174, -52, -24], [88, -46, -80],
    ]
    chips.forEach(([dx, dy, a]) => {
      fries += grp(
        `<rect x="-16" y="-62" width="32" height="124" rx="10" fill="none" stroke="${GOLD}" stroke-width="2.6" opacity="0.92"/>` +
          `<line x1="0" y1="-46" x2="0" y2="46" stroke="${GOLD}" stroke-width="1.4" opacity="0.36"/>`,
        { transform: `translate(${CX + dx} ${PY + dy}) rotate(${a})` },
      )
    })
    return plate(CX, PY, R) + fries + drumstick(CX - 168, PY - 40, 300, -14)
  },

  'gm-platter': () =>
    el(CX, PY, 322, 112, OUT) + el(CX, PY, 288, 92, DET) +
    chunks(CX - 70, PY - 34, 132, 6, 31, 52) +
    skewer(CX + 168, PY - 44, 250, 3, -28) +
    pepperRing(CX - 224, PY + 44, 16) + pepperRing(CX + 42, PY + 62, 13) +
    leaf(CX + 234, PY + 44, 84, -18),

  'dr-chapman': () => {
    const gy = 500, gh = 470, gw = 236
    const top = gy - gh / 2
    return (
      glass(CX, gy, gw, gh) +
      el(CX, top + 92, gw / 2 - 9, gw * 0.15, { ...HI, opacity: 0.75 }) +
      stipple(`<path d="M ${CX - gw / 2 + 6} ${top + 92} L ${CX - gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw / 2 - 6} ${top + 92} Z"/>`, {
        bbox: { x: CX - gw / 2, y: top + 92, width: gw, height: gh - 100 }, n: 90, seed: 41, r: 2.2, opacity: 0.3,
      }) +
      grp(`<rect x="-30" y="-30" width="60" height="60" rx="6" fill="none" stroke="${SOFT}" stroke-width="1.7" opacity="0.8"/>`, { transform: `translate(${CX - 48} ${gy - 40}) rotate(-16)` }) +
      grp(`<rect x="-28" y="-28" width="56" height="56" rx="6" fill="none" stroke="${SOFT}" stroke-width="1.7" opacity="0.8"/>`, { transform: `translate(${CX + 44} ${gy + 26}) rotate(12)` }) +
      citrus(CX + gw / 2 - 16, top + 8, 58) +
      ln(CX + 34, top - 46, CX - 22, gy + 96, { ...DET, 'stroke-width': 5, opacity: 0.6 }) +
      leaf(CX - 96, top + 52, 84, -46)
    )
  },

  'dr-zobo': () => {
    const gy = 500, gh = 470, gw = 236
    const top = gy - gh / 2
    let petals = ''
    for (let i = 0; i < 5; i++) {
      petals += grp(pa('M 0 0 q 26 -30 52 0 q -26 34 -52 0 Z', DET), {
        transform: `translate(${CX + gw / 2 - 22} ${top + 10}) rotate(${i * 72}) translate(0 -8)`,
      })
    }
    return (
      glass(CX, gy, gw, gh) +
      el(CX, top + 86, gw / 2 - 9, gw * 0.15, { ...HI, opacity: 0.75 }) +
      hatch(`<path d="M ${CX - gw / 2 + 6} ${top + 86} L ${CX - gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw / 2 - 6} ${top + 86} Z"/>`, {
        bbox: { x: CX - gw / 2, y: top + 86, width: gw, height: gh - 96 }, angle: 66, gap: 7, opacity: 0.3,
      }) +
      petals + ci(CX + gw / 2 - 22, top + 10, 12, DET) +
      pa(`M ${CX - 112} ${top + 118} q -36 26 -18 62 q 22 30 54 10`, DET)
    )
  },

  'dr-malt': () => {
    const gy = 510, gh = 460, gw = 228
    const top = gy - gh / 2
    let bubbles = ''
    const seedPts = [[-56, 40], [40, 92], [-24, 150], [58, 186], [-64, 214], [16, 252]]
    for (const [dx, dy] of seedPts) bubbles += ci(CX + dx, top + dy, 4.5, { ...FINE, opacity: 0.45 })
    return (
      glass(CX, gy, gw, gh) +
      pa(`M ${CX - gw / 2 + 7} ${top + 62} q ${gw * 0.16} -46 ${gw * 0.28} -6 q ${gw * 0.14} -40 ${gw * 0.28} 2 q ${gw * 0.16} -34 ${gw * 0.3} 4`, { ...HI, 'stroke-width': 2 }) +
      el(CX, top + 74, gw / 2 - 8, gw * 0.14, { ...DET, opacity: 0.7 }) +
      hatch(`<path d="M ${CX - gw / 2 + 6} ${top + 74} L ${CX - gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw / 2 - 6} ${top + 74} Z"/>`, {
        bbox: { x: CX - gw / 2, y: top + 74, width: gw, height: gh - 84 }, angle: 72, gap: 6, opacity: 0.34,
      }) +
      bubbles
    )
  },

  'dr-juice': () => {
    const gy = 505, gh = 450, gw = 226
    const top = gy - gh / 2
    return (
      glass(CX, gy, gw, gh) +
      el(CX, top + 80, gw / 2 - 8, gw * 0.15, { ...HI, opacity: 0.8 }) +
      stipple(`<path d="M ${CX - gw / 2 + 6} ${top + 80} L ${CX - gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw * 0.38} ${gy + gh / 2 - 6} L ${CX + gw / 2 - 6} ${top + 80} Z"/>`, {
        bbox: { x: CX - gw / 2, y: top + 80, width: gw, height: gh - 90 }, n: 150, seed: 61, r: 2.4, opacity: 0.42,
      }) +
      grp(citrus(0, 0, 62), { transform: `translate(${CX + gw / 2 - 18} ${top + 6}) rotate(18)` }) +
      ln(CX - 40, top - 52, CX + 18, gy + 92, { ...DET, 'stroke-width': 5, opacity: 0.6 }) +
      leaf(CX - 108, top + 44, 78, -40)
    )
  },

  'feat-egusi-poundedyam': () => {
    const cy = PY - 46
    return (
      el(CX, PY + 46, 340, 104, { ...DET, opacity: 0.5 }) +
      bowl(CX - 132, cy, 206, 1) +
      stipple(`<ellipse cx="${CX - 132}" cy="${cy}" rx="198" ry="60"/>`, {
        bbox: { x: CX - 330, y: cy - 60, width: 396, height: 120 }, n: 300, seed: 5, r: 2.5, opacity: 0.55,
      }) +
      chunks(CX - 132, cy, 116, 4, 9, 38) +
      dome(CX + 178, cy + 34, 148, 150) +
      steam(CX - 132, cy - 82, 168, 3, 62)
    )
  },
}

// ── interior scenes (4:3) ─────────────────────────────────────────────────
const SW = 1200
const SH = 900

function pendant(x, y, drop) {
  return (
    ln(x, y - drop, x, y, DET) +
    pa(`M ${x - 46} ${y} q 46 -54 92 0 Z`, OUT) +
    el(x, y, 46, 11, DET) +
    pa(`M ${x - 46} ${y + 4} L ${x - 128} ${y + 214} L ${x + 128} ${y + 214} L ${x + 46} ${y + 4}`, { ...FINE, opacity: 0.28 })
  )
}

const scenes = {
  'about-interior': () =>
    pa(`M 300 620 L 300 300 q 300 -190 600 0 L 900 620`, { ...DET, opacity: 0.4 }) +
    pendant(370, 232, 200) + pendant(600, 196, 164) + pendant(830, 232, 200) +
    ln(150, 660, 1050, 660, OUT) +
    ln(232, 660, 300, 812, DET) + ln(968, 660, 900, 812, DET) +
    pa('M 360 660 L 360 560 q 60 -26 120 0 L 480 660', DET) +
    pa('M 720 660 L 720 560 q 60 -26 120 0 L 840 660', DET) +
    el(470, 646, 62, 17, FINE) + el(730, 646, 62, 17, FINE) +
    el(600, 640, 46, 13, FINE) +
    ln(150, 812, 1050, 812, { ...FINE, opacity: 0.3 }),

  'gallery-1': () => {
    const fork = (x, y, r) =>
      grp(
        `<rect x="-9" y="-6" width="18" height="104" rx="8" fill="none" stroke="${GOLD}" stroke-width="2.4"/>` +
          [-9, -3, 3, 9].map((t) => `<line x1="${t}" y1="-6" x2="${t}" y2="-58" stroke="${GOLD}" stroke-width="2.2" stroke-linecap="round"/>`).join('') +
          `<path d="M -9 -6 q 9 -14 18 0" fill="none" stroke="${GOLD}" stroke-width="2.2"/>`,
        { transform: `translate(${x} ${y}) rotate(${r})` },
      )
    const knife = (x, y, r) =>
      grp(
        `<rect x="-8" y="0" width="16" height="98" rx="7" fill="none" stroke="${GOLD}" stroke-width="2.4"/>` +
          `<path d="M -8 0 q 4 -62 16 -62 q 4 34 0 62 Z" fill="none" stroke="${GOLD}" stroke-width="2.4"/>`,
        { transform: `translate(${x} ${y}) rotate(${r})` },
      )
    const setting = (cx2) =>
      ci(cx2, 430, 124, OUT) + ci(cx2, 430, 92, DET) + ci(cx2, 430, 58, FINE) +
      fork(cx2 - 168, 388, -4) + knife(cx2 + 168, 388, 4) +
      ci(cx2 + 132, 268, 40, OUT) + ci(cx2 + 132, 268, 27, FINE)
    return (
      setting(322) + setting(878) +
      ci(600, 604, 30, OUT) +
      pa('M 600 574 q 13 -40 0 -66', { ...HI, 'stroke-width': 2.6 }) +
      ci(600, 590, 74, { ...FINE, opacity: 0.2 }) +
      ci(600, 590, 124, { ...FINE, opacity: 0.11 }) +
      ln(120, 742, 1080, 742, { ...FINE, opacity: 0.28 })
    )
  },

  'gallery-2': () => {
    const rail = ln(180, 132, 1020, 132, OUT)
    let hang = ''
    const tools = [
      (x) => ci(x, 292, 30, DET) + ci(x, 292, 18, FINE),                       // skimmer
      (x) => pa(`M ${x - 26} 268 q 26 58 52 0 Z`, DET),                        // ladle bowl
      (x) => pa(`M ${x - 20} 272 q 20 44 40 0 Z`, DET),                        // spoon
      (x) => [0, 1, 2, 3].map((k) => pa(`M ${x} 250 q ${(k - 1.5) * 17} 30 ${(k - 1.5) * 11} 62`, FINE)).join(''),
    ]
    ;[300, 400, 500, 600].forEach((x, i) => {
      hang += ln(x, 132, x, 262, DET) + tools[i](x)
    })
    const pot = (x, y, w, h) =>
      pa(`M ${x - w / 2} ${y} C ${x - w / 2} ${y + h * 0.86} ${x - w * 0.3} ${y + h} ${x} ${y + h} C ${x + w * 0.3} ${y + h} ${x + w / 2} ${y + h * 0.86} ${x + w / 2} ${y}`, OUT) +
      el(x, y, w / 2, w * 0.15, OUT) +
      pa(`M ${x - w / 2 - 26} ${y + 22} q -20 12 -2 30 q 14 10 28 -6`, DET) +
      pa(`M ${x + w / 2 + 26} ${y + 22} q 20 12 2 30 q -14 10 -28 -6`, DET) +
      hatch(`<path d="M ${x - w / 2} ${y} C ${x - w / 2} ${y + h * 0.86} ${x - w * 0.3} ${y + h} ${x} ${y + h} C ${x + w * 0.3} ${y + h} ${x + w / 2} ${y + h * 0.86} ${x + w / 2} ${y} Z"/>`, {
        bbox: { x: x - w / 2, y, width: w, height: h }, angle: 66, gap: 12, opacity: 0.26,
      })
    const flame = (x, y, sc, op) =>
      pa(`M ${x} ${y} q ${-26 * sc} ${-24 * sc} ${-8 * sc} ${-52 * sc} q ${14 * sc} ${16 * sc} ${16 * sc} ${4 * sc} q ${6 * sc} ${22 * sc} ${-8 * sc} ${48 * sc} Z`,
         { ...DET, stroke: PEPPER, opacity: op })
    return (
      rail + hang +
      ln(150, 656, 1050, 656, OUT) +
      pot(788, 452, 248, 190) + steam(788, 410, 176, 3, 66) +
      pot(430, 496, 176, 140) + steam(430, 462, 128, 2, 54) +
      flame(700, 700, 1.1, 0.75) + flame(788, 706, 0.85, 0.5) + flame(866, 700, 1, 0.65) +
      flame(388, 700, 0.9, 0.6) + flame(462, 704, 0.75, 0.42)
    )
  },

  'gallery-3': () => {
    const stem = (x, y) =>
      pa(`M ${x - 76} ${y} q 8 118 76 138 q 68 -20 76 -138 Z`, OUT) +
      el(x, y, 76, 20, OUT) +
      ln(x, y + 138, x, y + 208, DET) +
      el(x, y + 212, 54, 14, OUT) +
      pa(`M ${x - 62} ${y + 22} q 62 24 124 0`, { ...HI, opacity: 0.6 })
    return (
      stem(348, 330) + stem(852, 330) +
      `<rect x="556" y="470" width="88" height="188" rx="6" fill="none" stroke="${GOLD}" stroke-width="2.4"/>` +
      el(600, 470, 44, 12, DET) +
      ln(600, 462, 600, 424, DET) +
      pa('M 600 424 q 22 -40 0 -74 q -22 34 0 74 Z', { ...HI, 'stroke-width': 2.4 }) +
      ci(600, 396, 78, { ...FINE, opacity: 0.2 }) +
      ci(600, 396, 130, { ...FINE, opacity: 0.11 }) +
      ln(150, 660, 1050, 660, { ...DET, opacity: 0.5 })
    )
  },

  'gallery-4': () => {
    let awning = ''
    for (let i = 0; i < 9; i++) {
      awning += pa(`M ${300 + i * 75} 330 L ${300 + i * 75 + 37} 404 L ${300 + i * 75 + 75} 330`, DET)
    }
    let win = ''
    ;[[380, 520], [600, 520], [820, 520]].forEach(([x, y]) => {
      win += `<rect x="${x - 78}" y="${y - 86}" width="156" height="172" rx="3" fill="none" stroke="${GOLD}" stroke-width="2.2"/>`
      win += hatch(`<rect x="${x - 78}" y="${y - 86}" width="156" height="172"/>`, {
        bbox: { x: x - 78, y: y - 86, width: 156, height: 172 }, angle: 90, gap: 15, opacity: 0.2,
      })
      win += ln(x, y - 86, x, y + 86, { ...FINE, opacity: 0.35 })
    })
    return (
      pa('M 260 760 L 260 330 L 940 330 L 940 760', OUT) +
      ln(240, 330, 960, 330, OUT) + awning + win +
      ln(150, 760, 1050, 760, OUT) +
      ln(1010, 760, 1010, 300, DET) +
      pa('M 968 300 q 42 -54 84 0 Z', OUT) + el(1010, 300, 42, 11, DET) +
      ci(1010, 316, 62, { ...FINE, opacity: 0.22 }) + ci(1010, 316, 108, { ...FINE, opacity: 0.12 }) +
      pa('M 1010 304 L 946 486 L 1074 486 Z', { ...FINE, opacity: 0.14 })
    )
  },
}

// ── write ─────────────────────────────────────────────────────────────────
let n = 0
for (const [id, build] of Object.entries(dishes)) {
  writeFileSync(`${OUTDIR}${id}.svg`, svg(D, D, build(), (n % 7) + 1))
  n++
}
for (const [id, build] of Object.entries(scenes)) {
  writeFileSync(`${OUTDIR}${id}.svg`, svg(SW, SH, build(), (n % 7) + 1))
  n++
}
console.log(`wrote ${n} engraved plates to public/images/`)
