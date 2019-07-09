var Vue = new Vue({
    el: "#app",

    data: {
        //BASIC
        pages: [
            "home", "pictionary", "go", "asteroids"
        ],

        //LOCALHOST
        username: "",
        new_message: "",
        selected_page: "asteroids",

        //GLOBAL
        users: [
            //SERVER should only send what is relevant to player's game
            {
                username: "Dave",
                playing: "asteroids",
            },
            {
                username: "Bob",
                playing: "pictionary",
            },
            {
                username: "John",
                playing: "go",
            }
        ],

        //PRIVATE TO GAME ASTEROIDS
        asteroids: {
            players: [
                {
                    username: "Dave",
                    points: 580,
                    alive: true,
                    location: {
                        x: 250,
                        y: 250,
                    },
                    rotation: 45,
                }
            ],
            chat: [
                {
                    sender: "Dave",
                    message: "Hello, everybody!",
                }
            ]
        },

        //PRIVATE TO GAME PICTIONARY
        pictionary: {
            players: [
                {
                    username: "Bob",
                    points: 4,
                    players_turn: false,
                }
            ],
            chat: [
                {
                    sender: "Bob",
                    message: "I am winning!",
                }
            ]
        },

        //PRIVATE TO GAME GO
        go: {
            players: [
                {
                    username: "John",
                    players_turn: true,
                }
            ],
            board: [

            ],
            chat: [
                {
                    sender: "John",
                    message: "How do you play this?",
                }
            ]
        },
    },

    methods: {

    },

    computed: {

    }
})