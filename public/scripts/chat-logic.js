const socket = io('/');
const ext = JSON.parse(localStorage.getItem('ext'));
const { type, room, chats, extusers, user } = ext;

class ChatHandler {
    static loadId;
    static chatId;
    static input = document.querySelector('.input-field');
    static initialize() {
        if (type) {
            if (type === 'room') {
                ChatHandler.loadId = room._id;
                ChatHandler.chatId = chats._id;
            } else if (type === 'DM') {
                const chat = extusers.chats.find(chat => chat.user_id === user._id);
                if (chat) {
                    ChatHandler.loadId = chat.chat_id;
                }
            }
            if (ChatHandler.loadId) {
                socket.emit('joinRoom', { _id: ChatHandler.loadId, chatLoad: ChatHandler.chatId });
            } else {
                ChatHandler.popToast('error', 'Failed to connect to the room');
                console.log('User not found in the chats array.');
            }
        }
        socket.on('messageCreate', ChatHandler.handleMessageCreate);
        socket.on('messageDelete', ChatHandler.handleMessageDelete);
        document.addEventListener('keydown', ChatHandler.handleKeyDown);
    }

    static handleMessageCreate(message) {
        MessageHandler.fillMessage(
            message.author.displayname,
            message.author.image,
            message.content.text,
            message.attachments,
            message.content.timestamp,
            message.author.id
        );
    }
    static handleMessageDelete(obj) {
        document.querySelector(`#${obj.id}`)?.remove();
    }
    static async sendMessage() {
        let contents = ChatHandler.input.value.trim();
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
        ChatHandler.input.value = '';
        // clearMediaFeedback();
    }

    static deleteMessage(id) {
        socket.emit('delete', { id: id, by: user._id });
    }
    static handleKeyDown(e) {
        ChatHandler.input.focus();
        if (e.key === 'Enter' && !e.shiftKey) {
            if (!ChatHandler.input.value) return;
            e.preventDefault();
            ChatHandler.sendMessage();
        }
    }
}