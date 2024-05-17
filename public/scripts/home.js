function createChatTile(entity, user) {
    if (!entity || !entity.chats) return;
    const chatBlock = document.createElement('div');
    chatBlock.classList.add('block', 'open');
    const imgBox = document.createElement('div');
    imgBox.classList.add('imgbx');
    const img = document.createElement('img');
    const nameElement = document.createElement('h4');
    if (entity.icon) {
        img.src = `${window.location.origin}/cdn/${entity.icon}`;
        imgBox.appendChild(img);
        nameElement.textContent = entity.title;
    } else if (entity.image) {
        img.src = `${window.location.origin}/cdn/${entity.image}`;
        imgBox.appendChild(img);
        nameElement.textContent = entity.display_name;
    }
    chatBlock.appendChild(imgBox);
    const details = document.createElement('div');
    const last = getLastFor(entity.chats.chat_id);
    details.classList.add('details');
    const listHead = document.createElement('div');
    listHead.classList.add('listHead');
    const timeElement = document.createElement('p');
    timeElement.classList.add('time');
    timeElement.textContent = formatTimestamp(last.createdAt || '1714548258854', true);
    listHead.appendChild(nameElement);
    listHead.appendChild(timeElement);
    details.appendChild(listHead);
    const messageP = document.createElement('div');
    messageP.classList.add('message_p');
    const messageElement = document.createElement('p');
    messageElement.textContent = `${last.sender === user.display_name ? 'You' : last.sender}: ${last.content}`;
    /*
    const unreadCountElement = document.createElement('b');
    unreadCountElement.textContent = 2;
    */
    messageP.appendChild(messageElement);
    // messageP.appendChild(unreadCountElement);
    details.appendChild(messageP);
    chatBlock.appendChild(details);
    const chatList = document.querySelector('.chatlist');
    chatBlock.setAttribute('data-id', entity._id);
    chatList.appendChild(chatBlock);
}

function createFriendTile(entity) {
    if (!entity) return;
    friendBlock.setAttribute('data-id', entity._id);
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
