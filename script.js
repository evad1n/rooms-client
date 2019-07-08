//const url = 'https://server-rooms.herokuapp.com'
const url = 'http://localhost:3000'

var app = new Vue({
    el: "#app",

    data: {
        page: "test",
        rooms: [
            "messages",
            "test"
        ],
        drawer: false,
        newMessage: "",
        messageHistory: [],
        position: {}
    },

    created: function () {
        var x = 0
        x = setInterval(() => {
            x++
            this.update()
        }, 1000);
    },

    methods: {
        update: function () {
            fetch(`${url}/messaging`).then(function (res) {
                res.json().then(function (data) {
                    app.messageHistory = data.history;
                    app.position = data.position;
                });
            });
        },
        send: function () {
            if (this.newMessage != "") {
                fetch(`${url}/messaging`, {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ message: app.newMessage })
                }).then(function () {
                    app.newMessage = ""
                    app.update()
                });
            }
        },
        moveLeft: function () {
            fetch(`${url}/game`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ move: "left" })
            }).then(function () {
                app.update()
            });
        },
        moveRight: function () {
            fetch(`${url}/game`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({ move: "right" })
            }).then(function () {
                app.update()
            });
        }
    },

    computed: {

    }
})