import { Label, GridTable, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import * as io from 'socket.io-client';
import { v4 } from 'uuid';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: true,
    visible: true,
    key: 'LobbyScene'
};

function getUid() {
    var uid = localStorage.getItem('uid')
    if (uid == null) {
        uid = v4()
        localStorage.setItem('uid', uid)
    }
    return uid
}

function getNickname() {
    var nickname = localStorage.getItem('nickname')
    if (nickname == null) {
        nickname = 'dmitry'
        localStorage.setItem('nickname', nickname)
    }
    return nickname
}

function genMatchName() {
    return `${getNickname()}'s game`
}

const INDEX = 0;
const NAME = 1;
const NUMBER = 2;
const PLAYERS = 3;
const STATUS = 4;
const ACTION = 5;
const LEAVE = 6;

export class LobbyScene extends Phaser.Scene {
    uid = getUid();
    socket = null;
    lobby = null;
    title = null;
    table = null;

    users = {}
    matches = {}

    constructor() {
        super(sceneConfig);
    }
    public preload() {
        //const url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgridtableplugin.min.js'
        //this.load.plugin('rexgridtableplugin', url, true);

        this.loadLobby();
    }
    public create() {
        this.scene.setVisible(false);

        this.createTitle();
        this.createTable()
    }
    private loadLobby() {
        console.log('connecting');
        this.socket = io.connect("https://mars-racing.herokuapp.com");
        this.lobby = io.connect("https://mars-racing.herokuapp.com/lobby");
        this.lobby.on("connect", () => {
            this.users = {};
            this.matches = {};
            console.log('on connect to lobby');
            this.onSignInClick();
        });
	this.lobby.on('userEnter', (uid, user) => {
		console.log('userEnter', uid, user);
		this.users[uid] = user;
	});
	this.lobby.on('userLeave', (uid, user) => {
		console.log('userLeave', uid, user);
	});

	this.lobby.on('matchAdd', (match) => {
		console.log('matchAdd', match);
		this.matches[match.id] = match;
                this.updateMatch(match);
	});

	this.lobby.on('matchUpdated', (match) => {
		console.log('matchUpdated', match);
		this.matches[match.id] = match;
                this.updateMatch(match);
	});

	this.lobby.on('matchJoined', (mid, uid) => {
		console.log('matchJoined', mid, uid);
		this.matches[mid].players[uid] = false;
                this.updateMatch(this.matches[mid]);
	});

	this.lobby.on('matchReady', (mid, uid) => {
		console.log('matchReady', mid, uid);
		this.matches[mid].players[uid] = true;
                this.updateMatch(this.matches[mid]);
	});

	this.lobby.on('matchLeaved', (mid, uid) => {
		console.log('matchLeaved', mid, uid)
		delete this.matches[mid].players[uid]
                this.updateMatch(this.matches[mid]);
	});

	this.lobby.on('matchStarted', (mid) => {
		console.log('matchStarted', mid);
		this.matches[mid].status = 'playing';
                this.updateMatch(this.matches[mid]);
	});

	this.lobby.on('matchFinished', (mid) => {
		console.log('matchFinished', mid);
                this.removeMatch(this.matches[mid]);
		delete this.matches[mid];
	});
    }

    private onSignInClick() {
        console.log('onSignInClick', this.uid);
        this.lobby.emit('sign-in', this.uid, getNickname(), (welcome) => {
            console.log(welcome);
            this.onNewClick();
        });
    }

    private onNewClick() {
        const settings = {
                name: genMatchName(),
                map: 'random',
                players: 4,
        }

        console.log('matchNew', settings);
        this.lobby.emit('matchNew', settings, (result) => {
            console.log(result)
        })
    }

    private onJoinClick(mid) {
        console.log('matchJoin', mid);
	this.lobby.emit('matchJoin', mid, (result) => {
            console.log(result)
	})
    }

    private onReadyClick(mid) {
        console.log('matchReady', mid);
	this.lobby.emit('matchReady', mid, (result) => {
            console.log(result)
	})
    }

    private onLeaveClick(mid) {
        console.log('matchLeave', mid);
	this.lobby.emit('matchLeave', mid, (result) => {
            console.log(result)
	})
    }

    private createTitle() {
        const title = this.make.text({
            x: this.cameras.main.centerX,
            y: 100,
            text: 'Lobby',
            style: {
                font: 'bold 60pt Curier',
                fill: '#FDFFB5',
            },
        });
        title.setShadow(3, 3, 'rgba(0, 0, 0, 0.5)', 5);
        title.setOrigin(0.5, 0.5)
    }
    private createTable() {
        const titleShift = 120
        const gridConfig = {
            x: this.cameras.main.centerX,
            y: titleShift/2+this.cameras.main.centerY,
            width: this.cameras.main.centerX*7/4,
            height: this.cameras.main.centerY*7/4-titleShift,
            table: {
                cellHeight: 30,
                columns: 7,
            },
            expand: {
                header: true,
            },
            align: {
                header: true,
            },
            items: this.createHeaderItems(),
            background: this.add.existing(new RoundRectangle(this.scene.scene, 0, 0, 100, 100, 10, 0x111111)),
            createCellContainerCallback: (cell, cellContainer) => this.cellFactory(cell, cellContainer),
        };
        this.table = new GridTable(this.scene.scene, gridConfig).layout();
        this.add.existing(this.table);
    }

    private updateMatch(match) {
        var found = false;

        const number = Object.keys(match.players).length + '/' + match.settings.players;
        const players = Object.keys(match.players).map(uid => this.users[uid].nickname).join(', ');

        const join_ready_text = this.uid in match.players ? "Ready" : "Join";
        const leave_type = this.uid in match.players ? "button" : "item";
        const leave_text = this.uid in match.players ? "Leave" : "";
        const mid = match.id;

        const on_join_ready_click = () => {
            if (this.uid in match.players)
                this.onReadyClick(mid);
            else
                this.onJoinClick(mid);
        };

        const on_leave_click = () => {
            this.onLeaveClick(mid);
        };

        for (const item of this.table.items.filter(item => item.key == match.id)) {
            found = true;

            switch (item.subtype) {
                case NAME:
                    item.text = match.name;
                    break;
                case NUMBER:
                    item.text = number;
                    break;
                case PLAYERS:
                    item.text = players;
                    break;
                case STATUS:
                    item.text = match.status;
                    break;
                case ACTION:
                    item.text = join_ready_text;
                    break;
                case LEAVE:
                    item.type = leave_type;
                    item.text = leave_text;
                    break;
            }
        }
        if (!found) {
            this.table.items.push({key: match.id, type: 'item',     subtype: INDEX,   text: match.id});
            this.table.items.push({key: match.id, type: 'item',     subtype: NAME,    text: match.name});
            this.table.items.push({key: match.id, type: 'item',     subtype: NUMBER,  text: number});
            this.table.items.push({key: match.id, type: 'item',     subtype: PLAYERS, text: players});
            this.table.items.push({key: match.id, type: 'item',     subtype: STATUS,  text: match.status});
            this.table.items.push({key: match.id, type: 'button',   subtype: ACTION,  text: join_ready_text, click: on_join_ready_click});
            this.table.items.push({key: match.id, type: leave_type, subtype: LEAVE,   text: leave_text, click: on_leave_click});
        }
        this.table.refresh();
    }

    private removeMatch(match) {
        this.table.items = this.table.items.filter(item => item.key != match.id);
        this.table.refresh();
    }

    private createHeaderItems() {
        return [
            {key: '', type: 'header', text: '#', },
            {key: '', type: 'header', text: 'Name', },
            {key: '', type: 'header', text: '#/#', },
            {key: '', type: 'header', text: 'Players', },
            {key: '', type: 'header', text: 'Status', },
            {key: '', type: 'header', text: 'Action', },
            {key: '', type: 'header', text: 'Leave', },
        ];
    }

    private cellFactory(cell, cellContainer) {
        switch (cell.item.type) {
            case 'header':
                return this.cellHeaderFactory(cell, cellContainer);
            case 'button':
                return this.cellButtonFactory(cell, cellContainer);
            default:
                return this.cellItemFactory(cell, cellContainer);
        }
    }

    private cellHeaderFactory(cell, cellContainer) {
        const textStyle = {
                font: 'bold 12pt Curier',
                fill: '#FDFFB5',
        };
        return new Label(this.scene.scene, {
            width: cell.width,
            height: cell.height,
            background: this.add.existing(new RoundRectangle(this.scene.scene, 0, 0, 100, 100, 1, 0x333333)),
            text: this.add.text(5, 5, cell.item.text, textStyle),
        });
    }

    private cellButtonFactory(cell, cellContainer) {
        const textStyle = {
                font: '10pt Curier',
                fill: '#DDDDB5',
        };
        return new Label(this.scene.scene, {
            width: cell.width,
            height: cell.height,
            background: this.add.existing(new RoundRectangle(this.scene.scene, 0, 0, 100, 100, 1, 0x222222)),
            text: this.add.text(5, 5, cell.item.text, textStyle),
        })
        .setInteractive()
        .on('pointerup', cell.item.click)
        ;
    }

    private cellItemFactory(cell, cellContainer) {
        const textStyle = {
                font: '10pt Curier',
                fill: '#DDDDB5',
        };
        return new Label(this.scene.scene, {
            width: cell.width,
            height: cell.height,
            background: this.add.existing(new RoundRectangle(this.scene.scene, 0, 0, 100, 100, 1, 0x222222)),
            text: this.add.text(5, 5, cell.item.text, textStyle),
        });
    }
}

