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

/* CHANGE TO BE IMPLEMENTED TO ENABLE PERSISTENT MESSAGES
  
  ON MESSAGE EVENT, SAVE CHANGE TO SERVER DB/STORE FIRST THEN TRANSMIT TO ALL SOCKETS

*/

// change to set OR add checking to prevent same name, rn only unique identification is socket id
var usersOnline = []

ss.on('connection', (socket) => {
    console.log('a user connected: ' + socket.id);
    socket.to(socket.id).emit('usersOnline', usersOnline)

    socket.on('join', (name) => {
      console.log(name+'joined')
      // sends new user name to every other client but one that sent
      usersOnline.push({username: name, id: socket.id})
      console.log(usersOnline)
      socket.broadcast.emit('join', [name, usersOnline]);
    })

    socket.on('message', (data) => {
      socket.broadcast.emit('message', data)
    })

    socket.on('disconnect', () => {
        console.log(socket + ' has left the server - ' + socket.id)

        usersOnline.forEach( (user, index) => {
          if (user.id == socket.id) { 
            usersOnline.splice(index, 1)
            socket.broadcast.emit('leave', [user.username, usersOnline])
          }
        })
    })

    socket.on('send-dm', ({username, message}) => {
      console.log(username, message);
    })


  });

server.listen(4444, () => {console.log("Listening on port 5000")})

// setInterval(() => {
//   console.log("\n\n\n"+Date() + " - ")
//   console.log("Users Array: ")
//   console.log(usersOnline)
// }, 15000)