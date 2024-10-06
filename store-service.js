const fs = require('fs');
let items = [];
let categories = [];

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                return reject("unable to read file: items.json");
            }
            try {
                items = JSON.parse(data);
            } catch (parseErr) {
                return reject("error parsing items.json");
            }

            fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                if (err) {
                    return reject("unable to read file: categories.json");
                }
                try {
                    categories = JSON.parse(data);
                } catch (parseErr) {
                    return reject("error parsing categories.json");
                }

                resolve("Data initialized successfully");
            });
        });
    });
}

// Get all items
function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject("no results returned");
        }
        resolve(items);
    });
}

// Get published items
function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            return reject("no results returned");
        }
        resolve(publishedItems);
    });
}

// Get all categories
function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            return reject("no results returned");
        }
        resolve(categories);
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};
