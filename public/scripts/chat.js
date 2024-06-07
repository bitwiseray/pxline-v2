const socket = io('/');
const ext = JSON.parse(localStorage.getItem('ext'));
const { type, room, chats, extusers, user } = ext;

let roomId, chatId;
if (type) {
   if (type === 'room') {
      roomId = room._id;
      chatId = chats._id;
   } else if (type === 'DM') {
      const chat = extusers.chats.find(chat => chat.user_id === user._id);
      if (chat) {
         roomId = chat.chat_id;
         chatId = chat.chat_id;
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
socket.on('typing', ({ image, displayname }) => {
  typingEl = appendTyping(image, displayname);
});

socket.on('messageCreate', (message) => {
  typingEl?.remove();
  appendMessage(message.author.image, message.author.displayname, message.author.username, message.content.text, message.content.timestamp, message.attachments);
});

socket.on('messageDelete', (obj) => {
  document.querySelector(`div[data-id="${obj.id}"]`)?.remove();
});

let input = document.getElementById('inp');
async function sendMessage() {
  let contents = input.value.trim();
  let attachments = file;
  let url = '';
  if (attachments) {
    url = await uploadMedia(attachments);
  }
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
    chat: chatDetails,
    attachments: url?.data?.id || null,
  });
  input.value = '';
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