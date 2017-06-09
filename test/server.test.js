var should = require('should');
var io = require('socket.io-client');
var axios = require('axios');

var socketURL = 'http://localhost:7000';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var chatUser1 = { 'name': 'Tom' };
var chatUser2 = { 'name': 'Sally' };
var chatUser3 = { 'name': 'Dana' };

describe("Chat Server", function (done) {

    it('Should register new user to private channel', function (done) {
        //var client1 = io.connect(socketURL, options);
        var client1 = io(socketURL);
        client1.connect(socketURL);

        client1.on('connect', (data) => {

            var client2 = io(socketURL);
            client2.connect(socketURL);

            client2.on('connect', (data) => {

                client1.emit('register', chatUser1.name, (error) => {
                    var onlineUsers = chatUser1.name;
                    axios.get('http://localhost:7000/allPrivate')
                        .then(function (response) {
                            response.data.length.should.equal(1);
                            response.data[0].name.should.equal(chatUser1.name);

                            client2.emit('register', chatUser2.name, (error) => {
                                var onlineUsers = chatUser2.name;
                                axios.get('http://localhost:7000/allPrivate')
                                    .then(function (response) {
                                        response.data.length.should.equal(2);
                                        response.data[1].name.should.equal(chatUser2.name);
                                        done();
                                        client1.disconnect();
                                        client2.disconnect();
                                    })
                                    .catch(function (error) {
                                        console.log(error);
                                        response.body.should.equal('did not connect to private');
                                        done();
                                    });
                            });
                        })
                        .catch(function (error) {
                            console.log(error);
                            error.should.equal('did not connect to private');
                            done();
                        });
                });
            });
        });
    });

    it('Should send private message', function (done) {
        var client1 = io(socketURL);
        client1.connect(socketURL);

        client1.on('connect', (data) => {

            var client2 = io(socketURL);
            client2.connect(socketURL);
            client1.emit('register', chatUser1.name, (error) => {
                var onlineUsers = chatUser1.name;
                axios.get('http://localhost:7000/allPrivate')
                    .then(function (response) {
                        response.data.length.should.equal(2);
                        response.data[0].name.should.equal(chatUser1.name);
                    })
                    .catch(function (error) {
                        console.log(error);
                        error.should.equal('did not connect to private');
                        done();
                    });
            });

            client1.on('private',(data) =>{
                data.from.should.equal(chatUser2.name);
                data.message.message.should.equal('hej');
                done();
            })

            client2.on('connect', (data) => {
                client2.emit('register', chatUser2.name, (error) => {
                    var onlineUsers = chatUser2.name;
                    axios.get('http://localhost:7000/allPrivate')
                        .then(function (response) {
                            response.data.length.should.equal(2);
                            response.data[1].name.should.equal(chatUser2.name);
                            var parameters = {to:`${chatUser1.name}`, message:{from:chatUser2.name, message:"hej"}};
                            client2.emit('private',parameters);
                        })
                        .catch(function (error) {
                            console.log(error);
                            response.body.should.equal('did not connect to private');
                            done();
                        });
                });
            });
        });
    });
});