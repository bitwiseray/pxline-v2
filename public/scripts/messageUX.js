class MessageHandler {
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
        }
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.innerHTML = `<p>${content}</p><span class="timestamp">${formatTimestamp(timestamp)}</span>`;
        messageDiv.appendChild(messageBubble);
        chatContent.appendChild(messageDiv);
        messageDiv.offsetHeight;
        messageDiv.classList.add('animate');
        let firstTime;
        if (firstTime) {
            container.scrollTop = container.scrollHeight;
            firstTime = false;
        } else if (container.scrollTop + container.clientHeight === container.scrollHeight) {
            container.scrollTop = container.scrollHeight;
        }
    }
}