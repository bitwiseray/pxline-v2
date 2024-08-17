class HandleUI {
    static setNavIconImage(url) {
        const navIcon = document.querySelector('.nav-icon');
        if (navIcon) {
            navIcon.src = url;
        } else {
            console.error('Nav icon element not found.');
        }
    }
    static appendChatTile(id, profileImageUrl, name, message, time) {
        const chatList = document.querySelector('.chat-list');
        if (chatList) {
            const chatItem = document.createElement('div');
            chatItem.classList.add('chat-item');
            chatItem.id = id;
            const chatPic = document.createElement('img');
            chatPic.src = profileImageUrl;
            chatPic.alt = 'Profile';
            chatPic.classList.add('chat-pic');
            const chatInfo = document.createElement('div');
            chatInfo.classList.add('chat-info');
            const chatName = document.createElement('div');
            chatName.classList.add('chat-name');
            chatName.innerHTML = `<span>${name}</span><span class="chat-time">${time}</span>`;
            const chatMessage = document.createElement('div');
            chatMessage.classList.add('chat-message');
            chatMessage.textContent = message;
            chatInfo.appendChild(chatName);
            chatInfo.appendChild(chatMessage);
            chatItem.appendChild(chatPic);
            chatItem.appendChild(chatInfo);
            chatList.appendChild(chatItem);
        } else {
            console.error('.chat-list element not found.');
        }
    }
    static createHeader(title, status, imageSrc = "img.jpg") {
        const chatHeader = document.querySelector('.chat-header');
        const profilePic = chatHeader.querySelector('.profile-pic');
        profilePic.src = imageSrc;
        const username = chatHeader.querySelector('.user-details .username');
        username.textContent = title;
        const lastSeen = chatHeader.querySelector('.user-details .last-seen');
        lastSeen.textContent = status;
        if (status.toLowerCase() === 'online') {
            lastSeen.classList.add('online');
        } else {
            lastSeen.classList.remove('online');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/source/indexes', {
        method: 'GET'
    });
    if (response.ok) {
        const data = await response.json();
        const { extrooms, extusers, user, friends, lastMessages } = data;
        HandleUI.setNavIconImage(user.image);
        if (extrooms.length >= 1) {
            extrooms.forEach((context) => {
                const last = lastMessages.find(chat => chat.lastFor === context.chats.chat_id);
                const content = !last.sender ? 'Start chat' : `${last.sender === user.display_name ? 'You' : last.sender}: ${last.content}`;
                HandleUI.appendChatTile(context.forLast, context.icon, context.title, content, timeAgo(last.createdAt));
            });
        }
        console.log(extusers)
        if (extusers.length >= 1) {
            extusers.forEach((context) => {
                context.chats.forEach((chat) => {
                    const last = lastMessages.find(message => message.lastFor === chat.chat_id);
                    const content = !last?.sender ? 'Start chat' : `${last.sender === user.display_name ? 'You' : last.sender}: ${last.content}`;
                    HandleUI.appendChatTile(chat.chat_id, context.image, context.display_name, content, last ? timeAgo(last.createdAt) : '');
                });
            });
        }
    }
});
