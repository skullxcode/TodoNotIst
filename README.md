# ✅ TodoNotIst — Smart Todo App with n8n Automation

> A Todoist-inspired task management web application that integrates **n8n workflow automation** to intelligently enhance your tasks — automatically filling descriptions, assigning smart labels, and enriching metadata the moment you create a task.

---

## 🌐 Live Demo

> 🚧 **Demo coming soon** — deployment in progress.
>
> [![Live Demo](https://img.shields.io/badge/Live%20Demo-Coming%20Soon-orange?style=for-the-badge&logo=vercel)](https://github.com)
> [![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com)

---

## 📸 Demo Preview

<!-- Add screenshots or a GIF here -->

| Task Dashboard | Add Task Modal | Automation in Action |
|:-:|:-:|:-:|
| ![Dashboard Placeholder](https://via.placeholder.com/280x180?text=Dashboard) | ![Modal Placeholder](https://via.placeholder.com/280x180?text=Add+Task) | ![Automation Placeholder](https://via.placeholder.com/280x180?text=n8n+Workflow) |

> 💡 *Replace the placeholders above with actual screenshots or a demo GIF once available.*

---

## 📋 Overview

**TaskFlow** is a full-featured, browser-based task management application inspired by [Todoist](https://todoist.com). It is built with vanilla **HTML, CSS, and JavaScript** and supercharged with **n8n** — an open-source workflow automation platform.

What sets TaskFlow apart is its **automation-first approach to task creation**. When a user adds a new task, an n8n workflow is triggered behind the scenes to:

- 🤖 **Auto-fill** a smart task description
- 🏷️ **Assign relevant labels** based on the task title
- 📦 **Enrich metadata** such as priority, category, and estimated effort

This project was built to demonstrate practical integration between frontend web development and no-code/low-code automation tooling — a skill increasingly valued in modern development teams.

---

## ✨ Features

### 🗂️ Core Task Management
- ➕ Create, edit, and delete tasks
- ✅ Mark tasks as complete / incomplete
- 📁 Organize tasks into projects or categories
- 🔍 Search and filter tasks by label or status
- 📅 Set due dates with visual indicators

### ⚡ n8n Automation Integration
- 🤖 Auto-generated task descriptions on creation
- 🏷️ Smart label assignment based on task keywords
- 📊 Automatic metadata enrichment (priority, category, effort estimate)
- 🔔 Webhook-based real-time communication between the app and n8n

### 🎨 UI/UX
- 🌗 Clean, minimal Todoist-inspired interface
- 📱 Responsive design for mobile and desktop
- 🔄 Loading indicators during automation processing
- 💬 Toast notifications for task creation and automation status

---

## ⚙️ How the Automation Works

TaskFlow uses **n8n webhooks** to connect the frontend to a workflow automation backend.

### 🔁 Workflow Overview

```
User Creates Task
       │
       ▼
[Frontend sends POST request to n8n Webhook]
       │
       ▼
[n8n Workflow Triggered]
       │
       ├──► Analyze task title (keyword extraction)
       │
       ├──► Generate smart description (via AI node or template logic)
       │
       ├──► Assign labels (e.g., "work", "urgent", "research")
       │
       └──► Enrich metadata (priority level, category, time estimate)
              │
              ▼
[n8n sends enriched task data back to frontend via webhook response]
       │
       ▼
[Frontend updates the task card with enriched data]
```

### 🛠️ n8n Nodes Used

| Node | Purpose |
|------|---------|
| **Webhook** | Receives task data from the frontend |
| **Function / Code Node** | Parses task title, extracts keywords |
| **IF / Switch Node** | Routes task to correct label/category logic |
| **Set Node** | Builds enriched task payload |
| **Respond to Webhook** | Returns enriched data back to the frontend |
| *(Optional)* **OpenAI Node** | Generates natural language task descriptions |

> 💡 You can extend the workflow with additional nodes — for example, saving tasks to **Google Sheets**, sending **Slack notifications**, or syncing with a **Notion database**.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Automation** | [n8n](https://n8n.io) (self-hosted or cloud) |
| **Communication** | REST API / Webhooks (HTTP POST/GET) |
| **Styling** | Custom CSS with CSS Variables |
| **Icons** | [Font Awesome](https://fontawesome.com) or SVG icons |
| **Deployment** | GitHub Pages / Vercel / Netlify *(frontend)* |

---

## 🗂️ Project Structure

```
taskflow/
│
├── index.html              # Main HTML file — app shell
├── style.css               # Global styles and themes
├── app.js                  # Core JavaScript logic (tasks, UI, events)
├── automation.js           # Handles webhook calls to n8n
│
├── assets/
│   ├── icons/              # SVG or PNG icons
│   └── screenshots/        # App screenshots for README/docs
│
├── n8n-workflow/
│   └── taskflow-workflow.json   # Exported n8n workflow (importable)
│
├── .env.example            # Example environment variables template
├── README.md               # Project documentation (you are here!)
└── LICENSE                 # MIT License
```

---

## 🚀 Installation Guide

### ✅ Prerequisites

Before you begin, make sure you have the following:

- A modern web browser (Chrome, Firefox, Edge)
- [n8n](https://docs.n8n.io/getting-started/installation/) installed locally **or** an [n8n Cloud](https://app.n8n.cloud) account
- *(Optional)* [Node.js](https://nodejs.org/) if running n8n via npm
- *(Optional)* [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code extension for local development

---

### 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 🔧 Step 2 — Set Up n8n

#### Option A: n8n via npm (local)
```bash
npm install n8n -g
n8n start
```

#### Option B: n8n via Docker
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

> 🌐 n8n will be accessible at: `http://localhost:5678`

---

### 📤 Step 3 — Import the Workflow

1. Open your n8n dashboard at `http://localhost:5678`
2. Go to **Workflows → Import from File**
3. Select the file: `n8n-workflow/taskflow-workflow.json`
4. Click **Activate** to enable the workflow
5. Copy the **Webhook URL** displayed in the Webhook node

---

### 🔑 Step 4 — Configure Environment Variables

Create a `.env` file (or edit `automation.js` directly for simplicity):

```bash
cp .env.example .env
```

Edit `.env`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/taskflow
```

Or directly in `automation.js`:

```javascript
const N8N_WEBHOOK_URL = "http://localhost:5678/webhook/taskflow";
```

---

## ▶️ How to Run Locally

1. **Start n8n** (if not already running):
   ```bash
   n8n start
   ```

2. **Open the frontend:**
   - Option A: Open `index.html` directly in your browser
   - Option B: Use VS Code Live Server for hot-reload:
     ```
     Right-click index.html → "Open with Live Server"
     ```

3. Visit `http://127.0.0.1:5500` (Live Server default) or just open `index.html`

---

## 📖 Usage Instructions

### Adding a Task
1. Click the **"+ Add Task"** button
2. Enter a task title (e.g., `Research competitor pricing`)
3. *(Optional)* Set a due date
4. Click **"Create Task"**

### Watching the Automation
After you click "Create Task":
- A loading indicator appears on the new task card
- The app sends the task to your **n8n webhook** in the background
- n8n processes and returns enriched data
- The task card automatically updates with:
  - 📝 A generated description
  - 🏷️ Smart labels (e.g., `research`, `business`, `medium-priority`)
  - 📊 Enriched metadata

### Managing Tasks
- **Complete a task:** Click the circle checkbox
- **Edit a task:** Click the pencil icon
- **Delete a task:** Click the trash icon
- **Filter tasks:** Use the sidebar to filter by label, project, or status

---

## 💡 Example Workflow — Creating a Task

**Input (from frontend):**
```json
{
  "title": "Research competitor pricing models",
  "due_date": "2025-07-15",
  "created_at": "2025-07-10T09:30:00Z"
}
```

**n8n Processing:**
- Keyword detection: `research`, `competitor`, `pricing`
- Category match: `Business`
- Priority assignment: `Medium`
- Description generation: *"Analyze and document pricing strategies used by top competitors in the market to identify gaps and opportunities."*

**Output (back to frontend):**
```json
{
  "title": "Research competitor pricing models",
  "description": "Analyze and document pricing strategies used by top competitors in the market to identify gaps and opportunities.",
  "labels": ["research", "business", "medium-priority"],
  "category": "Business",
  "priority": "medium",
  "estimated_effort": "2 hours",
  "due_date": "2025-07-15"
}
```

---

## 📷 Screenshots

> *(Replace with actual screenshots)*

### 🏠 Task Dashboard
![Dashboard Screenshot](https://via.placeholder.com/800x450?text=Task+Dashboard+Screenshot)

### ➕ Add Task Modal
![Add Task](https://via.placeholder.com/800x450?text=Add+Task+Modal+Screenshot)

### 🤖 Automation in Action (n8n Workflow)
![n8n Workflow](https://via.placeholder.com/800x450?text=n8n+Workflow+Screenshot)

### 🏷️ Enriched Task Card
![Enriched Task](https://via.placeholder.com/800x450?text=Enriched+Task+Card+Screenshot)

---

## 🔮 Future Improvements

- [ ] 🔐 User authentication (login/signup)
- [ ] 🗄️ Backend database integration (Supabase / Firebase / MongoDB)
- [ ] 🤖 OpenAI-powered description generation via n8n AI node
- [ ] 📧 Email reminders via n8n SMTP node
- [ ] 📆 Google Calendar sync via n8n Google Calendar node
- [ ] 📱 Progressive Web App (PWA) support
- [ ] 🌍 Multi-language support (i18n)
- [ ] 🧪 Unit and integration tests (Jest)
- [ ] 🐳 Docker Compose setup for one-command local deployment
- [ ] 📊 Productivity analytics dashboard

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **Pull Request**

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) standard for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License © 2025 [Your Name]
```

---

## 👤 Author

**[Your Name]**

> 🚀 Frontend Developer passionate about building practical tools that connect the web with automation.

[![Portfolio](https://img.shields.io/badge/Portfolio-yourwebsite.com-blue?style=for-the-badge&logo=google-chrome)](https://yourwebsite.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/your-username)
[![Email](https://img.shields.io/badge/Email-Contact%20Me-red?style=for-the-badge&logo=gmail)](mailto:your@email.com)

---

## ⭐ Show Your Support

If you found this project helpful or interesting, please consider giving it a **⭐ star** on GitHub — it helps others discover the project and motivates continued development!

---

> *Built with ❤️ using HTML, CSS, JavaScript, and the power of n8n workflow automation.*
