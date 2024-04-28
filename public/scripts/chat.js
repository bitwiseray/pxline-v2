const socket = io('/');

let thisDMChat;
if (type === 'room' || type === 'DM') {
  let roomId;
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
    console.log('Joining room', roomId);
    socket.emit('joinRoom', { _id: roomId });
    console.log(`Joined ${type}: ${roomId}`);
  } else {
    console.log('User not found in the chats array.');
  }
}

let typingEl;
socket.on('messageTyping', (payload, cb) => {
  const { image, displayname } = payload;
  typingEl = appendTyping(image, displayname);
});

socket.on('messageAdd', (message, cb) => {
  typingEl.remove();
  appendMessage(message.author.image, message.author.displayname, message.content.text, message.content.timestamp);
  cb(`Message recived by ${message.author.displayname}`);
});

let input = document.getElementById('inp');
document.querySelector('.send').addEventListener('click', (e) => {
  let contents = input.value;
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
        chat_id: thisDMChat || 'Not found',
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
    attachments: null,
  }, (cb) => {
    console.log('For emit#message', cb);
  });
  input.value = '';
  // appendMessage(user.image, user.display_name, contents, Date.now());
});

document.querySelector('#inp').addEventListener('input', (e) => {
  socket.emit('messageTyping', { displayname: user.display_name, image: user.image });
}, { once: true });