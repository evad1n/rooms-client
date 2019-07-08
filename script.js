const url = 'https://server-rooms.herokuapp.com'
//const url = 'http://localhost:3000'

var app = new Vue({
    el: "#app",

    data: {
        page: "messages",
        rooms: [
            "messages",
            "test"
        ],
        drawer: false,
        newMessage: "",
        messageHistory: []
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
                });
            });
        },
        send: function () {
            fetch(`${url}/messaging`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({message: app.newMessage})
            }).then(function () {
                app.update()
            });
        },
    },

    computed: {

    }
})