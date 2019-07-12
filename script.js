//const url = 'https://server-rooms.herokuapp.com'
const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 1000

var PrivateRoomCategory = {
    name: 'PrivateRoomCategory',
    props: ['type', 'title'],
    data: function () {
        return {
            rooms: {},
            timer: "",
        }
    },
    methods: {
        updateRooms: function () {
            if(this.type == 'messages') {
                this.rooms = app.privateMessageRooms
            } else {
                this.rooms = app.privateGameRooms
            }
            //otherwise won't update rooms list
            this.$forceUpdate()
        }
    },
    mounted() {
        this.updateRooms()
        this.timer = setInterval(() => {
            this.updateRooms()
        }, UPDATE_INTERVAL);
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    template: `<v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn flat v-on="on">
                            {{title}}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-tile v-for="(room, index) in Object.keys(this.rooms)" :key="index" @click="app.switchRoom(room)">
                            <v-list-tile-title>{{ rooms[room].name }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>`
}

var Messaging = {
    name: 'Messaging',
    props: ['route'],
    data: function () {
        return {
            newMessage: "",
            history: [],
            users: [],
            timer: "",
        }
    },
    methods: {
        sendMessage: function () {
            app.sendMessage(this.route, { "user": app.username, "text": this.newMessage }, this.updateData)
            this.newMessage = ""
        },
        getMessages: function () {
            app.getMessages(this.route, this.updateData)
        },
        updateData: function (newHistory, newUsers) {
            this.history = newHistory
            this.users = newUsers
        },
        isLast: function (user) {
            return this.users[this.users.length - 1] == user
        }
    },
    mounted() {
        this.getMessages()
        this.timer = setInterval(() => {
            this.getMessages()
        }, UPDATE_INTERVAL);
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    template: `<v-card elevation="18">
                    <v-card-title class="headline justify-center text-uppercase">Chat</v-card-title>
                    <v-card-text v-for="message in this.history">
                        {{message.user}}: {{message.text}}
                    </v-card-text>
                    <v-card-text>
                        <v-text-field label="Type a message" v-model="newMessage" outline color="grey"
                            @keyup.enter="sendMessage()">
                        </v-text-field>
                        Current users:<span v-for="user in this.users"> {{user}}<span v-if="!isLast(user)">,</span></span>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block @click="sendMessage()">send</v-btn>
                    </v-card-actions>
                </v-card>`
}

var UserSearch = {
    name: 'UserSearch',
    data: function () {
        return {
            searchQuery: "",
            users: [],
            selected: "",
            timer: "",
        }
    },
    methods: {
        getUsers: function (callback) {
            fetch(`${url}/users`).then(function (res) {
                res.json().then(function (data) {
                    callback && callback(data.users)
                });
            });
        },
        updateData: function (newUsers) {
            this.users = newUsers
        },
        invite: function (name) {
            if (name != "") {
                console.log(name, " will be invited to " + app.page)
                fetch(`${url}/invites/${name}`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ room: `${app.page}`, from: app.username })
                })
            }
        }
    },
    mounted() {
        this.getUsers(this.updateData)
        this.timer = setInterval(() => {
            this.getUsers(this.updateData)
        }, UPDATE_INTERVAL);
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    template: `<v-card elevation="18">
                    <v-subheader class="pa-0">Add User to Room</v-subheader>
                    <v-autocomplete v-model="searchQuery" :items="users" no-data-text="No Users">
                        <template v-slot:append-outer>
                            <v-slide-x-reverse-transition mode="out-in">
                            </v-slide-x-reverse-transition>
                        </template>
                    </v-autocomplete>
                    <v-btn v-bind:disabled="searchQuery == '' || searchQuery == app.username" @click="invite(searchQuery)">Send Invite</v-btn>
                </v-card>`
}

var app = new Vue({
    el: "#app",
    components: {
        'messaging': Messaging,
        'usersearch': UserSearch,
        'privateroomcategory': PrivateRoomCategory,
    },

    data: {
        color: "deep-purple lighten-1",
        page: "login",
        publicRooms: [
            "home"
        ],
        games: [
            "pictionary", 
            "go"
        ],
        privateMessageRooms: {
        },
        privateGameRooms: {
        },
        welcome: true,
        testUsername: "",
        username: "",
        badName: false,
        globalTimer: "",
        invites: [],
        sidebars: [
            "invite",
            "chat"
        ],
        current_sidebar: "chat",
        sidebar: false,
    },

    created: function () {
        window.addEventListener("keyup", this.keyEvents);
    },

    methods: {
        refreshLogin: function () {
            fetch(`${url}/users`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            })
        },
        keyEvents: function (e) {
            if (this.page == "game") {
                if (e.which == 87) {
                    this.gameMove("up")
                } else if (e.which == 65) {
                    this.gameMove("left")
                } else if (e.which == 83) {
                    this.gameMove("down")
                } else if (e.which == 68) {
                    this.gameMove("right")
                }
            }
        },
        // Log user in
        checkUsername: function () {
            if (this.testUsername != "") {
                //check for valid username
                fetch(`${url}/users`).then(function (res) {
                    res.json().then(function (data) {
                        app.badName = false
                        for (let i = 0; i < data.users.length; i++) {
                            if (app.testUsername == data.users[i]) {
                                app.badName = true
                            }
                        }

                        if (!app.badName) {
                            app.username = app.testUsername
                            //post valid name
                            fetch(`${url}/users`, {
                                method: "POST",
                                headers: {
                                    "Content-type": "application/json"
                                },
                                body: JSON.stringify({ user: app.username })
                            }).then(function () {
                                //put user in messaging room
                                fetch(`${url}/home/users`, {
                                    method: "POST",
                                    headers: {
                                        "Content-type": "application/json"
                                    },
                                    body: JSON.stringify({ user: app.username })
                                }).then(function () {
                                    app.welcome = true
                                    app.page = "home"

                                    // START GLOBAL INTERVAL
                                    app.globalTimer = setInterval(() => {
                                        app.getInvites()
                                        app.refreshLogin()
                                    }, UPDATE_INTERVAL);

                                    //set personal chat room
                                    app.privateMessageRooms[`${app.username}-privateMessaging`] = { name: `${app.username}'s Chat Room` }
                                })
                            });
                        }
                    });
                });
            }
        },
        getInvites: function () {
            fetch(`${url}/invites/${app.username}`).then(function (res) {
                res.json().then(function (data) {
                    app.invites = data.invites
                });
            })
        },
        respondInvite: function (room, accepted) {
            //split room into host name and room type
            var roomHost = app.getRoomHost(room)
            var roomType = app.getRoomType(room)
            if (accepted) {
                if (roomType == "privateMessaging") {
                    app.privateMessageRooms[room] = { name: `${roomHost}'s Chat Room` }
                } else {
                    app.privateGameRooms[room] = { name: `${roomHost}'s ${roomType}` }
                }
            }

            fetch(`${url}/${room}/invite`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username, from: roomHost, accepted: accepted })
            }).then(function () {
                if (accepted) {
                    app.switchRoom(room)
                }
                app.getInvites()
            })
        },
        createGameRoom: function (room) {
            var roomName = `${app.username}-${room}`
            //set up game room
            app.privateGameRooms[roomName] = {name: `${app.username}'s ${room}`}
            //idk lol!
            app.switchRoom(roomName)
        },
        switchRoom: function (room) {
            //set old route
            var route = app.page

            //remove user from old room
            fetch(`${url}/${route}/users`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            })

            //set new route
            route = room

            //add user to new room
            fetch(`${url}/${route}/users`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            }).then(function () {
                app.page = room;
                app.welcome = false
            })
        },
        getRoomHost(room){
            var index = room.indexOf("-")
            var roomHost = room.substring(0, index)
            return roomHost
        },
        getRoomType(room){
            var index = room.indexOf("-")
            var roomType = room.substring(index + 1, room.length)
            return roomType
        },
        getMessages: function (route, callback) {
            fetch(`${url}/${route}/messaging`).then(function (res) {
                res.json().then(function (data) {
                    callback && callback(data.history, data.users)
                });
            });
        },
        sendMessage: function (route, message, callback) {
            if (message.text != "") {
                fetch(`${url}/${route}/messaging`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: message })
                }).then(function () {
                    callback && app.getMessages(route, callback)
                });
            }
        },
        updateGame: function () {
            fetch(`${url}/game`).then(function (res) {
                res.json().then(function (data) {
                    app.characters = data.characters;
                });
            });
        },
        gameMove: function (move) {
            if (this.characterCreated) {
                fetch(`${url}/game`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ move: move, user: app.username })
                }).then(function () {
                    app.updateGame()
                });
            }
        },
        createCharacter: function () {
            //set game timer
            this.interval = setInterval(() => {
                this.updateGame()
            }, UPDATE_INTERVAL);

            //create character for user
            fetch(`${url}/game/login`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username, color: color })
            }).then(function () {
                app.characterCreated = true
                app.updateGame()
            });
        }
    },

    computed: {

    }
})