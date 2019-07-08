const url = 'https://server-rooms.herokuapp.com'
//const url = 'http://localhost:3000'

const UPDATE_INTERVAL = 1000

var app = new Vue({
    el: "#app",

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
            clearInterval(this.interval)
            this.interval = setInterval(() => {
                this.getMessages()
            }, UPDATE_INTERVAL);
        },
        goToTest: function () {
            this.page = "test"
            clearInterval(this.interval)
            this.interval = setInterval(() => {
                this.updateGame()
            }, UPDATE_INTERVAL);
        },
        getMessages: function () {
            fetch(`${url}/messaging`).then(function (res) {
                res.json().then(function (data) {
                    app.messageHistory = data.history;
                });
            });
        },
        updateGame: function () {
            fetch(`${url}/game`).then(function (res) {
                res.json().then(function (data) {
                    app.gameMessageHistory = data.history;
                    app.characters = data.characters;
                });
            });
        },
        sendMessage: function () {
            if (this.newMessage != "") {
                fetch(`${url}/messaging`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: app.newMessage })
                }).then(function () {
                    app.newMessage = ""
                    app.getMessages()
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