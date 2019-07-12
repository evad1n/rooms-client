console.log('pictionary linked')

//PICTIONARY

var pictionary = new Vue({
    data: {
        pictionary: {
            players: [
                {
                    username: "Bob",
                    points: 4,
                    players_turn: false,
                }
            ]
        },

        colors: [
            "red", "orange", "yellow", "green", "blue", "purple", "black", "white"
        ],
        marker_color: "black",
        canvas: null,
        context: null,
        isDrawing: false,
        startX: 0,
        startY: 0,
        points: [],
    },
    methods: {
        activatePictionary: function () {
            this.canvas = this.$refs.canvas;
            this.context = this.canvas.getContext("2d");
            this.canvas.addEventListener('mousedown', this.mousedown);
            this.canvas.addEventListener('mousemove', this.mousemove);
            document.addEventListener('mouseup', this.mouseup);
        },
        mousedown: function (e) {
            var rect = this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;

            this.isDrawing = true;
            this.startX = x;
            this.startY = y;
            this.points.push({
                x: x,
                y: y
            });
        },
        mousemove: function (e) {
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
        },
        mouseup: function (e) {
            this.isDrawing = false;
            if (this.points.length > 0) {
                localStorage['points'] = JSON.stringify(this.points);
            }
        },
        resetPictionary: function () {
            this.canvas.width = this.canvas.width;
            this.points.length = 0;
        },
        getPictionary: function () {
            fetch(`${url}/${app.page}/game`).then(function (res) {
                res.json().then(function (data) {
                    app.pictionary = data.pictionary;
                });
            });
        },
        sendPictionary: function (pictionary) {
            fetch(`${url}/${app.page}/game`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({})
            }).then(function () {
                app.getPictionary()
            });
        },
    },
})