const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();

// --- Sanitize on the server too ---
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>&"']/g, (ch) => {
        switch (ch) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default:  return ch;
        }
    });
}

io.on('connection', (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    socket.on('user-joined', (username) => {
        // Validate
        if (!username || typeof username !== 'string') return;
        const clean = sanitize(username.trim()).substring(0, 20);
        if (!clean) return;

        // Check duplicates
        const taken = Array.from(users.values())
            .some(n => n.toLowerCase() === clean.toLowerCase());

        if (taken) {
            socket.emit('username-taken', clean);
            return;
        }

        users.set(socket.id, clean);
        io.emit('update-user-list', Array.from(users.values()));

        // System message
        socket.broadcast.emit('receive-message', {
            message: `${clean} joined the chat`,
            username: '⚡ System',
            time: new Date().toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', hour12: true
            }),
            isSystem: true
        });

        // Confirm join to this user
        socket.emit('join-confirmed', clean);
        console.log(`✅ ${clean} joined`);
    });

    socket.on('send-message', (data) => {
        const username = users.get(socket.id);
        if (!username) return; // Not registered

        // Validate message
        if (!data || !data.message || typeof data.message !== 'string') return;
        const message = sanitize(data.message.trim()).substring(0, 2000);
        if (!message) return;

        const time = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
        });

        socket.broadcast.emit('receive-message', {
            message: message,
            username: username,
            time: time
        });
    });

    socket.on('disconnect', () => {
        const username = users.get(socket.id);
        if (username) {
            users.delete(socket.id);
            io.emit('update-user-list', Array.from(users.values()));
            io.emit('receive-message', {
                message: `${username} left the chat`,
                username: '⚡ System',
                time: new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric', minute: '2-digit', hour12: true
                }),
                isSystem: true
            });
            console.log(`❌ ${username} disconnected`);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});