const express=require("express");
const app=express();
const body_parse=require("body-parser");
const mongoose=require("mongoose");
const { response } = require("express");
const cookie_parser = require('cookie-parser');
// const { resolveInclude } = require("ejs");
mongoose.connect("mongodb+srv://vihith_mongodb:"+"Cse3002"+"%40"+"iwp2022"+"@cluster0.u8fjk.mongodb.net/Social_db",{ useNewUrlParser: true});
// app.use('view engine',"ejs");
app.use(cookie_parser());
app.get("/cookie",(req,resp)=>{
    resp.cookie("auth","y");
    resp.cookie("auth","n");
    resp.send("cookie added");   
});

app.get("/disp_cookie",(req,resp)=>{
    console.log(req.cookies);
});
const port=process.env.PORT || 3000;
app.listen(port);
app.use(express.static(__dirname+"/public"));
app.use(body_parse.urlencoded({extended: true}));

app.get("/",(req,resp)=>{
    resp.redirect("/login");
})
app.get("/login",(req,resp)=>{
    let cookie_got=req.cookies;
    if(cookie_got.auth==="y"){
        resp.redirect("/chats?send="+cookie_got.usn+"&recv=none");
    }
    else{
        resp.sendFile(__dirname+"/html_files/login.html");
    }
});

app.get("/logout",(req,resp)=>{
    resp.clearCookie("usn");
    resp.clearCookie("auth");
    resp.redirect("/login");
})

app.get("/reg_user_name",(req,resp)=>{
    resp.sendFile(__dirname+"/html_files/reg_user.html");
});
app.post("/reg_user_name",async (req,resp)=>{
    let ans=await search_user_model.find({usn: req.body.user_name});
    if(ans.length!==0){
        resp.send("user name is in use");
    }
    else{
        resp.render("reg_user_pass.ejs",{usn:req.body.user_name});
    }
})
app.post("/reg_user_name_pass",async (req,resp)=>{
    let us_name=req.body.user_name;
    let pass1=req.body.password;
    let new_sr=new search_user_model({
        usn: us_name
    });
    await new_sr.save();
    let new_s_u=new social_user({
        usn: us_name,
        pass: pass1
    });
    await new_s_u.save();
    resp.redirect("/login");
});
// app.get("/mainpage",async function(req,resp,next){
//     let val=await message.find();
//     resp.render("main_page.ejs",{
//         sender_preson: val[0].sender,
//         dt: val[0].date,
//         time: val[0].time,
//         text_content: val[0].text_content,
//         like_cnt: val[0].likes_cnt,
//         cmts_cnt: val[0].comments_cnt,
//     });
// });

// app.get("/signup",(req,resp)=>{
//     resp.send("sign up page");
// });


app.get("/fgpass",(req,resp)=>{
    resp.send("forgot page");
});

const search_user_schema= new mongoose.Schema({
    usn: String
});
const search_user_model=mongoose.model("search_user",search_user_schema);

app.get("/search_user",async (req,resp)=>{
    if(req.query.person!==""){
    let val=await search_user_model.find({
        usn:{$regex: '.*' + req.query.person + '.*' ,$options:'i'}
    });
    if(val.length!==0){
        let send_string="";
        for(let i=0;i<val.length-1;i++){
            if(val[i].usn!==req.query.send){
                send_string+=val[i].usn+"<brk>";
            }
        }
        if(val[val.length-1].usn!==req.query.send){
            send_string+=val[val.length-1].usn;
        }
        if(send_string===""){
            resp.send("no-data");    
        }
        else{
            resp.send(send_string);
        }
    }
    else{
        resp.send("no-data");
    }
    }
    else{
        resp.send("no-data");
    }
});

app.get("/add_friend",async (req,resp)=>{
    let val=await Contact.find({user_name: req.query.send});
    if(val.length!==0){
        let ans=0;
        for(let i=0;i<val[0].user_contacts.length;i++){
            if(val[0].user_contacts[i]===req.query.user){
                ans=1;
                break;
            }
        }
        if(ans===0){
            val[0].user_contacts.push(req.query.user);
            val[0].save();
        }
    }
    else{
        let lst1=new Contact({
            user_name:req.query.send,
            user_contacts:[req.query.user]
        });
        lst1.save();
    }
    resp.send("added-user");
});







// const buff_messages=new mongoose.Schema({
//         To: String,
//         From: String,
//         text_message: String,
//         date_act: String,
//         time: String
// });
// const buff_model=mongoose.model("buffer_message",buff_messages);



// const chat_message_schema= new mongoose.Schema({
//     person_1:String,
//     person_2:String,
//     chats_box:[{
//         To: String,
//         From: String,
//         text_message: String,
//         date_act: String,
//         time: String
//     }]
// });
// const chat_model=mongoose.model("chat_boxe",chat_message_schema);
app.post("/buff_messages",async (req,resp)=>{
    let mess_recv=req.body;
    if(req.body.send!=="none"&&req.body.recv!=="none"){
        let messages_fnd=await messages_act_model.find({$or: [
            { $and: [{person1: mess_recv.send}, {person2: mess_recv.recv}] },
            { $and: [{person1: mess_recv.recv}, {person2: mess_recv.send}] }
        ]});
        if(messages_fnd.length!==0){
            let arr=[];
            for(let i=0;i<messages_fnd[0].chats.length;i++){
                let temp_m=messages_fnd[0].chats[i];
                if(temp_m.To===mess_recv.send&&temp_m.to_seen===0){
                    arr.push(temp_m);
                    messages_fnd[0].chats[i].to_seen=1;
                }
            }
            if(arr.length!==0){
                let send_string="";
                for(let s=0;s<arr.length-1;s++){
                    if(arr[i].message_type!=="image"){
                        send_string+=JSON.stringify(arr[i])+"<brk>";
                    }
                    else{
                        let img_mess={
                            contentType:arr[i].img.contentType,
                            message_type:"image",
                            time:arr[i].time,
                            data:arr[i].img.data.toString('base64'),
                        }
                        send_string+=JSON.stringify(img_mess)+"<brk>";
                    }
                }
                if(arr[arr.length-1].message_type!=="image"){
                    send_string+=JSON.stringify(arr[arr.length-1]);
                }
                else{
                    let img_mess={
                        message_type:"image",
                        contentType:arr[arr.length-1].img.contentType,
                        time:arr[arr.length-1].time,
                        data:arr[arr.length-1].img.data.toString('base64'),
                    }
                    send_string+=JSON.stringify(img_mess);
                }
                messages_fnd[0].save();
                resp.send(send_string);
            }
            else{
                resp.send("no-data");
            }
        }
        else{
            resp.send("no-data");
        }
    }
    else{
        resp.send("no-data");
    }
});






const freind_lst_schema=new mongoose.Schema({
    user_name:String,
    user_contacts:[
        {
            type: String
        }
    ]
});
const Contact=mongoose.model("friends_list",freind_lst_schema);
// let lst1=new Contact({
//     user_name:"karthikey",
//     user_contacts:["girraj","divyansh","vihith"]
// });
// lst1.save();

function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop].getTime() > b[prop].getTime()) {    
            return 1;    
        } else if (a[prop].getTime() < b[prop].getTime()) {    
            return -1;    
        }    
        return 0;    
    }    
} 
app.get("/chats",async (req,resp)=>{
    if(req.cookies.auth==="y"){
        let val= await messages_act_model.find({$or: [
            { $and: [{person1: req.query.send}, {person2: req.query.recv}] },
            { $and: [{person1: req.query.recv}, {person2: req.query.send}] }
        ]});
        let val1=await Contact.find({user_name:req.query.send});
        if(val.length!==0){
            val[0].chats.sort(GetSortOrder("date_act"));
            for(let up=0;up<val[0].chats.length;up++){
                if(val[0].chats[up].To===req.query.send&&val[0].chats[up].to_seen===0){
                    console.log(req.query.send+" "+val[0].chats[up].To);
                    val[0].chats[up].to_seen=1;
                }
            }
            val[0].save();
            if(val1.length!==0){
                resp.render("chat_ejs.ejs",{ people:val1[0].user_contacts,selected_user:req.query.recv,messages:val[0].chats,send:req.query.send,recv:req.query.recv});
            }
            else{
                resp.render("chat_ejs.ejs",{ people:[],selected_user:req.query.recv,messages:val[0].chats,send:req.query.send,recv:req.query.recv});
            }
        }
        else{
            if(val1.length!==0){
                resp.render("chat_ejs.ejs",{ people:val1[0].user_contacts,selected_user:req.query.recv,messages:[],send:req.query.send,recv:req.query.recv});
            }
            else{
                resp.render("chat_ejs.ejs",{ people:[],selected_user:req.query.recv,messages:[],send:req.query.send,recv:req.query.recv});
            }
        }
    }
    else{
        resp.redirect("/login");
    }
})








app.post("/chat_receive",async (req,resp)=>{
    let mess_recv=req.body;
    let currentTime = new Date();
    let currentOffset = currentTime.getTimezoneOffset();
    let ISTOffset = 330;  
    let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    let hrs = ISTTime.getHours();
    let min = ISTTime.getMinutes();
    let a_p = hrs >= 12 ? 'pm' : 'am';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; 
    min= min< 10 ? '0'+min : min;
    let dt_val=hrs+"."+min+" "+a_p;
    let chat= await messages_act_model.find({$or: [
        { $and: [{person1: mess_recv.from}, {person2: mess_recv.to}] },
        { $and: [{person1: mess_recv.to}, {person2: mess_recv.from}] }
    ]});
    if(chat.length===0){
        let mess_1=new messages_act_model({
            person1: mess_recv.from,
            person2: mess_recv.to,
            chats:[{
                To: mess_recv.to,
                From: mess_recv.from,
                text_message: mess_recv.text,
                date_act: ISTTime,
                time: dt_val,
                to_seen: 0
            }]
        });
        mess_1.save();
    }
    else{
        let mess_got={
            To: mess_recv.to,
            From: mess_recv.from,
            text_message: mess_recv.text,
            date_act: ISTTime,
            time: dt_val,
            to_seen: 0
        }
        chat[0].chats.push(mess_got);
        chat[0].save();
    }
    resp.send("status='got_it'&time="+dt_val);
});











const user_schema= new mongoose.Schema({
    usn: String,
    pass: String
});
const social_user=mongoose.model("user_det",user_schema);

const message_schema= new mongoose.Schema({
    sender: String,
    type: String,
    date: String,
    time: String,
    text_content: String,
    likes_cnt: String,
    comments_cnt: String
});
const message=mongoose.model("message",message_schema);
app.post("/login",async function(req,resp,next){
    let val=await social_user.find({usn: req.body.user_name});
    if(val.length===0){
        resp.send("incorrect");
    }
    else{
        if(req.body.password===val[0].pass){
            resp.cookie("auth","y");
            resp.cookie("usn",req.body.user_name);
            resp.redirect("/chats?send="+req.body.user_name+"&recv=none");
        }
        else{
            resp.send("incorrect");
        }
    }
});



const messages_act=new mongoose.Schema(
    {
        person1: String,
        person2: String,
        chats:[{
            img:{
                data: Buffer,
                contentType: String
            },
            message_type:String,
            To: String,
            From: String,
            text_message: String,
            date_act: Date,
            time: String,
            to_seen: Number
        }]
    }
);
const messages_act_model=mongoose.model("new_chats_container",messages_act);


const multer  = require('multer');
const fs = require('fs');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname+'/public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
const upload = multer({ storage: storage });



app.post("/img_post",upload.single("test_img"),async (req,resp)=>{
    let mess_recv=req.body;
    let currentTime = new Date();
    let currentOffset = currentTime.getTimezoneOffset();
    let ISTOffset = 330;  
    let ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    let hrs = ISTTime.getHours();
    let min = ISTTime.getMinutes();
    let a_p = hrs >= 12 ? 'pm' : 'am';
    hrs = hrs % 12;
    hrs = hrs ? hrs : 12; 
    min= min< 10 ? '0'+min : min;
    let dt_val=hrs+"."+min+" "+a_p;
    let chat= await messages_act_model.find({$or: [
        { $and: [{person1: mess_recv.send}, {person2: mess_recv.recv}] },
        { $and: [{person1: mess_recv.recv}, {person2: mess_recv.send}] }
    ]});
    if(chat.length===0){
        let mess_1=new messages_act_model({
            person1: mess_recv.send,
            person2: mess_recv.recv,
            chats:[{
                img:{
                    data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.file.filename)),
                    contentType: 'image/png'
                },
                message_type:"image",
                To: mess_recv.recv,
                From: mess_recv.send,
                text_message: "",
                date_act: ISTTime,
                time: dt_val,
                to_seen: 0
            }]
        });
        mess_1.save();
    }
    else{
        let mess_got={
            img:{
                data: fs.readFileSync(path.join(__dirname + '/public/uploads/' + req.file.filename)),
                contentType: 'image/png'
            },
            message_type:"image",
            To: mess_recv.recv,
            From: mess_recv.send,
            text_message: mess_recv.text,
            date_act: ISTTime,
            time: dt_val,
            to_seen: 0
        }
        chat[0].chats.push(mess_got);
        chat[0].save();
    }
    resp.redirect("https://social-new-ind.herokuapp.com/chats?send="+mess_recv.send+"&recv="+mess_recv.recv);
    fs.unlink(path.join(__dirname + '/public/uploads/' + req.file.filename),(err)=>{
        if(err){
            console.log("hi");
            console.log(err);
        }
    });
});