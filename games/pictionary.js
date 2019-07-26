//PICTIONARY
const PICTIONARY_INTERVAL = 50

var pictionary = new Vue({
    data: {
        colors: [
            "red", "orange", "yellow", "green", "blue", "purple", "black", "white"
        ],
        marker_color: "black",
        canvas: null,
        context: null,
        isDrawing: false,
        startPos: null,
        endPos: null,
        startLine: null,
        endLine: null,
        timer: null,
    },
    methods: {
        beginDrawing: function () {
            // start turn
            app.roomData.drawing = true
            app.roomData.startTime = new Date()
            this.startLine = null
            this.endLine = null
            this.startPos = null
            this.endPos = null
            console.log("begin")

            this.sendGameInfo()
        },
        mousedown: function (e) {
            if (app.roomData.turn.user == app.username && app.roomData.drawing) {
                var rect = this.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                this.isDrawing = true;
                this.startPos = { x: x, y: y }
                this.startLine = { x: x, y: y }
            }
        },
        mousemove: function (e) {
            if (app.roomData.turn.user == app.username && app.roomData.drawing) {
                var rect = this.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                if (this.isDrawing) {
                    this.context.beginPath();
                    this.context.moveTo(this.startPos.x, this.startPos.y);
                    this.context.lineTo(x, y);
                    this.context.lineWidth = 5;
                    this.context.lineCap = 'round';
                    this.context.strokeStyle = this.marker_color;
                    this.context.stroke();

                    this.startPos = { x: x, y: y }
                    this.endLine = { x: x, y: y }
                }
            }
        },
        mouseup: function (e) {
            if (app.roomData.turn.user == app.username) {
                this.isDrawing = false;
                this.endLine = null
            }
        },
        readyUp: function () {
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

            // link drawing tools
            this.canvas = app.$refs.canvas[0];
            this.context = this.canvas.getContext("2d");
            this.canvas.addEventListener('mousedown', this.mousedown);
            this.canvas.addEventListener('mousemove', this.mousemove);
            document.addEventListener('mouseup', this.mouseup);

            this.timer = setInterval(() => {
                pictionary.updateDrawing()
            }, PICTIONARY_INTERVAL);
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
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            app.roomData.winner = "none"
            app.roomData.started = false

            // Set starting user for next game
            app.roomData.first++
            app.roomData.first %= app.roomData.players.length
            app.roomData.turn.user = app.roomData.players[app.roomData.first].name
            app.roomData.turn.turn = app.roomData.first

            this.sendGameInfo()
            clearInterval(this.timer)
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
        updateDrawing: function () {
            // check if someone is drawing
            if (app.roomData.drawing) {

                // If this user is drawing
                if (app.roomData.turn.user == app.username) {
                    if (pictionary.isDrawing && pictionary.endLine == null) {
                        // send line to to the server
                        app.roomData.lines.push({ start: pictionary.startLine, end: pictionary.endLine, color: pictionary.marker_color })
                        // send data
                        pictionary.sendGameInfo()
                        pictionary.startLine = { x: pictionary.endLine.x, y: pictionary.endLine.y }
                    }
                }
                else {
                    // update drawing
                    for (let i = 0; i < app.roomData.lines.length; i++) {
                        var line = app.roomData.lines[i]

                        // draw line 
                        this.context.beginPath();
                        this.context.moveTo(line.start.x, line.start.y);
                        this.context.lineTo(line.end.x, line.end.y);
                        this.context.lineWidth = 5;
                        this.context.lineCap = 'round';
                        this.context.strokeStyle = line.color;
                        this.context.stroke();
                    }
                }
            } else {
                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    },
    computed: {
        secondsLeft: function() {
            if(app.roomData.drawing) {
                var ms = new Date().getTime() - new Date(app.roomData.startTime).getTime()
                return 5 - Math.max(Math.floor(ms / 1000), 0)
            }
            return 5
        }
    },
})