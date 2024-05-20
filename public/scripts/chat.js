const socket = io('/');

let roomId;
if (type === 'room' || type === 'DM') {
  if (type === 'room') {
    roomId = room._id;
  } else {
    for (const chat of extuser.chats) {
      if (chat.user_id === user._id) {
        roomId = chat.chat_id;
        break;
      }
    }
  }
  if (roomId) {
    socket.emit('joinRoom', { _id: roomId });
  } else {
    popToast('error', 'Failed to connect to the room');
    console.log('User not found in the chats array.');
  }
}

let typingEl;
socket.on('typing', (payload, cb) => {
  const { image, displayname } = payload;
  typingEl = appendTyping(image, displayname);
});

socket.on('messageCreate', (message) => {
  if (typingEl) typingEl.remove();
  appendMessage(message.author.image, message.author.displayname, message.author.username, message.content.text, message.content.timestamp, message.attachments);
});

let input = document.getElementById('inp');
function sendMessage() {
  let contents = input.value;
  let attachments = isAttached;
  if (!contents && attachments) contents = '';
  if (contents.trim() === '') return;
  let offExport = () => {
    if (type === 'room') {
      return {
        id: room._id,
        name: room.title,
        image: room.icon,
        members: room.members,
        chat_id: room.chats.chat_id || 'Not found',
      }
    } else {
      return {
        id: extuser._id,
        name: extuser.displayname,
        image: extuser.image,
        members: null,
        chat_id: roomId || 'Not found',
      }
    }
  }
  socket.emit('message', {
    content: { text: contents, timestamp: Date.now() },
    author: {
      id: user._id,
      displayname: user.display_name,
      username: user.user_name,
      image: user.image,
    },
    chat: offExport(),
    attachments: attachments ? attachments.id : null,
  });
  input.value = '';
  isAttached = {};
}

document.querySelector('.send').addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  } 
});

document.querySelector('#inp').addEventListener('input', (e) => {
  socket.emit('messageTyping', { displayname: user.display_name, image: user.image });
}, { once: true });