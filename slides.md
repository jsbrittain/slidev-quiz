---
theme: seriph
background: https://cover.sli.dev
title: Slidev Quiz demo
class: text-center
---

# Welcome to Slidev

Experimental Slidev quiz demo using websocket server and pixi.js

---

# pixi.js diagnostic

pixi.js vue component test. Open console for logs.

<PixiDiag />

---
#title: Pixi in Slidev
---

# PixiJS inside Slidev

<PixiBunny />

---
quiz:
  id: q1
  question: "Which first letter?"
  options: [A, B, C, D]
room: ABC123
---

# Quiz

Requires websocket server in `quiz_ws` if running locally.

<QuizPlayer :quiz="$frontmatter.quiz" :room="$frontmatter.room" />

---
quiz:
  id: q1
  question: "Which first letter?"
  options: [A, B, C, D]
room: ABC123
---

# Quiz Responses

Requires websocket server in `quiz_ws` if running locally.

<QuizHost :quiz="$frontmatter.quiz" :room="$frontmatter.room" />

---
quiz:
  id: q2
  question: "Which second letter?"
  options: [A, B, C, D, E, F]
room: ABC123
---

# Quiz

Requires websocket server in `quiz_ws` if running locally.

<QuizPlayer :quiz="$frontmatter.quiz" :room="$frontmatter.room" />

---
quiz:
  id: q2
  question: "Which second letter?"
  options: [A, B, C, D, E, F]
room: ABC123
---

# Quiz Responses

Requires websocket server in `quiz_ws` if running locally.

<QuizHost :quiz="$frontmatter.quiz" :room="$frontmatter.room" />
