function createChatHeader(title, icon) {
      const parentContainer = document.querySelector('.chat-header');
      const h3 = parentContainer.querySelector('h3');
      const img = parentContainer.querySelector('img');
      h3.textContent = title;
      img.src = icon;
    }

function appendMessage(url, sender_username, message) {
      const messageContainer = document.querySelector('.message-container');
      const messageDiv = document.createElement('div');
      const profilePicImg = document.createElement('img');
      const messageContentDiv = document.createElement('div');
      const senderDiv = document.createElement('div');
      const messageTextDiv = document.createElement('div');
      messageDiv.classList.add('message');
      profilePicImg.classList.add('profile_pic');
      profilePicImg.src = url;
      senderDiv.classList.add('sender');
      senderDiv.textContent = sender_username;
      messageTextDiv.classList.add('msg');
      messageTextDiv.textContent = message;
      messageContentDiv.appendChild(senderDiv);
      messageContentDiv.appendChild(messageTextDiv);
      messageDiv.appendChild(profilePicImg);
      messageDiv.appendChild(messageContentDiv);
      messageContainer.appendChild(messageDiv);
}
