const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const onlineUsers = {}; 

io.on('connection', (socket) => {
  socket.on('register_user', (username) => {
    onlineUsers[username] = socket.id;
    socket.username = username;
    io.emit('get_online_users', Object.keys(onlineUsers));
  });

  socket.on('send_private_message', ({ toUsername, message }) => {
    const receiverSocketId = onlineUsers[toUsername];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        from: socket.username,
        message: message
      });
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      delete onlineUsers[socket.username];
      io.emit('get_online_users', Object.keys(onlineUsers));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
