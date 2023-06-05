/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Suna Kim        Student ID: 104690227      Date: May 31th, 2023
*
* Cyclic Web App URL: https://jolly-bull-jumpsuit.cyclic.app
*
* GitHub Repository URL: https://github.com/skim514/web322-app
*
********************************************************************************/

const blog = require('./blog-service.js');

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
var app = express();
var path = require("path");

function onHttpStart() {
   console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// setup a 'route' to listen on the default url path
 app.get("/", function (req, res) {
     res.redirect('/about');
 });

 app.get("/about", function (req, res) {
     res.sendFile(path.join(__dirname, "/views/about.html"));
    });

app.get("/blog", (req, res) => {
    blog.getPublishedPosts().then((filteredPosts) => {
    res.json(filteredPosts)
    })
})

app.get("/posts", (req, res) => {
    blog.getAllPosts().then((posts) => {
    res.json(posts)
    })
})

app.get("/categories", (req, res) => {
    blog.getCategories().then((categories) => {
    res.json(categories)
    })
})

app.get("*", (req, res, next) => {
    res.status(404).send("404, Page not found!");
});

app.get("/", function(req,res){
    fileReader.fileReader("./posts.json").then((data) => {
        res.send(data)
    }).catch((err) =>{
        res.send("ERROR!"+ err)
    })
});