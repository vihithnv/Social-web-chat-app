function redirect_chats(){
    window.location="http://localhost:3000/chats";
}
document.getElementById("chats_btn").addEventListener("click",redirect_chats,false);