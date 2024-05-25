function createChatHeader(title, icon) {
  const parentContainer = document.querySelector('.chat-header');
  const h3 = parentContainer.querySelector('h3');
  const img = parentContainer.querySelector('img');
  h3.textContent = title;
  img.src = `${window.origin}/cdn/${icon}`;
}

function appendMessage(url, sender_username, drUsername, message, rawLowerSub, attachments, id) {
  const messageContainer = document.querySelector('.message-container');
  const messageDiv = document.createElement('div');
  const profilePicImg = document.createElement('img');
  const messageContentDiv = document.createElement('div');
  const senderDiv = document.createElement('div');
  const messageTextDiv = document.createElement('div');
  messageDiv.classList.add('message');
  profilePicImg.classList.add('profile_pic');
  profilePicImg.src = `${window.origin}/cdn/${url}`;
  senderDiv.classList.add('sender');
  let atag = document.createElement('a');
  atag.href = `/${drUsername}`;
  atag.appendChild(profilePicImg);
  senderDiv.innerHTML = `<a href='/${drUsername}' target='_blank'>${sender_username}</a> <span style="color: #aaa; font-size: 0.9em;">·&nbsp;${setTimes(null, rawLowerSub)}</span>`;
  messageTextDiv.classList.add('msg');
  messageTextDiv.textContent = message;
  messageContentDiv.classList.add('message_content');
  if (shouldDisplayTimeDivider(JSON.parse(localStorage.getItem('lastDivider')), rawLowerSub)) {
    const superTime = document.createElement('div');
    superTime.classList.add('time');
    superTime.innerText = formatTimestamp(rawLowerSub, false);
    messageContainer.appendChild(superTime);
  }
  messageContentDiv.appendChild(senderDiv);
  messageContentDiv.appendChild(messageTextDiv);
  messageDiv.appendChild(profilePicImg);
  if (attachments) {
    const imgEl = document.createElement('img');
    imgEl.classList.add('img-attachment');
    imgEl.src = `${window.origin}/cdn/${attachments}`;
    messageContentDiv.appendChild(imgEl);
  }
  messageDiv.appendChild(messageContentDiv);
  messageDiv.setAttribute('data-id', id);
  messageContainer.appendChild(messageDiv);
  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}

function appendTyping(url, sender_username) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  const profilePic = document.createElement('img');
  profilePic.classList.add('profile_pic');
  profilePic.src = `${window.origin}/cdn/${url}`;
  profilePic.alt = `${sender_username}'s profile picture`;
  const messageContentDiv = document.createElement('div');
  messageContentDiv.classList.add('message_content');
  const senderDiv = document.createElement('div');
  senderDiv.classList.add('sender');
  senderDiv.textContent = sender_username;
  const typingAssetImg = document.createElement('img');
  typingAssetImg.src = '/assets/typing.gif';
  typingAssetImg.classList.add('typing-asset');
  messageContentDiv.appendChild(senderDiv);
  messageContentDiv.appendChild(typingAssetImg);
  messageDiv.appendChild(profilePic);
  messageDiv.appendChild(messageContentDiv);
  const parentDiv = document.querySelector('.message-container');
  parentDiv.appendChild(messageDiv);
  return messageDiv;
}

function appendMediaFeedback(url) {
  const div = document.querySelector('.local-upload');
  const textarea = document.querySelector('#inp');
  textarea.style.marginTop = '50px';
  div.style.display = 'flex';
  div.querySelector('img').src = url;
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

function extractDateFromTimestamp(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toISOString().split('T')[0];
}

function shouldDisplayTimeDivider(lastTimestamp, currentTimestamp) {
  const lastDate = extractDateFromTimestamp(lastTimestamp);
  const currentDate = extractDateFromTimestamp(currentTimestamp);
  return lastDate !== currentDate;
}

const textarea = document.getElementById('inp');
textarea?.addEventListener('input', () => {
  textarea.style.height = '';
  const scrollHeight = textarea.scrollHeight;
  const maxHeight = 90;
  if (scrollHeight > maxHeight) {
    textarea.parentElement.style.borderRadius = '20px'
    textarea.style.height = `${maxHeight}px`;
  } else {
    textarea.parentElement.style.borderRadius = `30px`
    textarea.style.height = `${scrollHeight}px`;
  }
});


let file;
async function setChat() {
  const uploadIcon = document.getElementById('fileAddI');
  const uploadInput = document.getElementById('attachmentInput');
  let optRed = document.getElementById('redirectOpt');
  let optLeave = document.getElementById('leaveOpt');
  if (JSON.parse(localStorage.getItem('ext')).type === 'DM') {
    optRed.innerHTML = '<i class="material-symbols-outlined">person</i> See profile'
    optRed.href = `/${JSON.parse(localStorage.getItem('ext')).extusers.user_name}`;
    optLeave.innerHTML = '<i class="material-symbols-outlined">block</i> Block'
  } else {
    optRed.innerHTML = '<i class="material-symbols-outlined">group</i> Group info';
    optLeave.innerHTML = '<i class="material-symbols-outlined">exit_to_app</i> Leave';
    optRed.href = `/${new URLSearchParams(window.location.search).get('id')}`;
  }
  optLeave.addEventListener('click', async (e) => {
    if (type === 'room') {
      try {
        const response = await fetch(`/leave/${new URLSearchParams(window.location.search).get('id')}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          popToast('success', 'Successfully left the room');
          window.location.href = '/';
        } else {
          popToast('error', response.statusText);
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    }
  });
  uploadIcon.addEventListener('click', () => uploadInput.click());
  uploadInput.addEventListener('change', async (e) => {
    file = e.target.files[0];
    mediaCache = appendMediaFeedback(URL.createObjectURL(file));
  });
}

function clearMediaFeedback() {
  const div = document.querySelector('.local-upload');
  const textarea = document.querySelector('#inp');
  textarea.style.marginTop = 0;
  div.style.display = 'none';
  file = null;
}

async function uploadMedia() {
  const formData = new FormData();
  mediaCache = appendMediaFeedback(URL.createObjectURL(file));
  formData.append('upload', file);
  try {
    const response = await fetch('/cdn', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return { status: 'done', data: data };
  } catch (error) {
    return { status: 'failed' };
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
