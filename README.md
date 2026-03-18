# 📝 TodoNotIst

> A Todoist-inspired todo app — but with a twist. Powered by vanilla JS and a sprinkle of AI magic via n8n automation.

---

## 🚀 About the Project

I built TodoNotIst because I wanted a clean, no-nonsense task manager that I actually *understood* end-to-end — no bloated frameworks, no black boxes, just HTML, CSS, and JavaScript doing their thing.

But the part I'm most proud of? The **✨ Auto-Fill** button. Type a task name, hit it, and an n8n workflow fires off in the background — hitting an AI model that figures out the priority, writes a description, picks the right project, and slaps on relevant labels. All in a couple of seconds. It feels like magic, and honestly it kind of is.

This was my playground for learning how frontend apps talk to automation backends. Turns out they talk pretty well.

---

## 🌐 Live Demo

👉 **[skullxcode.github.io/TodoNotIst](https://skullxcode.github.io/TodoNotIst/)**

> ⚠️ The ✨ Auto-Fill feature requires a running n8n instance with the included workflow. See setup below.

---

## ✨ Features

**Core Task Management**
- ➕ Create, edit, and delete tasks
- ✅ Toggle tasks between in-progress and completed
- 📁 Organize tasks into custom **projects**
- 🏷️ Create and assign **labels** to tasks
- 📋 Add **subtasks** to break work down further
- 📅 Set due dates with smart display — "Today", "Tomorrow", "Overdue"
- 🔍 Real-time **search** across all tasks
- 🔃 **Sort** tasks by priority, due date, alphabetical order, or drag-and-drop manually
- 🗑️ Bulk-clear completed tasks
- ⏰ Due date reminders (browser alert, 24h before)

**AI-Powered via n8n**
- ✨ **Auto-Fill button** — type a task name and let AI fill in the description, priority, project, and labels automatically
- 🤖 Powered by a Groq-hosted LLM (GPT-class model) via n8n's LangChain node
- 📦 AI also suggests subtasks to help you break down bigger tasks
- 🔔 Toast notifications for auto-fill success/failure feedback

**UI/UX**
- 🌗 Dark mode / light mode toggle (persisted across sessions)
- 📱 Responsive layout — works on mobile and desktop
- ⌨️ Keyboard shortcuts: `N` to add a task, `/` or `Ctrl+K` to focus search, `Esc` to cancel
- 💾 All data saved in **localStorage** — no backend needed
- ✨ Visual flash feedback when auto-fill populates a field

---

## 🛠️ Tech Stack

| | |
|---|---|
| **HTML5** | App structure and markup |
| **CSS3** | Custom styles with CSS variables, dark mode support |
| **Vanilla JavaScript (ES6+)** | All logic — state, rendering, events, drag-and-drop |
| **n8n** | Workflow automation — receives task data via webhook, runs AI enrichment, returns structured JSON |
| **Groq / LLM** | The AI model behind Auto-Fill, connected via n8n's LangChain node |
| **localStorage** | Client-side persistence, no backend required |

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/skullxcode/TodoNotIst.git
cd TodoNotIst
```

### 2. Open the app

Just open `index.html` in your browser — no build step needed.

```bash
# Or use VS Code Live Server for hot-reload:
# Right-click index.html → "Open with Live Server"
```

That's it for the basic app. Tasks will save to your browser's localStorage automatically.

---

### 3. Set up n8n (for Auto-Fill)

The ✨ Auto-Fill feature needs a running n8n instance with the included workflow.

#### Option A — n8n via npm
```bash
npm install -g n8n
n8n start
```

#### Option B — n8n via Docker
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

> n8n will be at: `http://localhost:5678`

### 4. Import the workflow

1. Open your n8n dashboard
2. Go to **Workflows → Import from File**
3. Select `n8n.json` from this repo
4. Add your **Groq API credentials** to the `Groq Chat Model` node
5. Click **Activate**
6. Copy the **Webhook URL** from the `Webhook (POST)` node

### 5. Point the app at your webhook

Open `script.js` and update this line near the bottom:

```javascript
const N8N_WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
```

Now hit ✨ Auto-Fill after typing a task name and watch it go.

---

## 📸 Screenshots

| | |
|---|---|
| ![Home](./screenshots/home.png) | Main dashboard — task list, sidebar projects, sort controls |
| ![Add Task](./screenshots/add-task.png) | Add task form with Auto-Fill button |
| ![Dark Mode](./screenshots/dark-mode.png) | Dark mode (because of course) |
| ![n8n Workflow](./screenshots/n8n-workflow.png) | The n8n workflow behind Auto-Fill |

> 💡 *Screenshots coming soon — feel free to contribute some!*

---

## 🤔 Why I Built This

Mostly because I wanted to learn how a "normal" frontend app could talk to an automation tool like n8n — and how far you can get with just vanilla JS before needing a framework.

The n8n integration was the fun experiment. Instead of hardcoding categorization logic, I just... asked an LLM. Type "prepare Q3 investor report", get back `priority: p1`, `labels: ["work", "finance"]`, and a two-sentence description. It's silly and practical at the same time, which is kind of the sweet spot.

---

## 🔮 Future Improvements

- [ ] 🔐 User authentication + cloud sync (thinking Supabase)
- [ ] 📧 Email/Slack reminders via n8n notification nodes
- [ ] 📆 Google Calendar sync for due dates
- [ ] 📊 Simple productivity stats (tasks completed per week, etc.)
- [ ] 📱 PWA support — install it like an app
- [ ] 🧪 Tests — there are none, which is fine until it isn't
- [ ] 🐳 Docker Compose to spin up the whole stack in one command

---

## 🙌 Acknowledgements

- [n8n](https://n8n.io) — the automation backbone
- [Groq](https://groq.com) — blazing fast inference
- [Todoist](https://todoist.com) — the design inspiration

---

> *Built with ❤️, localStorage, and way too many `document.getElementById` calls.*