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
    static createHeader(title, status, imageSrc) {
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

const addedChats = new Set();
class IndexCatcher {
    static handleChatTiles(user, lastMessages, extrooms, extusers) {
        if (extrooms.length >= 1) {
            extrooms.forEach((context) => {
                const last = lastMessages.find(chat => chat.lastFor === context.chats.chat_id);
                if (last?.sender && !addedChats.has(context.chats.chat_id)) {
                    const content = `${last.sender === user.display_name ? 'You' : last.sender}: ${last.content}`;
                    HandleUI.appendChatTile(context._id, context.icon, context.title, content, timeAgo(last.createdAt));
                    addedChats.add(context._id);
                }
            });
        }
        if (extusers.length >= 1) {
            extusers.forEach((context) => {
                context.chats.forEach((chat) => {
                    const last = lastMessages.find(message => message.lastFor === chat.chat_id);
                    if (last?.sender && !addedChats.has(chat.chat_id)) {
                        const content = `${last.sender === user.display_name ? 'You' : last.sender}: ${last.content}`;
                        HandleUI.appendChatTile(context._id, context.image, context.display_name, content, timeAgo(last.createdAt));
                        addedChats.add(chat._id);
                    }
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/source/indexes');
    if (response.ok) {
        const data = await response.json();
        const { extrooms, extusers, user, friends, lastMessages } = data;
        HandleUI.setNavIconImage(user.image);
        IndexCatcher.handleChatTiles(user, lastMessages, extrooms, extusers);
        const firstKey = Array.from(addedChats)[0];
        console.log(`firstKey === '661b9b08540c21c45b15f6f5'`)
        const chatResponse = await fetch(`/source/chat/${firstKey.toString()}`);
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          const { chats, extusers, room, type, user } = chatData;
          HandleUI.createHeader(room.title, 'Room', room.icon);
        }
    }
});
