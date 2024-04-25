function createChatHeader(title, icon) {
  const parentContainer = document.querySelector('.chat-header');
  const h3 = parentContainer.querySelector('h3');
  const img = parentContainer.querySelector('img');
  h3.textContent = title;
  img.src = icon;
}

function appendMessage(url, sender_username, message, rawLowerSub) {
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
  senderDiv.textContent = `${sender_username} <span class="timestamp">·&nbsp;${setTimes(null, rawLowerSub)}</span>`;
  messageTextDiv.classList.add('msg');
  messageTextDiv.textContent = message;
  messageContentDiv.appendChild(senderDiv);
  messageContentDiv.appendChild(messageTextDiv);
  messageDiv.appendChild(profilePicImg);
  messageDiv.appendChild(messageContentDiv);
  messageContainer.appendChild(messageDiv);
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}

function setTimes(superSub, lowerSub) {
  if (superSub) {
    const time = document.createElement('div');
    time.classList.add('time');
    time.innerText = formatTime(superSub, false);
  } else {
    return formatTimestamp(lowerSub, true)
  }
}

function formatTimestamp(timestamp, compact) {
    if (!compact) {
      const now = moment();
      const date = moment(timestamp);
      if (now.isSame(date, 'day')) {
        return `Today at ${date.format('h:mm A')}`;
      } else if (now.subtract(1, 'days').isSame(date, 'day')) {
        return `Yesterday at ${date.format('h:mm A')}`;
      } else {
        return date.format('MMMM D, YYYY');
      }
    } else {
      return moment(timestamp).format('h:mm A');
    }
}

/*
if (container) {
  container.addEventListener('scroll', function() {
    if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
      // Load more messages when the user scrolls to the bottom
      // You can implement your own logic here to load more messages
    }
  });
}
*/