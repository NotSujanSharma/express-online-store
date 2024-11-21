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

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        if (!itemData) {
            reject("Item data is required");
        } else {
            itemData.published = itemData.published ? true : false;
            itemData.id = items.length + 1;
            const date = new Date();
            itemData.postDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            items.push(itemData);
            resolve(itemData);
        }
    });
}

function getItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}


function getItemById(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (item) {
            resolve(item);
        } else {
            reject("no result returned");
        }
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

function getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item =>
            item.published === true && item.category === parseInt(category)
        );

        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("no results returned");
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories,
    getItemsByCategory,
    getItemsByMinDate,
    getItemById,
    addItem,
    getPublishedItemsByCategory
};
