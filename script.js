//const url = 'https://server-rooms.herokuapp.com'
const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 200

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
            if (this.type == 'messages') {
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
            searchQuery: "",
            selected: "",
        }
    },
    methods: {
        sendMessage: function (message) {
            this.newMessage = ""
            if (message.text != "") {
                fetch(`${url}/${this.route}/messaging`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: message })
                })
            }
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
        },
        canInvite: function () {
            if(app.roomData.maxPlayers && app.roomData.users.length == app.roomData.maxPlayers) {
                return false
            }
            return app.getRoomHost(app.page) == app.username && app.page != 'home'
        },
        usersWithout: function () {
            //Return all users but this user
            return app.users.filter((user) => user != app.username)
        }
    },
    template: `<v-card elevation="18" v-bind:color="app.primaryColor">
                    <v-card-title class="font-weight-bold headline justify-center text-uppercase">Chat</v-card-title>
                    <v-flex xs12 v-if="canInvite()" class="user-search" py-0 align-content-center>
                        <p class="ma-0 mt-3">Add User</p>
                        <v-autocomplete v-model="searchQuery" :items="usersWithout()" no-data-text="No Users" color="black" dense width="150px">
                            <template v-slot:append-outer>
                                <v-slide-x-reverse-transition mode="out-in">
                                </v-slide-x-reverse-transition>
                            </template>
                        </v-autocomplete>
                        <v-btn block v-bind:disabled="searchQuery == ''" @click="invite(searchQuery)" v-bind:color="app.secondaryColor">Invite</v-btn>
                    </v-flex>
                    <p class="messages" v-for="message in app.roomData.messageHistory">
                        {{message.user}}: {{message.text}}
                    </p>
                    <v-card-text class="pb-0">
                        <v-text-field label="Type a message" v-model="newMessage" outline color="grey"
                            @keyup.enter="sendMessage({user: app.username, text: newMessage})">
                        </v-text-field>
                        Current users:<span v-for="user in app.roomData.users"> {{user}}<span v-if="!isLast(user, app.roomData.users)">,</span></span>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block @click="sendMessage({user: app.username, text: newMessage})" v-bind:color="app.secondaryColor">send</v-btn>
                    </v-card-actions>
                </v-card>`
}



//MAIN APP
var app = new Vue({
    el: "#app",
    components: {
        'messaging': Messaging,
        'privateroomcategory': PrivateRoomCategory,
    },

    data: {
        primaryColor: "light-green darken-3",
        secondaryColor: "light-green darken-1",
        tertiaryColor: "light-green lighten-2",
        page: "login",
        publicRooms: [
            "home"
        ],
        games: [
            "pictionary",
            "tictactoe",
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
        users: [],
        roomData: {
            messageHistory: [],
            users: []
        },
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
                                    app.getRoomData("home")
                                    app.welcome = true
                                    app.page = "home"

                                    // START GLOBAL INTERVAL
                                    app.globalTimer = setInterval(() => {
                                        app.getInvites()
                                        app.refreshLogin()
                                        app.getRoomData(app.page)
                                        app.getAllUsers()
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
        formatInvite: function (invite) {
            var from = this.getRoomHost(invite)
            var type = this.getRoomType(invite)
            if (type == "privateMessaging") {
                return `${from} invited you to chat!`
            }
            return `${from} invited you to play ${type}!`
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
            // set up game room
            var roomName = `${app.username}-${room}`
            app.privateGameRooms[roomName] = { name: `${app.username}'s ${room}` }

            // delete old game room
            fetch(`${url}/${app.username}-${room}/users`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json"
                },
            }).then(function () {
                app.switchRoom(roomName)
            })
        },
        switchRoom: function (room) {
            // If this is the same page
            if (room == app.page) {
                return
            }
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
                app.getRoomData(room)
                app.welcome = false
            })
        },
        getRoomHost(room) {
            var index = room.indexOf("-")
            var roomHost = room.substring(0, index)
            return roomHost
        },
        getRoomType(room) {
            var index = room.indexOf("-")
            var roomType = room.substring(index + 1, room.length)
            return roomType
        },
        getRoomData: function (room) {
            fetch(`${url}/${room}/data`).then(function (res) {
                res.json().then(function (data) {
                    app.roomData = data.data
                });
            });
        },
        getAllUsers: function () {
            fetch(`${url}/users`).then(function (res) {
                res.json().then(function (data) {
                    app.users = data.users
                });
            });
        },
    },

    computed: {

    }
})


// HELPER FUNCTIONS

// See if user is last in list
function isLast(user, list) {
    return list[list.length - 1] == user
}