<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import { createBarsChart } from './libs/pixiBars.js'

const props = defineProps({
  quiz: { type: Object, required: true },
  room: { type: String, required: true },
})

const WS_URL = props.wsUrl || import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

const hostEl = ref(null)
const status = ref('connecting…')
let app = null, chart = null, ws = null
let onMsg

function send(m) { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)) }

function requestCounts() {
  send({ type:'counts-request', room: props.room, quizId: props.quiz.id })
}

onMounted(async () => {
  app = new PIXI.Application()
  await app.init({ resizeTo: hostEl.value, background: '#0f1115', antialias: true })
  hostEl.value.appendChild(app.canvas)
  chart = createBarsChart(app, { keys: props.quiz.options, color: 0x2d8cf0 })
  chart.setCounts(Object.fromEntries(props.quiz.options.map(k => [k, 0])))
  window.addEventListener('resize', () => chart?.resize())

  ws = new WebSocket(WS_URL)

  let wsonopen = () => {
    status.value = 'connected'
    // once connected, ask for the current counts for this quiz
    requestCounts()
  }
  ws.addEventListener('open', wsonopen)

  let wsonclose = () => { status.value = 'disconnected' }
  ws.addEventListener('close', wsonclose)

  let wsonerror  = () => { status.value = 'error' }
  ws.addEventListener('error', wsonerror)

  let wsonmessage = (e) => {
    const m = JSON.parse(e.data)
    console.log('m', m, 'props', props)
    if (m.type === 'quiz-active' && m.quiz?.id === props.quiz.id) {
      chart?.setCounts(m.counts || {})
    }
    if (m.type === 'counts' && m.quizId === props.quiz.id) {
        console.log('counts', m.counts)
      chart?.setCounts(m.counts || {})
    }
  }
  ws.addEventListener('message', wsonmessage)
})

onBeforeUnmount(() => {
  ws?.removeEventListener('open', wsonopen)
  ws?.removeEventListener('close', wsonclose)
  ws?.removeEventListener('error', wsonerror)
  ws?.removeEventListener('message', wsonmessage)
  ws?.close()
  chart?.destroy()
  app?.destroy(true)
  app = chart = ws = null
})
</script>

<template>
  <div style="height: 100%; gap:10px">
    <div ref="hostEl" style="width:100%; height:80%; border-radius:12px; overflow:hidden;" />
    <div style="font:14px system-ui;color:#aaa">Status: {{ status }} • quiz: {{ quiz.id }} • room: {{ room }}</div>
  </div>
</template>
