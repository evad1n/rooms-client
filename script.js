const url = 'https://collector-blog-will.herokuapp.com'
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
        newMessage: ""
    },

    created: function () {

    },

    methods: {
        update: function () {
            fetch(`${url}/posts`).then(function (res) {
                res.json().then(function (data) {
                    app.posts = data.posts;
                });
            });
        },
        send: function () {
            var new_post = {
                title: this.new_title,
                author: this.new_author,
                category: this.new_category,
                date: new Date(),
                image: this.new_image,
                text: this.new_text,
            };
            fetch(`${url}/posts`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(new_post)
            }).then(function () {
                app.new_title = "";
                app.new_author = "";
                app.category = "all";
                app.new_image = "";
                app.new_text = "";
                app.page = "blog";
                app.getPosts();
            });
        },
    },

    computed: {

    }
})