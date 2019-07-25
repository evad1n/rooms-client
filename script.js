// const url = 'https://server-rooms.herokuapp.com'
const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 200

Vue.use(Vuetify)

var PrivateRoomCategory = {
    name: 'PrivateRoomCategory',
    props: ['type', 'title'],
    data: function () {
        return {

        }
    },
    methods: {
        isType: function (room) {
            var roomType = app.getRoomType(room)

            // if not a public room
            if (!app.rooms.includes(roomType)) {
                // if messaging
                if (roomType == 'privateMessaging' && this.type == 'messages') {
                    return true
                }
                if (roomType != 'privateMessaging' && this.type == 'games') {
                    return true
                }
            }

            return false
        },
    },
    template: `<v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn text v-on="on">
                            {{title}}
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(room, index) in app.rooms.filter(isType)" :key="index" @click="app.switchRoom(room)">
                            <v-list-item-title>{{app.getRoomName(room)}}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>`
}

var Messaging = {
    name: 'Messaging',
    props: ['route'],
    data: function () {
        return {
            newMessage: "",
            addSearchQuery: "",
            removeSearchQuery: "",
            height: 0,
            invitableUsers: [],
            canRemove: false,
            removableUsers: [],
            timer: null,
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
            // invite user to room
            fetch(`${url}/invites/${name}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ room: `${app.page}`, from: app.username })
            })
        },
        remove: function (name) {
            // remove user from room
            fetch(`${url}/${app.page}/users`, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: name })
            })
        },
        canInvite: function () {
            if (app.roomData.maxPlayers && app.roomData.users.length == app.roomData.maxPlayers) {
                return false
            }
            return app.getRoomHost(app.page) == app.username && app.page != 'home'
        },
        getData: function (callback) {
            var invitableUsers, canRemove, removableUsers
            fetch(`${url}/users`).then(function (res) {
                res.json().then(function (data) {
                    // Return all users with access to this room but this user
                    removableUsers = Object.keys(data.users).filter((user) => data.users[user].rooms.includes(app.page) && user != app.username)
                    // Return all users without access to this room
                    invitableUsers = Object.keys(data.users).filter((user) => !data.users[user].rooms.includes(app.page))
                    canRemove = removableUsers.length > 0 && app.getRoomHost(app.page) == app.username
                    callback(invitableUsers, canRemove, removableUsers)
                });
            })
        },
        updateData: function (invitableUsers, canRemove, removableUsers) {
            this.invitableUsers = invitableUsers
            this.canRemove = canRemove
            this.removableUsers = removableUsers
        }
    },
    mounted() {
        this.getData(this.updateData)
        this.timer = setInterval(() => {
            this.getData(this.updateData)
        }, UPDATE_INTERVAL);
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    template: `<v-card elevation="18" v-bind:color="app.primaryColor" light>
                    <v-card-title class="font-weight-bold headline justify-center text-uppercase">Chat</v-card-title>
                    <v-flex xs12 v-if="canInvite()" class="user-search" py-0 align-content-center>
                        <v-layout>
                            <v-flex xs3>
                                <p class="mt-3">Add User</p>
                            </v-flex>
                            <v-flex xs6>
                                <v-autocomplete outlined v-model="addSearchQuery" :items="invitableUsers" no-data-text="No Users" color="black" dense width="150px">
                                    <template v-slot:append-outer>
                                        <v-slide-x-reverse-transition mode="out-in">
                                        </v-slide-x-reverse-transition>
                                    </template>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex xs3>
                                <v-btn class="mt-2 float-right" v-bind:disabled="addSearchQuery == '' || invitableUsers.length == 0" @click="invite(addSearchQuery)" v-bind:color="app.secondaryColor">Invite</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <v-flex xs12 v-if="canRemove" class="user-search" py-0 align-content-center>
                        <v-layout>
                            <v-flex xs3>
                                <p class="mt-3">Remove User</p>
                            </v-flex>
                            <v-flex xs6>
                                <v-autocomplete outlined v-model="removeSearchQuery" :items="removableUsers" no-data-text="No Users" color="black" dense width="150px">
                                    <template v-slot:append-outer>
                                        <v-slide-x-reverse-transition mode="out-in">
                                        </v-slide-x-reverse-transition>
                                    </template>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex xs3>
                                <v-btn class="mt-2 float-right" v-bind:disabled="removeSearchQuery == ''" @click="remove(removeSearchQuery)" v-bind:color="app.secondaryColor">Kick</v-btn>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <div v-chat-scroll="{always: false, smooth: true}" v-if="app.roomData.messageHistory.length > 0" class="messages-container">
                        <p v-for="(message, index) in app.roomData.messageHistory" :key="index">
                            {{message.user}}: {{message.text}}
                        </p>
                    </div>
                    <v-card-text px-3>
                        <v-text-field hide-details outlined label="Type a message" v-model="newMessage" v-bind:color="app.secondaryColor"
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
    vuetify: new Vuetify({}),
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
        ],
        privateMessageRooms: {
        },
        privateGameRooms: {
        },
        testUsername: "",
        username: "",
        rooms: [],
        badName: false,
        globalTimer: "",
        invites: [],
        roomData: {
            messageHistory: [],
            users: []
        },
        offsetTop: 0
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
                                    app.page = "home"
                                    app.getRoomData()

                                    // START GLOBAL INTERVAL
                                    app.globalTimer = setInterval(() => {
                                        app.getInvites()
                                        app.refreshLogin()
                                        app.getRoomData()
                                        app.getRoomsAccess()
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

            // create new room
            fetch(`${url}/${roomName}/create`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            }).then(function () {
                app.switchRoom(roomName)
            })
        },
        switchRoom: function (room) {
            // If this is the same page
            if (room == app.page) {
                return
            }

            var oldRoom = app.page

            //add user to new room
            fetch(`${url}/${room}/users`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            }).then(function () {
                app.page = room;
                app.getRoomData()

                //remove user from old room
                fetch(`${url}/${oldRoom}/users`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ user: app.username })
                })
            })
        },
        // Get a nice name for a room
        getRoomName: function (room) {
            var roomType = this.getRoomType(room)
            var roomHost = this.getRoomHost(room)

            if (roomType == "privateMessaging") {
                return `${roomHost}'s Chat Room`
            } else {
                return `${roomHost}'s ${roomType}`
            }
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
        getRoomData: function () {
            fetch(`${url}/${app.page}/data`).then(function (res) {
                res.json().then(function (data) {
                    app.roomData = data.data
                    if (!app.roomData.players) {
                        app.roomData.players = []
                    }

                    //send user to home page if they are in a room they shouldn't be in
                    if (!app.roomData.users.includes(app.username)) {
                        // remove room from list of available rooms for user
                        if (app.privateMessageRooms[app.page]) {
                            delete app.privateMessageRooms[app.page]
                        }
                        if (app.privateGameRooms[app.page]) {
                            delete app.privateGameRooms[app.page]
                        }

                        app.switchRoom('home')
                    }
                });
            });
        },
        getRoomsAccess: function () {
            fetch(`${url}/${app.username}/access`).then(function (res) {
                res.json().then(function (data) {
                    app.rooms = data.access
                });
            });
        }
    },
})


// HELPER FUNCTIONS

// See if user is last in list
function isLast(user, list) {
    return list[list.length - 1] == user
}
