console.log('pictionary linked')

//PICTIONARY
const PICTIONARY_INTERVAL = 500

var pictionary = new Vue({
    data: {
        colors: [
            "red", "orange", "yellow", "green", "blue", "purple", "black", "white"
        ],
        marker_color: "black",
        canvas: null,
        context: null,
        isDrawing: false,
        isTurn: true,
        startX: 0,
        startY: 0,
        points: [],
        timer: null,
        seconds: 0,
        gameStartTimer: null
    },
    methods: {
        activatePictionary: function () {
            this.canvas = app.$refs.canvas[0];
            this.context = this.canvas.getContext("2d");
            this.canvas.addEventListener('mousedown', this.mousedown);
            this.canvas.addEventListener('mousemove', this.mousemove);
            document.addEventListener('mouseup', this.mouseup);

            //End ready timer
            clearInterval(this.gameStartTimer)

            //Start timer
            this.timer = setInterval(() => {
                pictionary.sendPictionary()
                pictionary.seconds += 0.5

                // END TURN
                if (pictionary.seconds > 30) {
                    pictionary.resetPictionary()
                    pictionary.seconds = 0
                }
            }, PICTIONARY_INTERVAL);
        },
        mousedown: function (e) {
            if (this.isTurn) {
                var rect = this.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                this.isDrawing = true;
                this.startX = x;
                this.startY = y;
                this.points.push({
                    x: x,
                    y: y
                })
            }
        },
        mousemove: function (e) {
            if (this.isTurn) {
                var rect = this.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                if (this.isDrawing) {
                    this.context.beginPath();
                    this.context.moveTo(this.startX, this.startY);
                    this.context.lineTo(x, y);
                    this.context.lineWidth = 5;
                    this.context.lineCap = 'round';
                    this.context.strokeStyle = this.marker_color;
                    this.context.stroke();

                    this.startX = x;
                    this.startY = y;
                    this.points.push({
                        x: x,
                        y: y
                    });
                }
            }
        },
        mouseup: function (e) {
            if (this.isTurn) {
                this.isDrawing = false;
                if (this.points.length > 0) {
                    localStorage['points'] = JSON.stringify(this.points);
                }
            }
        },
        resetPictionary: function () {
            this.canvas.width = this.canvas.width;
            this.points.length = 0;
        },
        getPictionary: function () {
            fetch(`${url}/${app.page}/game`).then(function (res) {
                res.json().then(function (data) {
                    console.log(data.context, data.points)
                });
            });
        },
        sendPictionary: function () {
            fetch(`${url}/${app.page}/game`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    context: pictionary.context,
                    points: pictionary.points
                })
            }).then(function () {
                pictionary.getPictionary()
            });
        },
        ready: function () {
            this.gameStartTimer = setInterval(() => {
                fetch(`${url}/${app.page}/game/start`).then(function (res) {
                    res.json().then(function (data) {
                        if (data.started) {
                            pictionary.activatePictionary()
                        }
                    });
                });
            }, 1000);
        },
        startGame: function () {
            //Start game
            fetch(`${url}/${app.page}/game/start`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    turn: 0,
                    started: true
                })
            })
        }
    },
})