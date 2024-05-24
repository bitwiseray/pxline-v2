class MessageHandler {
    constructor() {
        this.message = null;
        this.pressTimer = null;
        this.messageId = null;
        this.init();
    }
    init() {
        const messageContainer = document.querySelector('.message-container');
        messageContainer.addEventListener('touchstart', this.handlePress.bind(this), false);
        messageContainer.addEventListener('touchend', this.cancelPress.bind(this), false);
        messageContainer.addEventListener('contextmenu', this.handleContextMenu.bind(this), false);
    }
    handlePress(event) {
        let target = event.target;
        while (target != event.currentTarget) {
            if (target.classList.contains('message')) {
                const dataId = target.getAttribute('data-id');
                this.pressTimer = window.setTimeout(() => {
                    this.fireFunction(dataId);
                    this.messageId = dataId;
                }, 500);
                return;
            }
            target = target.parentNode;
        }
    }
    cancelPress() {
        clearTimeout(this.pressTimer);
    }
    handleContextMenu(event) {
        let target = event.target;
        while (target != event.currentTarget) {
            if (target.classList.contains('message')) {
                event.preventDefault();
                const dataId = target.getAttribute('data-id');
                this.fireFunction(dataId);
                return;
            }
            target = target.parentNode;
        }
    }
    fireFunction(dataId) {
        document.querySelector('.imgcontent').style.display = 'none';
        document.querySelector('.menu-container').style.display = 'none';
        let parentDiv = document.querySelector('.message-options').style.display = 'flex';
        this.message = document.querySelector(`div[data-id="${dataId}"]`);
        if (this.message.querySelector('.sender')?.textContent == user.display_name) {
            parentDiv.querySelector('.delete-icon').style.display = 'none';
            parentDiv.querySelector('.edit-icon').style.display = 'none';
        }
    }
    removeOptions() {
        document.querySelector('.imgcontent').style.display = 'flex';
        document.querySelector('.menu-container').style.display = 'block';
        document.querySelector('.message-options').style.display = 'none';
    }
    async copyText() {
        let toast = document.createElement('div');
        const parent = document.querySelector('.toast-container');
        toast.classList.add('toast');
        parent.appendChild(toast);
        try {
            const msgDiv = this.message ? this.message.querySelector('.msg') : null;
            const messageContent = msgDiv ? msgDiv.textContent : '';
            await navigator.clipboard.writeText(messageContent);
            toast.innerHTML = '<i class="material-symbols-outlined">check_circle</i> Success!';
        } catch (error) {
            toast.innerHTML = '<i class="material-symbols-outlined">cancel</i> Failed to copy, check permissions';
        }
        setTimeout(() => {
            toast.remove();
        }, 3500);
    }
    delete() {
        deleteMessage(this.messageId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const messageHandler = new MessageHandler();
    window.messageHandler = messageHandler;
});
