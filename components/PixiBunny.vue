<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Application, Assets, Sprite } from 'pixi.js'

const host = ref(null)
let app, bunny
let onResize, onCtxLost, onCtxRestored

onMounted(async () => {
  // Create + init application (v8)
  app = new Application()
  await app.init({
    background: '#1099bb',
    resizeTo: host.value,        // fit the slide container
    antialias: true,
  })
  host.value.appendChild(app.canvas)

  // (optional) handle WebGL context loss in dev
  const canvas = app.canvas
  onCtxLost = (e) => { e.preventDefault(); app.ticker.stop() }
  onCtxRestored = () => { app.ticker.start() }
  canvas.addEventListener('webglcontextlost', onCtxLost, false)
  canvas.addEventListener('webglcontextrestored', onCtxRestored, false)

  // Load texture (set CORS prefs to avoid odd ORB/CORS cases)
  Assets.setPreferences({ crossOrigin: 'anonymous', preferCreateImageBitmap: false })
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png')

  // Create sprite
  bunny = new Sprite(texture)
  bunny.anchor.set(0.5)
  app.stage.addChild(bunny)

  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime
  })

  // Center sprite and keep it centered on resize
  const center = () => {
    const { width, height } = app.renderer
    bunny.position.set(width / 2, height / 2)
  }
  onResize = center
  window.addEventListener('resize', onResize)
  center()
})

onBeforeUnmount(() => {
  if (onResize) window.removeEventListener('resize', onResize)
  const canvas = app?.canvas
  if (canvas && onCtxLost) canvas.removeEventListener('webglcontextlost', onCtxLost)
  if (canvas && onCtxRestored) canvas.removeEventListener('webglcontextrestored', onCtxRestored)
  if (app) { app.destroy(true, { children: true, texture: true, baseTexture: true }); app = null }
})
</script>

<template>
  <div
    ref="host"
    style="width:100%; height:60vh; border-radius:12px; overflow:hidden;"
    title="Pixi bunny"
  />
</template>
