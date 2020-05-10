import * as io from 'socket.io-client';

class Lobby {
    users = {}
    matches = {}

    socket = null
    lobby = null

    handlers = {}

    constructor() {
        this.loadLobby();
    }

    private loadLobby() {
        console.log('connecting');
        this.socket = io.connect("https://mars-racing.herokuapp.com");
        this.lobby = io.connect("https://mars-racing.herokuapp.com/lobby");
        this.lobby.on("connect", () => {
            this.users = {};
            this.matches = {};
            console.log('on connect to lobby');

            this.trigger('connect');
        });

	this.lobby.on('userEnter', (uid, user) => {
		console.log('userEnter', uid, user);
		this.users[uid] = user;
                this.trigger('userEnter', user);
	});
	this.lobby.on('userLeave', (uid, user) => {
		console.log('userLeave', uid, user);
                this.trigger('userLeave', user);
	});

	this.lobby.on('matchAdd', (match) => {
		console.log('matchAdd', match);
		this.matches[match.id] = match;
                this.trigger('matchAdd', match);
	});

	this.lobby.on('matchUpdated', (match) => {
		console.log('matchUpdated', match);
		this.matches[match.id] = match;
                this.trigger('matchUpdated', match);
	});

	this.lobby.on('matchJoined', (mid, uid) => {
		console.log('matchJoined', mid, uid);
		this.matches[mid].players[uid] = false;
                this.trigger('matchJoined', [this.matches[mid], this.users[uid]]);
	});

	this.lobby.on('matchReady', (mid, uid) => {
		console.log('matchReady', mid, uid);
		this.matches[mid].players[uid] = true;
                this.trigger('matchReady', [this.matches[mid], this.users[uid]]);
	});

	this.lobby.on('matchLeaved', (mid, uid) => {
		console.log('matchLeaved', mid, uid)
		delete this.matches[mid].players[uid]
                this.trigger('matchLeaved', [this.matches[mid], this.users[uid]]);
	});

	this.lobby.on('matchStarted', (mid) => {
		console.log('matchStarted', mid);
		this.matches[mid].status = 'playing';
                this.trigger('matchStarted', this.matches[mid]);
	});

	this.lobby.on('matchFinished', (mid) => {
		console.log('matchFinished', mid);
                this.trigger('matchFinished', this.matches[mid]);
		delete this.matches[mid];
	});
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

    public getUser(uid) {
        return this.users[uid]
    }

    public getPlayers(mid) {
        if (mid in this.matches)
            return this.matches[mid].players.keys().map(uid => this.getUser(uid));
        return []
    }

    public signIn(uid, nickname) {
        console.log('sign-in', uid);
        this.lobby.emit('sign-in', uid, nickname, (welcome) => {
            console.log(welcome);
            this.trigger('signed-in');
        });
    }

    public createNewGame(settings) {
        console.log('matchNew', settings);
        this.lobby.emit('matchNew', settings, (result) => {
            console.log(result)
        })
    }

    public joinGame(mid) {
        console.log('matchJoin', mid);
	this.lobby.emit('matchJoin', mid, (result) => {
            console.log(result)
	})
    }

    public readyToPlay(mid) {
        console.log('matchReady', mid);
	this.lobby.emit('matchReady', mid, (result) => {
            console.log(result)
	})
    }

    public leaveGame(mid) {
        console.log('matchLeave', mid);
	this.lobby.emit('matchLeave', mid, (result) => {
            console.log(result)
	})
    }
}

const lobby = new Lobby()

export function getLobby() {
    return lobby
}

