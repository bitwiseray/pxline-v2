// nav 
const linkItems = document.querySelectorAll(".link-item");
linkItems.forEach((linkItem, index) => {
    linkItem.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        linkItem.classList.add("active");
    })
})

// Chat Back
let back = document.querySelector('.back');
let chatBox = document.querySelector('.chatBox');
let open = document.querySelector('.open')
/*
back.onclick = function()
{
    setTimeout(function(){
        chatBox.classList.add('hide');
    }, 400);
}
// Chat Open 
open.onclick = function()
{
    setTimeout(function(){
        chatBox.classList.remove('hide');
    }, 400);    
}
*/