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
    let offsetForLast;
    if (Array.isArray(entity.chats)) {
        offsetForLast = entity.chats.find(thisObj => thisObj.user_id === user);
    } else {
        offsetForLast = entity.chats;
    }
    const last = JSON.parse(localStorage.getItem('lastMessages')).find(chat => chat.lastFor == offsetForLast.chat_id) || {};;
    details.classList.add('details');
    const listHead = document.createElement('div');
    listHead.classList.add('listHead');
    const timeElement = document.createElement('p');
    timeElement.classList.add('time');
    timeElement.textContent = formatTimestamp(last.createdAt, true);
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

function initTiles(rooms, users, user) {
    rooms.forEach(room => {
        createChatTile(room, user);
    });
    users.forEach(currentUser => {
        createChatTile(currentUser, user._id);
    });
}

function appendFriend(name, username, url, id) {
    const friendDiv = document.createElement('div');
    friendDiv.className = 'friend';
    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    friendDiv.appendChild(img);
    const nameAnchor = document.createElement('a');
    nameAnchor.href = `/${username}`;
    nameAnchor.className = 'name';
    nameAnchor.textContent = name;
    friendDiv.appendChild(nameAnchor);
    const iconAnchor = document.createElement('a');
    iconAnchor.href = `/chat?id=${id}`;
    const icon = document.createElement('i');
    icon.className = 'material-symbols-outlined';
    icon.textContent = 'forum';
    iconAnchor.appendChild(icon);
    friendDiv.appendChild(iconAnchor);
    const container = document.querySelector('.friends-container');
    container.appendChild(friendDiv);
}
