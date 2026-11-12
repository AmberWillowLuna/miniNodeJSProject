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


function broadcastPlayers() {
    io.emit('updatePlayers', players);
    io.emit('mapUpdate', {
        map: mainMap.getMap()
    });
}




io.on('connection', (socket) => {
    console.log('Connected:', socket.id);
    socket.on('chatMessage', ({ message } = {}) => {
        const p = players[socket.id];
        if (!p) return;
        io.emit('chatMessage', { name: p.nickname, message: String(message).slice(0, 200) });
    });
    // Player picked name + color
    socket.on('newPlayer', ({ player } = {}) => {

        if (players[socket.id]) return; // already joined

        const cleanName = String(player.nickname || '').trim().slice(0, 16);

        const validColor = Array.isArray(player.color) &&
            player.color.length === 3 &&
            player.color.every((c) =>
                Number.isInteger(c) && c >= 0 && c <= 255
            );

        if (!cleanName) return;




        players[socket.id] = {
            nickname: cleanName,
            color: validColor ? player.color : [255, 0, 0],
            pos: player.pos
        };

        socket.join('main');

        

        socket.emit('mapUpdate', {
            map: mainMap.getMap()
            }); // always the CURRENT map

        socket.emit('updatePlayers', {
            serverPlayers: players
        });

        //broadcastPlayers('main');
    });


    socket.on('move', ({ x, y } = {}) => {
        const p = players[socket.id];
        if (!p) return; // hasn't joined yet
       
        const map = mainMap.getMap();

        const inside = Number.isInteger(x) && Number.isInteger(y) &&
            y >= 0 && y < map.length && x >= 0 && x < map[0].length;

        if (!inside) return;

        if (Math.abs(x - p.pos[0]) + Math.abs(y - p.pos[1]) > 1) return; // max 1 tile
  //      if (SOLID.includes(map[y][x])) return;                           // walls block you
        p.pos = [x, y];

        players[socket.id].pos =p.pos;
 
        broadcastPlayers('main');
        socket.emit('updatePlayers', {
            serverPlayers: players
        });
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