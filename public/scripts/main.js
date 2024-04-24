// nav 
const linkItems = document.querySelectorAll(".link-item");
linkItems.forEach((linkItem, index) => {
    linkItem.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        linkItem.classList.add("active");
    })
})

const parent = document.querySelector('.toast-container');
function popToast(type) {
  let toast = document.createElement('div');
  toast.classList.add('toast');
  toast.innerHTML = type === 'error' ? '<i class="fa-regular fa-circle-xmark error"></i> Something went wrong' : `<i class="fa-regular fa-circle-check"></i> Success!`;
  parent.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}