/*********************************************************************************


Name: Sujan Sharma 
Date: 11th December 2024


********************************************************************************/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String
        }
    ]
});

let User; // to be defined on new connection

// Initialize function to connect to MongoDB
function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://sujansharma2060:zSMJJ2YqJMpgDZDY@cluster0.d2d6z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // Replace with your connection string

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
}

// Register new user with password hashing
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
            return;
        }

        // Hash the password
        bcrypt.hash(userData.password, 10)
            .then(hash => {
                // Store hash instead of plain-text password
                userData.password = hash;

                // Create a new user
                let newUser = new User(userData);

                newUser.save()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        if (err.code === 11000) {
                            reject("User Name already taken");
                        } else {
                            reject(`There was an error creating the user: ${err}`);
                        }
                    });
            })
            .catch(err => {
                reject("There was an error encrypting the password");
            });
    });
}

// Check user credentials with hashed password comparison
function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                    return;
                }

                const user = users[0];

                // Compare hashed password
                bcrypt.compare(userData.password, user.password)
                    .then((result) => {
                        if (!result) {
                            reject(`Incorrect Password for user: ${userData.userName}`);
                            return;
                        }

                        // Password matches, update login history
                        user.loginHistory.push({
                            dateTime: new Date().toString(),
                            userAgent: userData.userAgent
                        });

                        // Update user's login history
                        User.updateOne(
                            { userName: user.userName },
                            { $set: { loginHistory: user.loginHistory } }
                        )
                            .exec()
                            .then(() => {
                                resolve(user);
                            })
                            .catch((err) => {
                                reject(`There was an error verifying the user: ${err}`);
                            });
                    })
                    .catch(err => {
                        reject(`There was an error verifying the password: ${err}`);
                    });
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
}

module.exports = {
    initialize,
    registerUser,
    checkUser
};