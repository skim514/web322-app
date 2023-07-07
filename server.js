/*********************************************************************************
* WEB322 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Suna Kim        Student ID: 104690227      Date: July 5th, 2023
*
* Cyclic Web App URL: https://shy-blue-dalmatian-wrap.cyclic.app
*
* GitHub Repository URL: https://github.com/skim514/web322-app
*
********************************************************************************/

const exphbs = require('express-handlebars');
const blog = require('./blog-service.js');
const stripJs = require('strip-js');

var HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
var app = express();
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }        
    }
 }));
app.set('view engine', '.hbs');
var path = require("path");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { error } = require('console');
const env = require("dotenv");
env.config("/config");   

cloudinary.config({
    cloud_name: "",
    api_key: "",
    api_secret: "",
    secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage
app.use(express.urlencoded({ extended: true}));

function onHttpStart() {
   console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// setup a 'route' to listen on the default url path
 app.get("/", function (req, res) {
     res.redirect('/blog');
 });

 app.get("/about", function (req, res) {
     res.render('about', {
        layout: 'main'
     });
});

app.get("/posts/add", function (req, res) {
    res.render('addPost', {
        data: 'posts',
        layout: 'main'
    });
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {
        data: viewData,
        layout: 'main'
    });

});

app.get("/posts", (req, res) => {
    if(req.query.category){
        blog.getPostsByCategory(req.query.category).then((filteredCategories) => {
            res.render('posts', {
                data: filteredCategories,
            });
        })

    }else if(req.query.minDate){
        blog.getPostsByMinDate(req.query.minDate).then((filteredDate) => {
            res.render('posts', {
                data: filteredDate,
            });
        })
        
    }else{ // /posts
        blog.getAllPosts().then((posts) => {
            res.render('posts', {
                data: posts,
            });
        }).catch(() =>{
            res.render("posts", {message: "no results"})
        })
    }
})

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        viewData.post = await blog.getPostsById(req.params.id);
    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/categories", (req, res) => {
    blog.getCategories().then((categories) => {
    res.render('categories', {
        data: categories,
    });
    }).catch(() =>{
        res.render("categories", {message: "no results"})
    })
})

app.get("*", (req, res, next) => {
    //res.status(404).send("404, Page not found!");
    res.render('404', {
        data: '404',
        layout: 'main'
    });
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