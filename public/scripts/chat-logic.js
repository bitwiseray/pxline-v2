const socket = io('/');
const ext = JSON.parse(localStorage.getItem('ext'));
const { type, room, chats, extusers, user } = ext;

let loadId, chatId;
if (type) {
  if (type === 'room') {
    loadId = room._id;
    chatId = chats._id;
  } else if (type === 'DM') {
    const chat = extusers.chats.find(chat => chat.user_id === user._id);
    if (chat) {
      loadId = chat.chat_id;
      console.log('DM')
    }
  }
  if (roomId) {
    socket.emit('joinRoom', { _id: loadId, chatLoad: chatId });
 } else {
    popToast('error', 'Failed to connect to the room');
    console.log('User not found in the chats array.');
 }
}
console.log(loadId);

socket.on('messageCreate', (message) => {
  MessageHandler.fillMessage(message.author.displayname, message.author.image, message.content.text, message.attachments, message.content.timestamp);
});

socket.on('messageDelete', (obj) => {
  document.querySelector(`#${obj.id}`)?.remove();
});

async function sendMessage() {
  let contents = input.value.trim();
  // let attachments = file;
  let url = '';
  // if (attachments) {
  //   url = await uploadMedia(attachments);
  // }
  if (!contents && !attachments) return;
  let chatDetails;
  if (type === 'room') {
    chatDetails = {
      id: room._id,
      name: room.title,
      image: room.icon,
      members: room.members,
      chat_id: room.chats.chat_id || 'Not found',
    };
  } else {
    chatDetails = {
      id: extusers._id,
      name: extusers.display_name,
      image: extusers.image,
      members: null,
      chat_id: roomId || 'Not found',
    };
  }
  socket.emit('message', {
    content: { text: contents, timestamp: Date.now() },
    author: {
      id: user._id,
      displayname: user.display_name,
      username: user.user_name,
      image: user.image,
    },
    room: chatDetails,
    attachments: url?.data?.url || null,
  });
  input.value = '';
  clearMediaFeedback();
}

function deleteMessage(id) {
  socket.emit('delete', { id: id, by: user._id });
}

// document.querySelector('.send').addEventListener('click', sendMessage);
let input = document.querySelector('.input-field');
document.addEventListener('keydown', (e) => {
  input.focus();
  if (e.key === 'Enter' && !e.shiftKey) {
    if (!input.value) return;
    e.preventDefault();
    sendMessage();
  } 
});