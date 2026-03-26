# 💬 ChatApp - Purple Edition

A real-time chat application built with **Node.js**, **Express**, and **Socket.IO** featuring a sleek purple neon UI.

---

## ✨ Features

- 🔮 Real-time messaging with WebSockets
- 👤 Custom username login screen
- 👥 Live online user list
- 🔒 XSS protection (sanitized inputs)
- ⚡ Join/leave system notifications
- 🔍 User search filter
- 📱 Mobile responsive design
- 🎨 Purple neon glassmorphism UI

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

### Installation & Setup

# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/chat-app.git

# 2. Navigate into the project
cd chat-app

# 3. Install dependencies (REQUIRED FIRST TIME)
npm install

# 4. Start the server
npm start



Open in Browser
text

http://localhost:3000
🗂️ Project Structure
text

chat-app/
├── server.js           # Main server logic
├── package.json        # Dependencies
└── public/
    ├── index.html      # Main UI
    ├── app.css         # Styles
    ├── script.js       # Client-side logic
    ├── purple.png      # Sidebar background
    └── purple1.png     # Header background

🧪 Testing Locally
Open 2+ browser tabs at http://localhost:3000:

Tab 1	Tab 2
Enter username "Alice"	Enter username "Bob"
Send a message	See Alice's message appear
⚠️ Common Issues & Fixes
Issue: EADDRINUSE: Port 3000 Already In Use
Something is still running on port 3000 from a previous run.

Fix:

cmd

# Windows: Kill node processes
taskkill /F /IM node.exe

# Or find specific PID using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Then restart server
npm start
Issue: node_modules not found / Cannot find module 'express'
Dependencies haven't been installed yet (common after cloning).

Fix:

Bash

npm install
Issue: Files Missing After Clone (public/ folder gone)
If you clone the repo but don't see your frontend files:

Check if you pushed everything:

Bash

# Verify remote has public folder before cloning
On the original machine, ensure you did:

Bash

git add .
git commit -m "Add public assets"
git push origin main
Then re-pull on clone:

Bash

git pull



