const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const MainMap = require('./public/mainMap.js').default;

var port = process.env.PORT || 1337;


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let mainMap = new MainMap();
const players = {}; 
const scoreboard = {};

//const AllTimeScoreboard = JSON.parse(fs.readFileSync(path.join(__dirname, 'scoreboard.json'), 'utf8'));


function broadcastPlayers(place) {
    //io.to(place).emit('updatePlayers', here);
}




io.on('connection', (socket) => {
    console.log('Connected:', socket.id);
    socket.on('chatMessage', ({ message } = {}) => {
        const p = players[socket.id];
        if (!p) return;
        io.emit('chatMessage', { name: p.name, message: String(message).slice(0, 200) });
    });
    // Player picked name + color
    socket.on('newPlayer', ({ player } = {}) => {

        if (players[socket.id]) return; // already joined

        console.log("Received nickname:", player.nickname);
        const cleanName = String(player.nickname || '').trim().slice(0, 16);

        const validColor = Array.isArray(player.color) &&
            player.color.length === 3 &&
            player.color.every((c) =>
                Number.isInteger(c) && c >= 0 && c <= 255
            );

        if (!cleanName) return;




        players[socket.id] = {
            name: cleanName,
            color: validColor ? player.color : [255, 0, 0],
            pos: player.pos
        };

        socket.join('main');
        console.log(mainMap.getMap());
        

        socket.emit('mapUpdate', {
            map: mainMap.getMap()
            }); // always the CURRENT map

        //broadcastPlayers('main');
    });
});

/*
we are gonna use it to count score
function startCountdown(n) {
    if (countdowns[n]) return; // already running - don't restart it
    console.log(`[lobby ${n}] someone stepped in - countdown started`);
    let secondsLeft = COUNTDOWN_SECONDS;
    io.to('main').emit('lobbyStatus', { lobby: n, secondsLeft });

    countdowns[n] = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            io.to('main').emit('lobbyStatus', { lobby: n, secondsLeft });
        } else {
            stopCountdown(n);
            try {

                console.log(`[lobby ${n}] countdown finished - launching the dungeon`);
                launchDungeon(n);
            } catch (err) {
                // a bug while launching must not kill the whole server
                console.error(`[lobby ${n}] COULD NOT START THE DUNGEON:`, err);
            }
        }
    }, 1000);
}

function stopCountdown(n) {
    if (!countdowns[n]) return;
    console.log(`[lobby ${n}] countdown stopped`);
    clearInterval(countdowns[n]);
    delete countdowns[n];
    io.to('main').emit('lobbyStatus', { lobby: n, secondsLeft: null }); // null = hide it
}
*/


server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});