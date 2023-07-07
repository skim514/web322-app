const fs = require("fs")
var categories = new Array()
var posts = new Array()

module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        fs.readFile("./data/posts.json", "utf8", (err, data) => {
            if (err) {
                reject(err).send("Unable to read file!")
            } else {
                posts = JSON.parse(data)
                fs.readFile("./data/categories.json", "utf8", (err, data) => {
                    if (err) {
                        reject(err).send("No result returned!")
                    } else {
                        categories = JSON.parse(data)
                        resolve()
                    }
                })
            }
        })
    })
}

module.exports.getAllPosts = function() {
    return new Promise((resolve, reject) => {
        if(posts.length > 0){
            resolve(posts)
        }else{
            reject("No result returned!");
        }
    })
}

module.exports.getPublishedPosts = function() {
    return new Promise((resolve, reject) => {
        filteredPosts = posts.filter(post => post.published === true);
        if(filteredPosts.length > 0){
            resolve(filteredPosts);
        }else{
            reject("No result returned!");
        }
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if(categories.length > 0){
            resolve(categories) 
        }else{
            reject("No result returned!");
        }
    })
}

module.exports.addPost = function(postData) {
    return new Promise((resolve, reject) => {

            if(!postData.published){
                postData.published = false;
            }else{
                postData.published = true;
            }
            postData.id = posts.length+1;

            postData.postDate = new Date().toLocaleDateString('fr-CA');
            // const year = postData.postData.getFullYear();
            // const month = postData.postData.getMonth();
            // const day = postData.postData.getDay();
            // postData.postData = `${year}-${month}-${day}`;
            
            posts.push(postData);
            resolve();
    })
}

module.exports.getPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        filteredCategories = posts.filter(post => post.category == category);
        if(filteredCategories.length > 0){
            resolve(filteredCategories);
        }else{
            reject("No result returned!");
        }
    });
};

module.exports.getPostsByMinDate = function(date) {
    return new Promise((resolve, reject) => {
        filteredDate = posts.filter(post => post.postDate >= date);
        if(filteredDate.length > 0){
            resolve(filteredDate);
        }else{
            reject("No result returned!");
        }
    });
};

module.exports.getPostsById = function(id) {
    return new Promise((resolve, reject) => {
        filteredID = posts.filter(post => post.id == id);
        if(filteredID.length > 0){
            resolve(filteredID[0]);
        }else{
            reject("No result returned!");
        }
    });
};

module.exports.getPublishedPostsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        filteredCategories = posts.filter(post => post.published == true && post.category == category);
        if(filteredCategories.length > 0){
            resolve(filteredCategories);
        }else{
            reject("No result returned!");
        }
    });
};