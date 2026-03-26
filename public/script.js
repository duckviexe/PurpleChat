// ============================
//  SECURE CHAT CLIENT
// ============================

const socket = io();

// --- DOM Elements ---
const loginOverlay   = document.getElementById('login-overlay');
const usernameInput  = document.getElementById('username-input');
const joinBtn        = document.getElementById('join-btn');
const loginError     = document.getElementById('login-error');
const chatContainer  = document.getElementById('chat-container');
const messageInput   = document.getElementById('msg-input');
const sendBtn        = document.getElementById('send-button');
const messagesBox    = document.getElementById('messages-container');
const userList       = document.getElementById('user-list');
const searchInput    = document.getElementById('search-input');

let currentUser = null;

// --- XSS Protection ---
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Get Time ---
function getTime() {
    return new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// ============================
//  LOGIN SYSTEM
// ============================

function joinChat() {
    const name = usernameInput.value.trim();

    if (!name) {
        loginError.textContent = 'Please enter a username';
        return;
    }
    if (name.length < 2) {
        loginError.textContent = 'Username must be at least 2 characters';
        return;
    }
    if (name.length > 20) {
        loginError.textContent = 'Username must be 20 characters or less';
        return;
    }

    loginError.textContent = '';
    socket.emit('user-joined', name);
}

// Click join button
joinBtn.addEventListener('click', joinChat);

// Press Enter on username input
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        joinChat();
    }
});

// Server confirmed the join
socket.on('join-confirmed', (name) => {
    currentUser = {
        name: name,
        initials: name.substring(0, 2).toUpperCase()
    };
    loginOverlay.style.display = 'none';
    chatContainer.style.display = 'flex';
    messageInput.focus();
});

// Username was taken
socket.on('username-taken', (name) => {
    loginError.textContent = `"${escapeHTML(name)}" is already taken. Try another.`;
});

// ============================
//  MESSAGING
// ============================

function clearEmptyState() {
    const empty = document.querySelector('.empty-state');
    if (empty) empty.remove();
}

function addMessage(data, isSent) {
    clearEmptyState();

    const msgDiv = document.createElement('div');

    // System messages
    if (data.isSystem) {
        msgDiv.className = 'message system-message';
        msgDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">${escapeHTML(data.message)}</div>
            </div>
        `;
        messagesBox.appendChild(msgDiv);
        messagesBox.scrollTop = messagesBox.scrollHeight;
        return;
    }

    msgDiv.className = `message ${isSent ? 'sent' : ''}`;

    const initials = isSent
        ? currentUser.initials
        : (data.username ? data.username.substring(0, 2).toUpperCase() : '??');

    const safeName = escapeHTML(data.username || 'Unknown');
    const safeMsg  = escapeHTML(data.message);
    const time     = escapeHTML(data.time || getTime());

    msgDiv.innerHTML = `
        <div class="message-avatar">${escapeHTML(initials)}</div>
        <div class="message-content">
            <div class="message-bubble">${safeMsg}</div>
            <span class="message-time">${time}${!isSent ? ' • ' + safeName : ''}</span>
        </div>
    `;

    messagesBox.appendChild(msgDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function sendMessage() {
    if (!currentUser) return;

    const text = messageInput.value.trim();
    if (!text) return;

    const time = getTime();

    // Show in own UI
    addMessage({ message: text, time: time }, true);

    // Send to server
    socket.emit('send-message', { message: text, time: time });

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    messageInput.focus();
}

// --- Send Button Click ---
sendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sendMessage();
});

// --- Enter Key ---
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// --- Auto-resize textarea ---
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// --- Receive messages ---
socket.on('receive-message', (data) => {
    addMessage(data, false);
});

// ============================
//  USER LIST
// ============================

socket.on('update-user-list', (users) => {
    userList.innerHTML = '';

    users.forEach(name => {
        const div = document.createElement('div');
        div.className = 'chat-item';

        const safeName = escapeHTML(name);
        const initials = escapeHTML(name.substring(0, 2).toUpperCase());
        const isYou = currentUser && name === currentUser.name;

        div.innerHTML = `
            <div class="message-avatar" style="margin-right: 12px; width: 40px; height: 40px; min-width: 40px;">
                ${initials}
            </div>
            <div class="chat-info">
                <h3 style="font-size: 15px; font-weight: 600;">
                    ${safeName} ${isYou ? '<span style="color: var(--primary-light); font-size: 12px;">(You)</span>' : ''}
                </h3>
                <p style="font-size: 12px; color: var(--success);">● Online</p>
            </div>
        `;
        userList.appendChild(div);
    });
});

// --- Search filter ---
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const items = userList.querySelectorAll('.chat-item');
    items.forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
});

// ============================
//  CONNECTION STATUS
// ============================

socket.on('connect', () => {
    console.log('✅ Connected to server');
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
});

socket.on('connect_error', () => {
    console.log('⚠️ Connection failed - is the server running?');
});