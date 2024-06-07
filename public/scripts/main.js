// nav 
const linkItems = document.querySelectorAll(".link-item");
linkItems.forEach((linkItem, index) => {
    linkItem.addEventListener("click", () => {
      document.querySelector(".active").classList.remove("active");
      linkItem.classList.add("active");
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const menu = document.getElementById('menu');
  hamburgerMenu?.addEventListener('click', () => {
    if (menu.classList.contains('show')) {
      menu.classList.remove('show');
      setTimeout(() => {
        menu.style.display = 'none';
      }, 150);
    } else {
      menu.style.display = 'block';
      setTimeout(() => {
        menu.classList.add('show');
      }, 10);
    }
  });
});

function timeAgo(timestamp) {
  const createdAt = moment(timestamp);
  const now = moment();
  const diffYears = now.diff(createdAt, 'years');
  const diffMonths = now.diff(createdAt, 'months');
  const diffWeeks = Math.floor(now.diff(createdAt, 'weeks'));
  const diffDays = Math.floor(now.diff(createdAt, 'days'));
  let timeAgo;
  switch (true) {
    case diffYears > 0:
      timeAgo = `${diffYears}y`;
      break;
    case diffMonths > 0:
      timeAgo = `${diffMonths}m`;
      break;
    case diffWeeks > 0:
      timeAgo = `${diffWeeks}w`;
      break;
    case diffDays > 0:
      timeAgo = `${diffDays}d`;
      break;
    default:
      timeAgo = '0d';
  }
  return timeAgo;
}

const parent = document.querySelector('.toast-container');
function popToast(type, str) {
  let toast = document.createElement('div');
  toast.classList.add('toast');
  toast.innerHTML = type === 'error' ? `<i class="material-symbols-outlined error">cancel</i> ${str}` : `<i class="material-symbols-outlined">check_circle</i> Success!`;
  parent.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

if (messages) {
  if (messages.error) {
  popToast('error', messages.error);
  } else if (messages.success) {
  popToast(null);
  }
}