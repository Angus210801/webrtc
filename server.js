const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.static('public'));

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening on port ${port}`);
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (iceCandidate) => {
        socket.broadcast.emit('ice-candidate', iceCandidate);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

