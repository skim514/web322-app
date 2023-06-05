const fs = require("fs")
var categories = new Array()
var posts = []

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf8", (err, data) => {
            if (err) {
                reject(err).send("Unable to read file!")
            } else {
                posts = JSON.parse(data)
                resolve(posts)
            }
        })
    })
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf8", (err, data) => {
            if (err) {
                reject(err).send("No result returned!")
            } else {
                posts = JSON.parse(data)
                resolve(posts)
            }
        })
    })
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                const posts = JSON.parse(data);
                const filteredPosts = posts.filter(post => post.published === true);
                resolve(filteredPosts);
            }
        });
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/categories.json", "utf8", (err, data) => {
            if (err) {
                reject(err).send("No result returned!")
            } else {
                categories = JSON.parse(data)
                resolve(categories)
            }
        })
    })
}