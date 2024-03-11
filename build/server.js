const { on } = require('events')
const express = require('express')
const app = express()
const path = require('path')

const server = app.listen(3000)

app.use(express.static(__dirname + '/public'))
app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')))


const socket = require('socket.io')
const io = socket(server)

class ClientPayload{
    constructor(calculatedState){
        this.calculatedState = calculatedState;
    }
}

class HostPayload{
    constructor(actions){
        this.actions = actions;
    }
}

class GameBackend{
    constructor(ioRef){
        this.io = ioRef;
        this.host = null;
        this.clients = {};
    }

    onConnection(socket){
        if (this.host == null){
            this.host = {socket, id: socket.id};
            this.host.socket.emit('determineClientType', 'host');
        }

        else{
            this.clients[socket.id] = {socket, id: socket.id};
            this.clients[socket.id].socket.emit('determineClientType', 'client');
        }

        socket.on('clientAction', (data) => {
            const hostPayload = new HostPayload(data.actions);

            const responseTimeout = 350;
            this.host.socket.timeout(responseTimeout).emit('hostSimulate', hostPayload, (err, response) => {
                if (err){
                    console.log('Error: ' + err);
                }

                const clientPayload = new ClientPayload(response.state);
                this.clients[socket.id].socket.emit('clientReconcile', clientPayload);
            });


        });

    }

    onDisconnection(socket){
        if (this.host.id == socket.id){
            this.host = null;
            this.io.sockets.emit('reloadGame');
        }

        else if (this.clients[socket.id]){
            delete this.clients[socket.id];
        }
    }

}



let gameBackend = new GameBackend(io);
io.sockets.on('connection', handleNewConnection);
console.log('Server is running on port 3000')

function handleNewConnection(socket) {
    gameBackend.onConnection(socket);

    socket.on('disconnect', () => {
        gameBackend.onDisconnection(socket);
    })
}