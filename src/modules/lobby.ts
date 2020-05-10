import * as io from 'socket.io-client';

class Lobby {
    socket = null

    handlers = {}
    players = {}

    constructor() {
    }

    public start(nickname) {
        //const racing_server = "localhost:8081";
        const racing_server = "https://mars-racing.herokuapp.com";
        console.log(`connecting to '${racing_server}'`);

        this.socket = io.connect(racing_server);
        this.socket.on('connect', () => {
            this.socket.emit('broadcast', {
                type: 'hello',
                nickname: nickname,
            })
        });
        this.socket.on('hi', (sid) => {
            this.trigger('hi', sid)
            this.socket.emit('users', (users) => {
                this.trigger('users', users)
            });
        });
        this.socket.on('buy', (msg) => {
            this.trigger('buy', msg)
            delete this.players[msg.sid]
        });
        this.socket.on('broadcast', (msg) => {
            if (msg.type === 'hello') {
                this.players[msg.sid] = msg
            }
            this.trigger('msg', msg)
        });
    }

    public send(msg) {
        this.socket.emit('broadcast', msg)
    }

    public on(event:string, handler: {(data?:any):void;}) {
        if ( ! (event in this.handlers))
            this.handlers[event] = [];
        this.handlers[event].push(handler);
    }
    public off(event:string, handler: {(data?:any):void;}) {
        if (event in this.handlers)
            this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }
    private trigger(event:string, data?:any) {
        if (event in this.handlers)
            this.handlers[event].forEach(h => h(data));
    }

    public getPlayers(mid) {
        return Object.keys(this.players).map(uid => this.players[uid])
    }
}

const lobby = new Lobby()

export function getLobby() {
    return lobby
}

