const url = 'https://server-rooms.herokuapp.com'
//const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 1000

var Messaging = {
    props: ['route'],
    data: function () {
        return {
            newMessage: "",
            history: [],
            users: [],
            timer: "",
            bool: true
        }
    },
    methods: {
        sendMessage: function () {
            app.sendMessage(this.route, { "user": app.username, "text": this.newMessage }, this.updateData)
            this.newMessage = ""
        },
        getMessages: function () {
            //console.log("mounted getMessage ", this.route)
            app.getMessages(this.route, this.updateData)
        },
        updateData: function (newHistory, newUsers) {
            this.history = newHistory
            this.users = newUsers
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
                        Current users:<span v-for="user in this.users"> {{user}}<span v-if="this.bool">,</span></span>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn block @click="sendMessage()">send</v-btn>
                    </v-card-actions>
                </v-card>`
}

var app = new Vue({
    el: "#app",
    components: {
        'messaging': Messaging
    },

    data: {
        page: "login",
        rooms: [
            "globalMessaging",
            "otherMessaging",
            "game"
        ],
        welcome: true,
        testUsername: "",
        username: "",
        badName: false,
        characters: [],
        characterCreated: false,
        interval: "",
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
        onLeave: function (e) {
            e.preventDefault();
            
            if (app.username != "") {
                //remove user from last room
                fetch(`${url}/${app.page}/users`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ user: app.username })
                })

                //remove user from global users
                fetch(`${url}/users`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ user: app.username })
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
                                fetch(`${url}/globalMessaging/users`, {
                                    method: "POST",
                                    headers: {
                                        "Content-type": "application/json"
                                    },
                                    body: JSON.stringify({ user: app.username })
                                }).then(function() {
                                    app.welcome = true
                                    app.page = "globalMessaging"
                                })
                            });
                        }
                    });
                });
            }
        },
        switchRoom: function (room) {
            if (this.page == "game") {
                app.characterCreated = false
                clearInterval(app.interval)
            }

            //remove user from old room
            fetch(`${url}/${app.page}/users`, {
                method: "PUT",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ user: app.username })
            })

            //add user to new room
            fetch(`${url}/${room}/users`, {
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