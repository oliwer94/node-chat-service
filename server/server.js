const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const { Users } = require('./utils/users');
const { isRealString } = require('./utils/validation');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const port = process.env.PORT || 7000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

var userListForPrivate = [];

io.on('connection', (socket) => {


    socket.on('register', (name, callback) => {
        userListForPrivate.push({ name, "id": socket.id });
        console.log('connected to private', socket.id, name);

        callback();
    });

    socket.on('private', (parameters) => {

        var user = userListForPrivate.filter((user) => user.name === parameters.to)[0];
        if (user && parameters.message) {
            io.sockets.connected[user.id].emit('private', { "from": parameters.message.from, "message": parameters.message });
        }
    });


    socket.on('join', (params, callback) => {

        socket.join(params.room.toLowerCase());

        socket.on('createMessage', (message) => {
            var user = users.getUser(socket.id);
            if (user && isRealString(message)) {
                io.to(user.room).emit('newMessage', generateMessage(user.name, message));
            }
        });

        console.log('joined to room', socket.id, params.name);

        //to everyone in the room
        //io.to(params.room).emit();
        //to everyone but sender in the room
        //socket.broadcast.to(params.room).emit();

        users.removeUser(socket.id);
        users.adduser(socket.id, params.name, params.room.toLowerCase())
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat room my friend!'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined the room.`));


        callback();
    });

    socket.on('getRooms', () => {
        var rooms = users.getRoomList();
        if (rooms.length > 0) {

            socket.emit('getRooms', rooms);
        }
        else {
            socket.emit('getRooms', []);
        }
    });

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);
        if (userListForPrivate) {
            userListForPrivate = userListForPrivate.filter((userp) => userp.id !== socket.id);
        }
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left the room.`));
        }
        console.log('disconnected', socket.id);
    });
});

app.get('/allGlobal', (req, res) => {
    res.send(users);
});
app.get('/allPrivate', (req, res) => {
    res.send(userListForPrivate);
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});