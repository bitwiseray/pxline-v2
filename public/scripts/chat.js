const socket = io('/');

socket.on('chat-message', message => {
  appendMessage(message.sender.image, message.sender.display_name, message.message);
});

let input = document.getElementById('inp');
document.querySelector('.send').addEventListener('click', (e) => {
  let contents = input.value;
  socket.emit('message', {
    message: contents,
    sender: {
      display_name: user.display_name,
      user_name: user.user_name,
      image: user.image,
    },
    attachments: null,
  });
  appendMessage(user.image, user.display_name, contents);
  input.value = '';
});