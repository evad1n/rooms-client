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
        startX: 0,
        startY: 0,
        timer: null,
        seconds: 0,
        lines: [],
    },
    methods: {
        beginDrawing: function () {
            this.canvas = app.$refs.canvas[0];
            this.context = this.canvas.getContext("2d");
            this.canvas.addEventListener('mousedown', this.mousedown);
            this.canvas.addEventListener('mousemove', this.mousemove);
            document.addEventListener('mouseup', this.mouseup);

            app.roomData.drawing = true

            //Start timer
            this.timer = setInterval(() => {
                pictionary.seconds += 0.5

                // Send data as image
                //app.roomData.canvas = this.canvas.toDataURL('image/png');
                //read in image to canvas
                //this.context.drawImage(app.roomData.canvas, 0, 0)

                // END TURN
                if (pictionary.seconds > 30) {
                    pictionary.endDrawing()
                    pictionary.seconds = 0
                }
            }, PICTIONARY_INTERVAL);
        },
        endDrawing: function () {
            app.roomData.drawing = false
            this.canvas.removeEventListener('mousedown', this.mousedown);
            this.canvas.removeEventListener('mousemove', this.mousemove);
            document.removeEventListener('mouseup', this.mouseup);
            clearInterval(this.timer)
        },
        mousedown: function (e) {
            if (app.roomData.turn.user == app.username) {
                var rect = this.canvas.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                this.isDrawing = true;
                this.startX = x;
                this.startY = y;
            }
        },
        mousemove: function (e) {
            if (app.roomData.turn.user == app.username) {
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
                }
            }
        },
        mouseup: function (e) {
            if (app.roomData.turn.user == app.username) {
                this.isDrawing = false;
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
            app.roomData.canvas = null
            app.roomData.winner = "none"
            app.roomData.started = false

            // Set starting user for next game
            app.roomData.first++
            app.roomData.first %= app.roomData.players.length
            app.roomData.turn.user = app.roomData.players[app.roomData.first].name
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
        test: function () {
            // Send data as image
            app.roomData.canvas = this.canvas.toDataURL('image/png');
            console.log(app.roomData.canvas)
            //read in image to canvas
            this.context.drawImage(this.canvas, 0, 0)

            //http://code-and.coffee/post/2015/collaborative-drawing-canvas-node-websocket/
        }
    },
})


//     // register mouse event handlers
//     canvas.onmousedown = function(e){ mouse.click = true; };
//     canvas.onmouseup = function(e){ mouse.click = false; };

//     canvas.onmousemove = function(e) {
//        // normalize mouse position to range 0.0 - 1.0
//        mouse.pos.x = e.clientX / width;
//        mouse.pos.y = e.clientY / height;
//        mouse.move = true;
//     };

//     // draw line received from server
//      socket.on('draw_line', function (data) {
//        var line = data.line;
//        context.beginPath();
//        context.moveTo(line[0].x * width, line[0].y * height);
//        context.lineTo(line[1].x * width, line[1].y * height);
//        context.stroke();
//     });

//     // main loop, running every 25ms
//     function mainLoop() {
//        // check if the user is drawing
//        if (mouse.click && mouse.move && mouse.pos_prev) {
//           // send line to to the server
//           socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
//           mouse.move = false;
//        }
//        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
//        setTimeout(mainLoop, 25);
//     }
//     mainLoop();
//  });

function getDrawingLoop() {
    // check if someone is drawing
    if (app.roomData.drawing) {
        var diff = app.roomData.lines.length - pictionary.lines.length
        // if there are new lines
        if (diff > 0) {
            // add to drawing
            for (let i = 0; i < diff; i++) {
                var line = app.roomData.lines[pictionary.lines.length + i]
                pictionary.lines.push(line)

                // draw line 
                context.beginPath();
                context.moveTo(line[0].x * width, line[0].y * height);
                context.lineTo(line[1].x * width, line[1].y * height);
                context.stroke();
            }
        }

        // run every 25 ms
        setTimeout(getDrawingLoop, 25);
    }
}

function sendDrawingLoop() {
    // check if someone is drawing
    if (app.roomData.drawing && app.roomData.turn.user == app.username) {
        app.roomData.lines = pictionary.lines
        
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', { line: [mouse.pos, mouse.pos_prev] });
            mouse.move = false;
        }
        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };

        // run every 25 ms
        setTimeout(sendDrawingLoop, 25);
    }
}