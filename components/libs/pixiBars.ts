import * as PIXI from 'pixi.js'

/**
 * Create a reusable bar chart inside a PixiJS Application.
 * @param {PIXI.Application} app
 * @param {Object} opts
 * @param {string[]} opts.keys - array of option labels (e.g. ['A','B','C','D'] or ['Yes','No','Maybe'])
 * @param {number} opts.color - hex fill color
 * @param {number} opts.margin - horizontal margin
 * @param {number} opts.baselineOffset - pixels reserved at bottom
 */
export function createBarsChart(app, opts = {}) {
  const keys = opts.keys ?? ['A','B','C','D']
  const color = opts.color ?? 0x2d8cf0
  const margin = opts.margin ?? 20
  const baselineOffset = opts.baselineOffset ?? 80

  const root = new PIXI.Container()
  app.stage.addChild(root)

  // One container per option, reused every update
  const buckets = new Map()
  keys.forEach(k => {
    const g = new PIXI.Graphics()
    const label = new PIXI.Text({ text: `${k}\n0`, style: { fill: 0xffffff, fontSize: 22, align:'center' }})
    label.anchor.set(0.5, 1)
    root.addChild(g)
    root.addChild(label)
    buckets.set(k, { g, label })
  })

  let counts = {}
  function layout() {
    const { width: w, height: h } = app.renderer
    const n = keys.length
    const barW = Math.min(160, w / (n * 2))  // scale bar width to number of options
    const gap  = barW * 0.5
    const totalWidth = n * barW + (n - 1) * gap
    const left = Math.max(margin, (w - totalWidth) / 2)
    const maxH = Math.max(40, h * 0.6)
    const baseline = h - baselineOffset
    return { barW, gap, left, maxH, baseline }
  }

  function draw() {
    const { barW, gap, left, maxH, baseline } = layout()
    const total = Math.max(1, keys.reduce((s,k)=> s + (counts[k] ?? 0), 0))

    keys.forEach((k, i) => {
      const v = counts[k] ?? 0
      const pct = v / total
      const bh = Math.max(6, pct * maxH)
      const x = left + i * (barW + gap)
      const y = baseline - bh

      const bucket = buckets.get(k)
      bucket.g.clear().roundRect(x, y, barW, bh, 10).fill(color)
      bucket.label.text = `${k}\n${v}`
      bucket.label.position.set(x + barW / 2, y - 6)
    })
  }

  function setCounts(next) { counts = { ...next }; draw() }
  function resize() { draw() }
  function destroy() { root.destroy(true) }

  return { container: root, setCounts, resize, destroy }
}
