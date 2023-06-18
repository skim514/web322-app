/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Suna Kim        Student ID: 104690227      Date: June 17th, 2023
*
* Cyclic Web App URL: https://shy-blue-dalmatian-wrap.cyclic.app
*
* GitHub Repository URL: https://github.com/skim514/web322-app
*
********************************************************************************/

const blog = require('./blog-service.js');

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
var app = express();
var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { error } = require('console');

cloudinary.config({
    cloud_name: 'dif2ubgq2',
    api_key: '489533545835615',
    api_secret: 'vzRyDGL7nes9zGB7DgGJRrgj-TM',
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

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

app.get("/posts/add", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/addPost.html"));
    });

app.get("/blog", (req, res) => {
    blog.getPublishedPosts().then((filteredPosts) => {
    res.json(filteredPosts)
    })
})

app.get("/posts", (req, res) => {
    if(req.query.category){
        blog.getPostsByCategory(req.query.category).then((filteredCategories) => {
            res.json(filteredCategories)
        })

    }else if(req.query.minDate){
        blog.getPostsByMinDate(req.query.minDate).then((filteredDate) => {
            res.json(filteredDate)
        })
        
    }else{ // /posts
        blog.getAllPosts().then((posts) => {
            res.json(posts)
        })
    }
})
app.get("/post/:id", (req, res) => {
    blog.getPostsById(req.params.id).then((filteredID) => {
        res.json(filteredID)
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

app.post("/posts/add",upload.single("featureImage"), function(req,res){
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processPost(uploaded.url);
        });
    }else{
        processPost("");
    }
     
    function processPost(imageUrl){
        req.body.featureImage = imageUrl;
    
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blog.addPost(req.body).then((data)=>{
            res.redirect('/posts');
        }).catch((err) =>{
            res.send("ERROR!" + err)
        })
    }    
});

// setup http server to listen on HTTP_PORT
blog.initialize().then(()=>{app.listen(HTTP_PORT, onHttpStart)}).catch((err) =>{res.send("ERROR!" + err)});