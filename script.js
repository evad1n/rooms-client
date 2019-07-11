const url = 'https://server-rooms.herokuapp.com'
//const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 1000

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
                    <v-card-title class="display-1 justify-center">Messaging</v-card-title>
                    <v-card-text v-for="message in this.history">
                        {{message.user}}: {{message.text}}
                    </v-card-text>
                    <v-card-text>
                        <v-text-field label="start typing" v-model="newMessage" outline color="grey"
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
                    body: JSON.stringify({ room: `${app.username}-${app.page}`, from: app.username })
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
    },

    data: {
        page: "login",
        rooms: {
            "main": {
                type: "public",
                host: ""
            },
            "privateMessaging": {
                type: "private",
                host: ""
            },
            "game": {
                type: "public",
                host: ""
            },
        },
        welcome: true,
        testUsername: "",
        username: "",
        badName: false,
        globalTimer: "",
        invites: [],
        characters: [],
        characterCreated: false,
        playerColor: "red",
        color: {
            "r": 255,
            "g": 0,
            "b": 0
        }
    },

    created: function () {
        window.addEventListener("keyup", this.keyEvents);
    },

    methods: {
        // When user closes page
        onLeave: function (e) {
            //if user has logged in
            if (app.username != "") {
                //get current room
                var currentRoom = app.page
                if (app.rooms[app.page].host != "") {
                    currentRoom = `${app.rooms[app.page].host}-${app.page}`
                }

                //log user off
                fetch(`${url}/users`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ user: app.username, room: currentRoom })
                })
            }
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
                        for (let index = 0; index < data.users.length; index++) {
                            if (app.testUsername == data.users[index]) {
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
                                body: JSON.stringify({ username: app.username })
                            }).then(function () {
                                //put user in messaging room
                                fetch(`${url}/main/users`, {
                                    method: "POST",
                                    headers: {
                                        "Content-type": "application/json"
                                    },
                                    body: JSON.stringify({ user: app.username })
                                }).then(function () {
                                    app.welcome = true
                                    app.page = "main"

                                    //check for invites
                                    app.globalTimer = setInterval(() => {
                                        app.getInvites()
                                    }, UPDATE_INTERVAL);

                                    //set private room hosts to all be this user
                                    Object.keys(app.rooms).forEach(room => {
                                        if (app.rooms[room].type == "private") {
                                            app.rooms[room].host = app.username
                                        }
                                    });
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
        acceptInvite: function (room) {
            //split room into host name and room type
            var index = room.indexOf("-")
            var roomHost = room.substring(0, index)
            var roomType = room.substring(index + 1, room.length)
            app.rooms[roomType].host = roomHost

            fetch(`${url}/${room}/invite`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username, from: roomHost })
            }).then(function () {
                switchRoom(roomType)
            })
        },
        declineInvite: function (room) {
            //split room into host name and room type
            var index = room.indexOf("-")
            var roomHost = room.substring(0, index)

            fetch(`${url}/invites/${app.username}`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ room: room, from: roomHost })
            }).then(function () {
                app.getInvites()
            })
        },
        switchRoom: function (room) {
            if (this.page == "game") {
                app.characterCreated = false
                clearInterval(app.interval)
            }

            //set old route
            var route = app.page
            if (app.rooms[app.page].type == "private") {
                //for private rooms
                route = `${app.rooms[app.page].host}-${app.page}`
            }

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
            if (app.rooms[room].type == "private") {
                //for private rooms
                route = `${app.rooms[room].host}-${room}`
            }

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
        getMessages: function (route, callback) {
            if (app.rooms[app.page].type == "private") {
                route = `${app.rooms[app.page].host}-${app.page}`
            }

            fetch(`${url}/${route}/messaging`).then(function (res) {
                res.json().then(function (data) {
                    callback && callback(data.history, data.users)
                });
            });
        },
        sendMessage: function (route, message, callback) {
            if (message.text != "") {
                if (app.rooms[app.page].type == "private") {
                    route = `${app.rooms[app.page].host}-${app.page}`
                }

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
                body: JSON.stringify({ username: app.username, color: color })
            }).then(function () {
                app.characterCreated = true
                app.updateGame()
            });
        }
    },

    computed: {

    }
})

window.onbeforeunload = app.onLeave;