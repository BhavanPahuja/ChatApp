const socket = io();

var username;
var usercolor;

//Get chats from html
var chats = document.querySelector(".chat");
//Get active user list
var users_list = document.querySelector(".users_list");
//Outgoing message button
var send_message = document.querySelector("#send_message");
//Change username button
var leave_chat = document.querySelector("#leave_chat");
//Get outgoing messages
var user_message = document.querySelector("#user_message");


username=prompt("Please enter your username: ");

//If no username is given, generate a random username
if(username === "") {
    console.log("No username given. Creating username!");
    genName();
}


//generate random user name
function genName() {
    let num_users = Math.floor(Math.random()*100);
    username = "BetterUser" + num_users;
} 

usercolor=prompt("Please enter color in hex format (without #): ");

//If no color is given, generate a random username
if(usercolor === "") {
    console.log("No color given. Choosing random color!");
    genColor();
}

if(usercolor !== 6) {
    console.log("Invalid color. Choosing random color!");
    genColor();
}

//Generate random color
function genColor() {
    let randomColor = Math.floor(Math.random()*16777215).toString(16);
    usercolor = randomColor;
}

usercolor = "#" + usercolor;


//Let the server know client has joined and send username
socket.emit("new_user", username);

//Receive the broadcast from server telling new user has joined
socket.on('user_connected',(new_user_name)=>{
    user_joined_left(new_user_name, 'joined');
});

//Receive the broadcast from server telling a user has left
socket.on('user_disconnected',(user_disconnected_name)=>{
    user_joined_left(user_disconnected_name, 'left');
});

//Receive the broadcast from server telling a user has changed
socket.on('user_changed',(changed_name)=>{
    user_joined_left(changed_name, 'changed in');
});

//Receive the broadcast from server that updates user list
socket.on('users_list',(active_users)=>{
    users_list.innerHTML="";
    users_new_list = Object.values(active_users);
    for(i = 0; i < users_new_list.length; i++) {
        let p = document.createElement('p');
        p.innerText = users_new_list[i];
        users_list.appendChild(p);
    }
});

//Handles messages every time a user joins or leaves
function user_joined_left(name, status) {
    let div = document.createElement("div");
    div.classList.add('join');
    let message = `<p><b>${name}</b> ${status} the chat</p>`;
    div.innerHTML = message;
    chats.appendChild(div);
    //Make chat scrollable
    chats.scrollTop = chats.scrollHeight;
}

leave_chat.addEventListener('click', ()=> {

    //Re prompt for new username and new color
    username=prompt("Please enter new username: ");
    //If no username is given, generate a random username
    if(username === "") {
        console.log("No username given. Creating username!");
        genName();
    }
    socket.emit("change_user", username);
    usercolor=prompt("Please enter new color in hex format (without #): ");
    //If no color is given, generate a random username
    if(usercolor === "") {
        console.log("No color given. Choosing random color!");
        genColor();
    }

    if(usercolor !== 6) {
        console.log("Invalid color. Choosing random color!");
        genColor();
    }
    user_joined_left(username, "changed in");
});

//Sending messages
send_message.addEventListener('click', ()=>{
    let data={
        user: username,
        color: usercolor,
        message: user_message.value,
        time: new Date().getHours() + ":" + new Date().getMinutes()
    };
    if(user_message.value!='') {
        send_message_function(data, 'sent');
        socket.emit('message', data);
        user_message.value='';
        user_message.focus();
    }
});

socket.on('message', (data)=> {
    send_message_function(data, 'received');
});

//Handles incoming and outgoing messages
function send_message_function(data, status) {
    let div = document.createElement('div');
    
    div.classList.add('message',status);
    let content =`
        <h5>${data.user}</h5>
        <p>${data.message}</p>
        <h6>${data.time}</h6>
    `;
    
    div.innerHTML = content;
    chats.appendChild(div);

    var elements = document.getElementsByTagName("h5");
    for(let i = 0; i<elements.length; i++) {
        elements[i].style.color = usercolor;
    }

   /* var collection = Array.prototype.slice.call(elements);

    for(let i = 0; i<collection.length; i++) {
        console.log(collection[i].innerText);
        if(collection[i].innerText == data.user) {
            console.log("true");
            collection[i].style.color = data.color;
        }
    }*/

    //Make chat scrollable
    chats.scrollTop = chats.scrollHeight;
};

