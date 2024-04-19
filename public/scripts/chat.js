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
     }
    } else {
      return {
        id: extuser._id,
        name: extuser.displayname,
        image: extuser.image,
        members: null
      }
    }
  }
  socket.emit('message', {
    content: contents,
    author: {
      displayname: user.display_name,
      username: user.user_name,
      image: user.image,
    },
    chat: offExport(),
    attachments: null,
  });
  appendMessage(user.image, user.display_name, contents);
  input.value = '';
});