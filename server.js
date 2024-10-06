const express = require('express');
const store_service = require('./store-service')
const path = require('path');
const PORT = process.env.PORT || 9080;

const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/about.html'));
})
app.get('/items', (req, res) => {
    store_service.getAllItems()
        .then((items) => {
            res.send(items);
        })
        .catch((err) => {
            res.send(err);
        });

})
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
