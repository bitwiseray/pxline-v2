const socket = io('/');

let roomId;
let chatId;
if (JSON.parse(localStorage.getItem('ext')).type === 'room' || JSON.parse(localStorage.getItem('ext')).type === 'DM') {
  if (JSON.parse(localStorage.getItem('ext')).type === 'room') {
    roomId = JSON.parse(localStorage.getItem('ext')).room._id;
    chatId = JSON.parse(localStorage.getItem('ext')).chats._id
  } else {
    for (const chat of JSON.parse(localStorage.getItem('ext')).extusers.chats) {
      if (chat.user_id === JSON.parse(localStorage.getItem('ext')).user._id) {
        roomId = chat.chat_id;
        chatId = chat.chat_id;
        break;
      }
    }
  }
  if (roomId) {
    socket.emit('joinRoom', { _id: roomId, chatLoad: chatId });
  } else {
    popToast('error', 'Failed to connect to the room');
    console.log('User not found in the chats array.');
  }
}

let typingEl;
socket.on('typing', (payload) => {
  const { image, displayname } = payload;
  typingEl = appendTyping(image, displayname);
});

socket.on('messageCreate', (message) => {
  if (typingEl) typingEl.remove();
  appendMessage(message.author.image, message.author.displayname, message.author.username, message.content.text, message.content.timestamp, message.attachments);
});

socket.on('messageDelete', (obj) => {
  let message = document.querySelector(`div[data-id="${obj.id}"]`);
  message.remove();
});

let input = document.getElementById('inp');
async function sendMessage() {
  let contents = input.value;
  let attachments = file;
  let url = '';
  if (attachments) {
    url = await uploadMedia(attachments);
  }
  if (!contents && attachments) contents = '';
  if (contents.trim() === '') return;
  let offExport = () => {
    if (JSON.parse(localStorage.getItem('ext')).type === 'room') {
      return {
        id: JSON.parse(localStorage.getItem('ext')).room._id,
        name: JSON.parse(localStorage.getItem('ext')).room.title,
        image: JSON.parse(localStorage.getItem('ext')).room.icon,
        members: JSON.parse(localStorage.getItem('ext')).room.members,
        chat_id: JSON.parse(localStorage.getItem('ext')).room.chats.chat_id || 'Not found',
      }
    } else {
      return {
        id: JSON.parse(localStorage.getItem('ext')).extusers._id,
        name: JSON.parse(localStorage.getItem('ext')).extusers.display_name,
        image: JSON.parse(localStorage.getItem('ext')).extusers.image,
        members: null,
        chat_id: roomId || 'Not found',
      }
    }
  }
  socket.emit('message', {
    content: { text: contents, timestamp: Date.now() },
    author: {
      id: JSON.parse(localStorage.getItem('ext')).user._id,
      displayname: JSON.parse(localStorage.getItem('ext')).user.display_name,
      username: JSON.parse(localStorage.getItem('ext')).user.user_name,
      image: JSON.parse(localStorage.getItem('ext')).user.image,
    },
    chat: offExport(),
    attachments: url ? url.data.id : null,
  });
  input.value = '';
  url = {};
  clearMediaFeedback();
}

function deleteMessage(Id) {
  socket.emit('delete', { id: Id, deletedBy: JSON.parse(localStorage.getItem('ext')).user._id });
}

document.querySelector('.send').addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  } 
});

document.querySelector('#inp').addEventListener('input', (e) => {
  socket.emit('messageTyping', { displayname: JSON.parse(localStorage.getItem('ext')).user.display_name, image: JSON.parse(localStorage.getItem('ext')).user.image });
}, { once: true });