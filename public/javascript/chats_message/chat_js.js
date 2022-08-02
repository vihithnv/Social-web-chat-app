function post_chat_server(){
    const mess_val=document.getElementById("chat_text").value;
    let send=document.getElementById("send").getAttribute("value");
    let recv=document.getElementById("recv").getAttribute("value");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://social-new-ind.herokuapp.com/chat_receive");
    xhr.onload = function() {
        let resp=xhr.response;
        let arr=resp.split("time=");
       if(arr[0]==="status='got_it'&"){
        const chat_div=document.createElement("div");
        chat_div.innerHTML='<div style="text-align: right;"><div class="chat_recv"><span style="font-size: x-small;">'+arr[1]+'</span><br>'+mess_val+'</div></div>';
        document.getElementById("chats_cont").appendChild(chat_div);
        document.getElementById("chat_text").value="";
        document.getElementById("chats_cont").scrollTop=document.getElementById("chats_cont").scrollHeight;
       } 
       else{
        window.alert("message not sent try later");
       }
    };
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("text="+mess_val+"&from="+send+"&to="+recv); 
}

function render_new_messages(objs){
    if(objs.length!==0){
    let new_head=document.createElement("div");
    new_head.innerHTML='<br><div class="prof_ ext"><div class="prof_name">- New Message -</div></div>';
    document.getElementById("chats_cont").appendChild(new_head);
    for(let i=0;i<objs.length;i++){
        let chat_div=document.createElement("div");
        chat_div.innerHTML='<div style="text-align: left;"><div class="chat_send"><span style="font-size: x-small;">'+objs[i].time+'</span><br>'+objs[i].text_message+'</div></div>';
        document.getElementById("chats_cont").appendChild(chat_div);
    }
    document.getElementById("chats_cont").scrollTop=document.getElementById("chats_cont").scrollHeight;}
}

function get_new_mesages(){
    let send=document.getElementById("send").getAttribute("value");
    let recv=document.getElementById("recv").getAttribute("value");
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://social-new-ind.herokuapp.com/buff_messages");
    xhr.onload = function() {
        if(xhr.response!=="no-data"){
            let arr1=xhr.response.split("<brk>");
            let obj_arr=[];
            for(let i=0;i<arr1.length;i++){
                obj_arr.push(JSON.parse(arr1[i]));
            }
            render_new_messages(obj_arr);
        }
    };
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("send="+send+"&recv="+recv); 
}

function add_user_to_list(usn){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://social-new-ind.herokuapp.com/add_friend?"+"send="+document.getElementById("send").getAttribute("value")+"&user="+usn);
    xhr.onload = function() {
        if(xhr.response==="added-user"){
            document.getElementById("s_rslts_tile_add_"+usn).classList.add("added_srch_user");
            document.getElementById("s_rslts_tile_add_"+usn).innerHTML="Added";
            document.getElementById("s_rslts_tile_add_"+usn).disabled="true";
        }
    };
    xhr.send(); 
}

function ren_srch_user_rslts(arr){
    let cont=document.getElementById("rslts_cont");
    cont.innerHTML="";
    for(let i=0;i<arr.length;i++){
        let new_tile=document.createElement("div");
        new_tile.classList.add("search_tile");
        new_tile.innerHTML='<div class="img_name"><div style="font-weight: 900;">'+arr[i]+'</div></div><div><button class="search_add_btn" name="'+arr[i]+'"'+'id="s_rslts_tile_add_'+arr[i]+'">Add</button></div>';
        cont.appendChild(new_tile);
    }
    let s_tls=document.getElementsByClassName("search_add_btn");
    for(let i=0;i<s_tls.length;i++){
        s_tls[i].addEventListener("click",function(){
            add_user_to_list(s_tls[i].getAttribute("name"));
        },false);
    }
}

document.getElementById("search_person_btn").addEventListener("click",get_search_user,false);
document.getElementById("search_person").addEventListener("keydown",get_search_user,false);
function get_search_user(){
    let xhr = new XMLHttpRequest();
    let pattern=document.getElementById("search_person").value;
    xhr.open("GET", "https://social-new-ind.herokuapp.com/search_user?send="+document.getElementById("send").getAttribute("value")+"&person="+pattern);
    xhr.onload = function() {
        if(xhr.response!=="no-data"){
            let arr=xhr.response.split("<brk>");
            ren_srch_user_rslts(arr);
        }
        else{
            document.getElementById("rslts_cont").innerHTML="";
        }
    };
    xhr.send(); 
}








const get_int= setInterval(get_new_mesages,5000);



function add_conts_events(){
    document.getElementById("chats_cont").scrollTop=document.getElementById("chats_cont").scrollHeight;
    let tls= document.getElementsByClassName("tile");
    let sender=document.getElementById("send").getAttribute("value");
    let recv=document.getElementById("recv").getAttribute("value");
    if(recv!=="none"){
        document.getElementById(""+recv).style.backgroundColor= "#7eadd6";
    }
    for(let i=0;i<tls.length;i++){
        tls[i].addEventListener("click",()=>{
            window.location="https://social-new-ind.herokuapp.com/chats?send="+sender+"&recv="+tls[i].id;
        },false);
    }
    get_new_mesages();
}

document.getElementById("send_chat_").addEventListener("click",post_chat_server,false);
window.addEventListener("load",add_conts_events);
document.getElementById("chat_text").addEventListener("keypress",function(event){
    if (event.key === "Enter"){
        event.preventDefault();
        document.getElementById("send_chat_").click();
    }
},false);


document.getElementById("search_close_btn").addEventListener("click",function(){
    document.getElementById("search_main_").style.display="none";
    document.getElementById("rslts_cont").innerHTML="";
    document.getElementById("search_person").value="";

},false);

document.getElementById("search_open").addEventListener("click",function(){
    document.getElementById("search_main_").style.display="block";
},false);