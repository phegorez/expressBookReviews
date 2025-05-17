const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
  //write code to check is the username is valid
  //username should be alphanumeric and at least 6 characters long
  if (username.length < 6) {
    return 'username should be at least 6 characters long';
  }
  //username should not contain special characters
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(username)) {
    return 'username should not contain special characters';
  }
  //username should not contain spaces
  if (username.includes(" ")) {
    return 'username should not contain spaces';
  }
  //username should not be empty
  if (username.length === 0) {
    return 'username should not be empty';
  }
  //username should not be already taken
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return 'username already taken';
  }
  return 'valid';
}

const authenticatedUser = (username, password) => { //returns boolean
  //write code to check if username and password match the one we have in records.
  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    return true;
  }
  return false;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  //Write your code here
  const { username, password } = req.body;
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  // Check if username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }
  // Check if user exists and password is correct
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  // Generate a token
  const token = jwt.sign({ username, password }, 'secretkey', { expiresIn: '1h' });
  // Send the token to the user
  return res.status(200).json({ message: "User logged in successfully", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const { review } = req.body;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Verify the token
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const username = decoded.username;
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Add the review
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added successfully", book: books[isbn] });
  });
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const { isbn } = req.params;
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Verify the token
  jwt.verify(token, 'secretkey', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const username = decoded.username;
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the review exists
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found" });
    }
    // Delete the review
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully", book: books[isbn] });
  });
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
