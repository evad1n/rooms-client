const url = 'https://server-rooms.herokuapp.com'
//const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 1000

var Messaging = {
    props: ['route'],
    data: function () {
        return {
            newMessage: "",
            history: [],
            timer: "abc"
        }
    },
    methods: {
        sendMessage: function () {
            this.history.push({ 'user': app.username, 'text': this.newMessage })
            app.sendMessage(this.route, { "user": app.username, "text": this.newMessage }, this.history)
            this.newMessage = ""
        },
        getMessages: function () {
            app.getMessages(this.route, this.history)
        }
    },
    mounted() {
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
        page: "test",
        rooms: [
            "messages",
            "test"
        ],
        interval: 0,
        newMessage: "",
        messageHistory: [],
        gameMessageHistory: [],
        playerID: 0,
        username: "jimmy",
        characters: [],
        playerColor: "red",
        color: {
            "r": 0,
            "g": 0,
            "b": 0
        }
    },

    created: function () {
        fetch(`${url}/game/login`, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
        }).then(function (res) {
            res.json().then(function (data) {
                app.playerID = data.id
            });
        });

        this.interval = setInterval(() => {
            this.updateGame()
        }, UPDATE_INTERVAL);

        window.addEventListener("keyup", this.keyEvents);
    },

    methods: {
        onLeave: function () {
            fetch(`${url}/game/${app.playerID}`, {
                method: "DELETE",
            })
            return null
        },
        keyEvents: function (e) {
            if (this.page == "test") {
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
        goToMessages: function () {
            this.page = "messages"
        },
        goToTest: function () {
            this.page = "test"
            clearInterval(this.interval)
            this.interval = setInterval(() => {
                this.updateGame()
            }, UPDATE_INTERVAL);
        },
        updateGame: function () {
            fetch(`${url}/game`).then(function (res) {
                res.json().then(function (data) {
                    app.gameMessageHistory = data.history;
                    app.characters = data.characters;
                });
            });
        },
        getMessages: function (route, history) {
            fetch(`${url}/${route}`).then(function (res) {
                res.json().then(function (data) {
                    history = data.history;
                });
            });
        },
        sendMessage: function (route, message, history) {
            if (message.text != "") {
                fetch(`${url}/${route}`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: message })
                }).then(function () {
                    app.newMessage = ""
                    app.getMessages(route, history)
                });
            }
        },
        sendGameMessage: function () {
            if (this.newMessage != "") {
                fetch(`${url}/messages/${app.playerID}`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: app.newMessage })
                }).then(function () {
                    app.newMessage = ""
                    app.updateGame()
                });
            }
        },
        gameMove: function (move) {
            fetch(`${url}/game/${app.playerID}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ move: move })
            }).then(function () {
                app.updateGame()
            });
        },
        updateColor: function () {
            fetch(`${url}/game/color/${app.playerID}`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ color: color })
            }).then(function () {
                app.updateGame()
            });
        }
    },

    computed: {

    }
})

window.onbeforeunload = app.onLeave;