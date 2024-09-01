class HandleUI {
    static setNavIconImage(url, id) {
        const navIcon = document.querySelector('.nav-icon');
        if (navIcon) {
            navIcon.src = url;
            navIcon.id = id;
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
    static createHeader(title, imageSrc) {
        const chatHeader = document.querySelector('.chat-header');
        const profilePic = chatHeader.querySelector('.profile-pic');
        profilePic.src = imageSrc;
        const username = chatHeader.querySelector('.user-details .username');
        username.textContent = title;
    }
    static subLine(contents, status) {
        const lastSeen = document.querySelector('.chat-header').querySelector('.user-details .last-seen');
        if (status = 'ONLINE') {
            lastSeen.classList.add('online');
            lastSeen.textContent = contents;
        } else if (status = 'ERROR') {
            lastSeen.classList.add('error');
            lastSeen.textContent = contents;
        }
    }
    static bucketFill(chats, members, user, type) {
        const myId = document.querySelector('.nav-icon').id;
        const chatContent = document.querySelector('.chat-content');
        if (chatContent) {
            chats.forEach((chat) => {
                const { content, sender, attachments } = chat;
                const isMe = sender === myId;
                const messageDiv = document.createElement('div');
                const messageBubble = document.createElement('div');
                messageBubble.classList.add('message-bubble');
                messageDiv.classList.add('message');
                messageDiv.id = chat._id;
                let senderUser;
                if (type === 'room') {
                    senderUser = chat.sender === user._id ? user : members.find(member => member._id === chat.sender);
                } else {
                    senderUser = chat.sender === user._id ? user : members;
                }
                if (isMe) {
                    messageDiv.classList.add('me');
                } else {
                    const profilePic = document.createElement('img');
                    profilePic.src = senderUser.image;
                    profilePic.alt = `${senderUser.display_name}'s profile picture`;
                    profilePic.classList.add('message-pic');
                    messageDiv.appendChild(profilePic);
                }
                const messageText = document.createElement('p');
                messageText.textContent = content.text;
                messageBubble.appendChild(messageText);
                if (attachments) {
                    const attachImg = document.createElement('img');
                    attachImg.src = attachments;
                    attachImg.classList.add('message-image');
                    messageBubble.appendChild(attachImg);
                }
                const timestampSpan = document.createElement('span');
                timestampSpan.classList.add('timestamp');
                timestampSpan.textContent = formatTimestamp(content.timestamp);
                messageBubble.appendChild(timestampSpan);
                messageDiv.appendChild(messageBubble);
                chatContent.appendChild(messageDiv);
                chatContent.scrollTop = chatContent.scrollHeight;
            });
        } else {
            console.error('.chat-content element not found.');
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
        HandleUI.setNavIconImage(user.image, user._id);
        IndexCatcher.handleChatTiles(user, lastMessages, extrooms, extusers);
        const chatId = new URLSearchParams(window.location.search).get('id');
        if (!chatId) {
            const firstKey = Array.from(addedChats)[0];
            if (firstKey) {
                window.location.href = `/chat?id=${firstKey}`;
            }
        } else {
            const chatResponse = await fetch(`/source/chat/${chatId}`);
            if (chatResponse.ok) {
                const chatData = await chatResponse.json();
                const { chats, extusers, room, type, user } = chatData;
                if (type === 'room') {
                    HandleUI.createHeader(room.title, 'Room', room.icon, 'room');
                    HandleUI.bucketFill(chats.svd_chats, extusers, user, 'room');
                    document.title = `Pxline - ${room.title}`;
                } else {
                    HandleUI.createHeader(extusers.display_name, 'Hi', extusers.image, 'user');
                    HandleUI.bucketFill(chats.svd_chats, extusers, user, 'user');
                    document.title = `Pxline - ${extusers.display_name}`;
                }
              localStorage.setItem('ext', JSON.stringify(chatData));
              ChatHandler.initialize();
            }
        }
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.id;
                window.location.href = `/chat?id=${chatId}`;
            });
        });
    }
    unloader(false);
});

