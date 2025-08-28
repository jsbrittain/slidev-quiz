<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  quiz: { type: Object, required: true },     // { id, question, options[], ... }
  room: { type: String, required: true },
})

const WS_URL = props.wsUrl || import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

const status = ref('connecting…')
let ws

function send(m) { if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(m)) }

function answer(choice) {
  send({ type:'answer', room: props.room, quizId: props.quiz.id, choice })
}

onMounted(() => {
  ws = new WebSocket(WS_URL)
  ws.onopen = () => {
    console.log('WebSocket connected')
    console.log('Joining room:', props.room)
    console.log('Quiz:', props.quiz)
    status.value = 'connected'
    // push (upsert) quiz definition from slide, then activate it
    send({ type:'quiz-upsert', room: props.room, quiz: props.quiz })
  }
  ws.onclose = () => status.value = 'disconnected'
  ws.onerror = () => status.value = 'error'
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.type === 'answer-ack' && m.quizId === props.quiz.id) {
      // optional: show "Recorded: X"
    }
  }
})
</script>

<template>
  <div style="display:grid;gap:12px;font:16px system-ui">
    <div>Status: {{ status }}</div>
    <h3 style="margin:0">{{ quiz.question }}</h3>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button
        v-for="opt in quiz.options" :key="opt"
        @click="answer(opt)"
        style="padding:10px 18px;border-radius:10px;border:1px solid #333;background:#222;color:#fff;cursor:pointer"
      >{{ opt }}</button>
    </div>
  </div>
</template>
