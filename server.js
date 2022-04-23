//Standard setting up of server
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);
const port = process.env.PORT || 3000;

//Give path to static files
app.use(express.static(__dirname+'/public'));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});


//Socket.io setup
const io = require("socket.io")(server);
var user_list={};
var messages_list={};


//Store username received from client
io.on("connection",(socket)=>{
    socket.on("new_user", (username)=>{
        user_list[socket.id]=username;
        //Broadcast message to everyone else that a new user has joined
        socket.broadcast.emit('user_connected', username);
        //Update the user list
        io.emit("users_list", user_list);
    });

    //Broadcast message to everyone else that a user has left
    socket.on("disconnect", ()=> {
        //Get the socket id of the user who left the chat
        socket.broadcast.emit('user_disconnected', user=user_list[socket.id]);
        //Delete it from the list of users
        delete user_list[socket.id];
        //Update the user list
        io.emit("users_list", user_list);
    });

    socket.on('message',(data)=>{
        //messages_list.push(data);
        socket.broadcast.emit("message",{user: data.user, message: data.message, time: data.time});
    });
});


server.listen(port, ()=>{
    console.log("Server started at" +port);
});