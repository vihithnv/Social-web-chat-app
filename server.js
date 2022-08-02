const express=require("express");
const app=express();
const body_parse=require("body-parser");
const mongoose=require("mongoose");
const { response } = require("express");
mongoose.connect("mongodb+srv://vihith_mongodb:"+"Cse3002"+"%40"+"iwp2022"+"@cluster0.u8fjk.mongodb.net/Social_db",{ useNewUrlParser: true});
// app.use('view engine',"ejs");
const port=process.env.PORT || 3000;
app.listen(port);
app.use(express.static(__dirname+"/public"));
app.use(body_parse.urlencoded({extended: true}));

app.get("/",(req,resp)=>{
    resp.redirect("/login");
})
app.get("/login",(req,resp)=>{
    resp.sendFile(__dirname+"/html_files/login.html");
});
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
app.get("/mainpage",async function(req,resp,next){
    let val=await message.find();
    resp.render("main_page.ejs",{
        sender_preson: val[0].sender,
        dt: val[0].date,
        time: val[0].time,
        text_content: val[0].text_content,
        like_cnt: val[0].likes_cnt,
        cmts_cnt: val[0].comments_cnt,
    });
});

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







const buff_messages=new mongoose.Schema({
        To: String,
        From: String,
        text_message: String,
        date_act: String,
        time: String
});
const buff_model=mongoose.model("buffer_message",buff_messages);



const chat_message_schema= new mongoose.Schema({
    person_1:String,
    person_2:String,
    chats_box:[{
        To: String,
        From: String,
        text_message: String,
        date_act: String,
        time: String
    }]
});
const chat_model=mongoose.model("chat_boxe",chat_message_schema);
app.post("/buff_messages",async (req,resp)=>{
    let mess_recv=req.body;
    if(req.body.send!=="none"&&req.body.recv!=="none"){
        let buff_=await buff_model.find(
            { $and: [{To: mess_recv.send}, {From: mess_recv.recv}] }
    );
    if(buff_.length!==0){
        let val=await chat_model.find({$or: [
            { $and: [{person_1: mess_recv.send}, {person_2: mess_recv.recv}] },
            { $and: [{person_1: mess_recv.recv}, {person_2: mess_recv.send}] }
        ]});
        if(val.length!==0){
            for(let i=0;i<buff_.length;i++){
                val[0].chats_box.push(buff_[i]); 
            }
            val[0].save();
        }
        else{
            let message_1=new chat_model({
            person_1:mess_recv.send,
            person_2:mess_recv.recv,
            chats_box : []
        }
        );
        for(let i=0;i<buff_.length;i++){
            message_1.chats_box.push(buff_[i]);
        }
        message_1.save();
    }
    let send_string="";
    for(let i=0;i<buff_.length-1;i++){
        send_string+=JSON.stringify(buff_[i])+"<brk>";
    }
    send_string+=JSON.stringify(buff_[buff_.length-1]);
    await buff_model.deleteMany({$or: [
        { $and: [{To: mess_recv.send}, {From: mess_recv.recv}] },
        { $and: [{To: mess_recv.recv}, {From: mess_recv.send}] }
    ]});
       resp.send(send_string);
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
    let val= await messages_act_model.find({$or: [
        { $and: [{person1: req.query.send}, {person2: req.query.recv}] },
        { $and: [{person1: req.query.recv}, {person2: req.query.send}] }
    ]});
    let val1=await Contact.find({user_name:req.query.send});
    if(val.length!==0){
        val[0].chats.sort(GetSortOrder("date_act"));
        console.log(val[0].chats);
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
        { $and: [{person1: req.query.send}, {person2: req.query.recv}] },
        { $and: [{person1: req.query.recv}, {person2: req.query.send}] }
    ]});
    if(chat.length===0){
        let mess_1=new messages_act_model({
            person1: req.query.send,
            person2: req.query.recv,
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
            //add cookie
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

