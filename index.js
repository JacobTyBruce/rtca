const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const server = http.createServer(app)

// ss = Socket Server
const ss = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'frontend')))

// socket boardcasts -- emitted from bias of ind. socket
// broadvast -> everyone but sender
// .to(room) -> everyone in room except sender
// you can stack these ^ ex: room(1).room(2)

// server broadcasts -- emitted from bias of server
// .in(room) -> all client in room
// .of(nameSpace) -> to all clients in namespace
// CHAINING -> .of(nameSpace).to(room) -> all clients in room of namespace
// .to(socketID) -> to ind socket

ss.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    socket.on('join', (name) => {
        // sends new user name to every other client but one that sent
        socket.broadcast.emit('join', name);
    })


  });

server.listen(5000, () => {console.log("Listening on port 5000")})