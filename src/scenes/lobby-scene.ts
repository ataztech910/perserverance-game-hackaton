import { Label, GridTable, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { v4 } from 'uuid';

import { getLobby } from '../modules/lobby';

const lobby = getLobby();

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
    title = null;
    table = null;

    constructor() {
        super(sceneConfig);
    }
    public preload() {
        //const url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexgridtableplugin.min.js'
        //this.load.plugin('rexgridtableplugin', url, true);

    }
    public create() {
        this.scene.setVisible(false);

        this.createTitle();
        this.createTable()

        lobby.on('connect',       ()              => this.onSignInClick())
        lobby.on('signed-in',     ()              => this.onSignedIn())
        lobby.on('matchAdd',      (match)         => this.updateMatch(match))
        lobby.on('matchUpdated',  (match)         => this.updateMatch(match))
        lobby.on('matchJoined',   ([match, user]) => this.updateMatch(match))
        lobby.on('matchReady',    ([match, user]) => this.updateMatch(match))
        lobby.on('matchLeaved',   ([match, user]) => this.updateMatch(match))
        lobby.on('matchStarted',  (match)         => this.updateMatch(match))
        lobby.on('matchFinished', (match)         => this.removeMatch(match))
    }

    private onSignInClick() {
        lobby.signIn(this.uid, getNickname());
    }

    private onSignedIn() {
        console.log('signed-in');
    }

    private onNewClick() {
        const settings = {
                name: genMatchName(),
                map: 'random',
                players: 4,
        }
        lobby.createNewGame(settings);
    }

    private onJoinClick(mid) {
        lobby.joinGame(mid);
    }

    private onReadyClick(mid) {
        lobby.readyToPlay(mid);
    }

    private onLeaveClick(mid) {
        lobby.leaveGame(mid);
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

        const joined_mid = lobby.getUser(this.uid).mid

        const number = Object.keys(match.players).length + '/' + match.settings.players;
        const players = Object.keys(match.players).map(uid => lobby.getUser(uid)).map(user => user == null ? '--' : user.nickname).join(', ');

        const join_ready_type = joined_mid == null ? "button" : joined_mid == match.id ? "button" : "item";
        const join_ready_text = joined_mid == null ? "Join" : joined_mid == match.id ? "Ready" : "";

        const leave_type = joined_mid == match.id ? "button" : "item";
        const leave_text = joined_mid == match.id ? "Leave" : "";
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
                    item.type = join_ready_type;
                    item.text = join_ready_text;
                    break;
                case LEAVE:
                    item.type = leave_type;
                    item.text = leave_text;
                    break;
            }
        }
        if (!found) {
            this.table.items.push({key: match.id, type: 'item',           subtype: INDEX,   text: match.id});
            this.table.items.push({key: match.id, type: 'item',           subtype: NAME,    text: match.name});
            this.table.items.push({key: match.id, type: 'item',           subtype: NUMBER,  text: number});
            this.table.items.push({key: match.id, type: 'item',           subtype: PLAYERS, text: players});
            this.table.items.push({key: match.id, type: 'item',           subtype: STATUS,  text: match.status});
            this.table.items.push({key: match.id, type: join_ready_type,  subtype: ACTION,  text: join_ready_text, click: on_join_ready_click});
            this.table.items.push({key: match.id, type: leave_type,       subtype: LEAVE,   text: leave_text,      click: on_leave_click});
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

