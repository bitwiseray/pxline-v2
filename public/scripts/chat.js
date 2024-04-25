const socket = io('/');

socket.on('chat-message', message => {
  appendMessage(message.author.image, message.author.displayname, message.content);
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
      chat_id: room.chats.chat_id || null,
     }
    } else {
      return {
        id: extuser._id,
        name: extuser.displayname,
        image: extuser.image,
        members: null,
        chat_id: extuser.chats.chat_id || null,
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
  });
  appendMessage(user.image, user.display_name, contents, Date.now());
  input.value = '';
});