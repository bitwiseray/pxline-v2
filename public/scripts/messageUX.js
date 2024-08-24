class MessageHandler {
    static firstTime = true;
    static fillMessage(senderName, image, content, attachment, timestamp, id) {
        const isMe = id === document.querySelector('.nav-icon').id;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (isMe) {
            messageDiv.classList.add('me');
        } else {
            const profilePic = document.createElement('img');
            profilePic.src = image;
            profilePic.alt = `${senderName}'s profile picture`;
            profilePic.classList.add('message-pic');
            messageDiv.appendChild(profilePic);
        }
        if (attachment) {
            const attachImg = document.createElement('img');
            attachImg.src = attachment;
            attachImg.classList.add('message-image');
            messageDiv.appendChild(attachImg);
        }
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.innerHTML = `<p>${content}</p><span class="timestamp">${formatTimestamp(timestamp)}</span>`;
        messageDiv.appendChild(messageBubble);
        messageDiv.classList.add('animate');
        let container = document.querySelector('.chat-content');
        container.appendChild(messageDiv);
        if (MessageHandler.firstTime || container.scrollTop + container.clientHeight === container.scrollHeight) {
            container.scrollTop = container.scrollHeight;
            MessageHandler.firstTime = false;
        }
    }
}
