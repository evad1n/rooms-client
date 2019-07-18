var tictactoe = new Vue({
    data: {

    },
    methods: {
        selectTile: function (index) {
            if (app.roomData.started && app.roomData.tiles[index] == "" && app.roomData.turn.user == app.username && app.roomData.winner == "none") {
                var isX = ((app.roomData.turn.turn + 1) % app.roomData.maxPlayers == 1)
                isX ? app.roomData.tiles[index] = "X" : app.roomData.tiles[index] = "O";

                //send game info
                this.sendGameInfo()
            }
        },
        readyUp: function () {
            this.ready = true;

            // Say that you are ready
            fetch(`${url}/${app.page}/game/ready`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    user: app.username
                })
            })
        },
        start: function () {
            //Start game
            fetch(`${url}/${app.page}/game/start`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
            })
        },
        reset: function () {
            app.roomData.tiles = [
                "", "", "",
                "", "", "",
                "", "", "",
            ]
            app.roomData.winner = "none"
            app.roomData.started = false

            // Set starting user for next game
            app.roomData.first++
            app.roomData.first %= app.roomData.maxPlayers
            app.roomData.turn.user = Object.keys(app.roomData.players)[app.roomData.first]
            app.roomData.turn.turn = app.roomData.first

            this.sendGameInfo()
        },
        sendGameInfo: function () {
            fetch(`${url}/${app.page}/game`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    data: app.roomData
                })
            })
        },
    },
})