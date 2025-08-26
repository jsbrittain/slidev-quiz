<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'

const host = ref(null)
let app = null
let rotating = null
let fpsText = null

function log(...a) { console.log('[PixiDiag]', ...a) }

async function mountPixi() {
  // Shared options for both v8 and v7
  const optsV8 = {
    resizeTo: host.value,
    background: '#101318',
    antialias: true,
  }
  const optsV7 = {
    resizeTo: host.value,
    backgroundColor: 0x101318,
    antialias: true,
  }

  // v8: Application requires async init() and uses canvas
  // v7: Application accepts options in constructor and uses view
  if (PIXI.Application.prototype.init) {
    // ----- Pixi v8 path -----
    app = new PIXI.Application()
    await app.init(optsV8)
    host.value.appendChild(app.canvas)
    log('v8 Application initialized', { version: PIXI.VERSION })
  } else {
    // ----- Pixi v7 path -----
    app = new PIXI.Application(optsV7)
    host.value.appendChild(app.view)
    log('v7 Application initialized', { version: PIXI.VERSION })
  }

  // Big obvious red triangle
  const g = new PIXI.Graphics()
  g.beginFill(0xff2d2d)
  g.moveTo(0, -120)
  g.lineTo(-150, 120)
  g.lineTo(150, 120)
  g.closePath()
  g.endFill()

  rotating = new PIXI.Container()
  rotating.addChild(g)
  app.stage.addChild(rotating)

  // FPS text
  const textStyle = { fill: 0xffffff, fontFamily: 'monospace', fontSize: 16 }
  // v8 moved Text into @pixi/text but the meta bundle still exposes PIXI.Text
  fpsText = new PIXI.Text('FPS: --', textStyle)
  fpsText.position.set(12, 10)
  app.stage.addChild(fpsText)

  // Layout + interaction
  const center = () => {
    const w = app.renderer.width
    const h = app.renderer.height
    rotating.position.set(w / 2, h / 2)
  }
  center()
  window.addEventListener('resize', center)

  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  app.stage.cursor = 'pointer'
  app.stage.on('pointerdown', () => {
    if (app.ticker.started) {
      app.ticker.stop()
      fpsText.text = `FPS: 0.0 | paused`
      log('ticker stopped')
    } else {
      app.ticker.start()
      log('ticker started')
    }
  })

  app.ticker.add((dt) => {
    rotating.rotation += 0.01 * dt
    if (app.ticker.FPS) fpsText.text = `FPS: ${app.ticker.FPS.toFixed(1)} | running`
  })

  // expose for debugging
  window.__pixiDiag = { app, PIXI }
  log('ready: click canvas to pause/resume')
}

onMounted(async () => {
  try {
    await mountPixi()
  } catch (e) {
    log('ERROR creating Pixi app:', e)
    if (host.value) {
      host.value.innerHTML = `<div style="color:#fff;background:#b00020;padding:12px;border-radius:8px;font-family:monospace;">
        Pixi failed to start: ${String(e)}
      </div>`
    }
  }
})

onBeforeUnmount(() => {
  log('beforeUnmount: cleaning up…')
  window.removeEventListener('resize', () => {})
  if (app) {
    app.destroy(true, { children: true, texture: true, baseTexture: true })
    app = null
  }
  delete window.__pixiDiag
})
</script>

<template>
  <div
    ref="host"
    style="width:100%;height:60vh;border-radius:12px;overflow:hidden;outline:2px dashed #2d8cf0;"
    title="PixiDiag: click to pause/resume"
  />
</template>
