const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

var port = process.env.PORT || 1337;


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));






server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});