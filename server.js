/*********************************************************************************

WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Sujan Sharma 
Student ID: 157775222 
Date: 6th Oct 2024
Web App URL: http://sujansarma.com.np
GitHub Repository URL: https://github.com/NotSujanSharma/web322-app

********************************************************************************/

const express = require('express');
const store_service = require('./store-service')
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 9080;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');


// Middleware for handling active routes
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});


cloudinary.config({
    cloud_name: 'dw1mdkba7',
    api_key: '766169822434994',
    api_secret: 'pZzIUdMySQS9xUvpt_FljFI9dSM',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "item" objects
        let items = [];

        // if there's a "category" query, filter the returned items by category
        if (req.query.category) {
            // Obtain the published "item" by category
            items = await store_service.getPublishedItemsByCategory(req.query.category);
        } else {
            // Obtain the published "items"
            items = await store_service.getPublishedItems();
        }

        // sort the published items by itemDate
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

        // get the latest item from the front of the list (element 0)
        let item = items[0];

        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.items = items;
        viewData.item = item;
    } catch (err) {
        viewData.message = "no results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await store_service.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results";
    }

    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {
    let viewData = {
        post: null,
        posts: null,
        categories: null
    };

    try {
        let items;

        if (req.query.category) {
            items = await store_service.getPublishedItemsByCategory(req.query.category);
        } else {
            items = await store_service.getPublishedItems();
        }

        items.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        viewData.posts = items;

        viewData.post = await store_service.getItemById(req.params.id);

    } catch (err) {
        viewData.message = "no results";
    }

    try {
        let categories = await store_service.getCategories();
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }

    res.render("shop", {
        data: viewData
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        page: 'about'
    });
});
app.get('/items', (req, res) => {
    if (req.query.category) {
        store_service.getItemsByCategory(req.query.category)
            .then(items => {
                res.render('items', {items: items});
            })
            .catch(err => {
                res.render('items', {message: "no results"});
            });
    } else {
        store_service.getAllItems()
            .then(items => {
                res.render('items', {items: items});
            })
            .catch(err => {
                res.render('items', {message: "no results"});
            });
    }
});

app.get('/items/add', (req, res) => {
    store_service.getCategories()
        .then(categories => {
            res.render('addItem', {
                categories: categories,
                page: 'addItem'
            });
        })
        .catch(() => {
            res.render('addItem', {
                categories: [],
                page: 'addItem'
            });
        });
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
    if (req.file) {
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
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error uploading image");
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        store_service.addItem(req.body).then(() => {
            res.redirect('/items');
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error adding item");
        });
    }
});

app.get('/item/:id', (req, res) => {
    store_service.getItemById(req.params.id).then((item) => {
        res.render('item', { item: item });
    }).catch((err) => {
        console.error(err);
        res.status(404).send("Item not found");
    });
});

app.get('/categories', (req, res) => {
    store_service.getCategories()
        .then(categories => {
            res.render('categories', { categories: categories });
        })
        .catch(err => {
            res.render('categories', { message: "no results" });
        });
});
app.use((req, res) => {
    res.status(404).render('404');
});

store_service.initialize()
    .then((message) => {
        console.log(message);
        app.listen(PORT, () => {
            console.log(`Application listening to PORT ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    });