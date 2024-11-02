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
const app = express();

const PORT = process.env.PORT || 9080;

cloudinary.config({
    cloud_name: 'dw1mdkba7',
    api_key: '766169822434994',
    api_secret: 'pZzIUdMySQS9xUvpt_FljFI9dSM',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
})
app.get('/items', (req, res) => {
    if (req.query.category) {
        store_service.getItemsByCategory(req.query.category).then((items) => {
            res.json(items);
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error getting items by category");
        });
    } else if (req.query.minDate) {
        store_service.getItemsByMinDate(req.query.minDate).then((items) => {
            res.json(items);
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error getting items by date");
        });
    } else {
        store_service.getAllItems().then((items) => {
            res.json(items);
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error getting all items");
        });
    }
});
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
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
        store_service.addItem(req.body).then((newItem) => {
            res.redirect('/items');
        }).catch((err) => {
            console.error(err);
            res.status(500).send("Error adding item");
        });
    }
});

app.get('/item/:id', (req, res) => {
    store_service.getItemById(req.params.id).then((item) => {
        res.json(item);
    }).catch((err) => {
        console.error(err);
        res.status(404).send("Item not found");
    });
});

app.get('/categories', (req, res) => {
    store_service.getCategories()
        .then((categories) => {
            res.send(categories);
        })
        .catch((err) => {
            res.send(err);
        });

})
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/404.html'));
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
