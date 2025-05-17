const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  //Write your code here
  const { username, password } = req.body;
  // Check if username is valid
  if (!isValid(username) === 'valid') {
    return res.status(400).json({ message: isValid(username) });
  }
  // Check if username already exists
  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: "Username already exists" });
  }
  // Add new user to the users array
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  let bookList = Object.values(books);
  try {
    return res.status(300).json({ bookList });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  try {
    if (books[isbn]) {
      return res.status(200).json({ book: books[isbn] });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  let author = req.params.author.trim().replace(' ', '').toLocaleLowerCase();
  // console.log(author)
  try {
    let booksByAuthor = Object.values(books).filter(book => book.author.trim().replace(' ', '').toLocaleLowerCase() === author);
    if (booksByAuthor.length > 0) {
      return res.status(200).json({ books: booksByAuthor });
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  let title = req.params.title.trim().replace(' ', '').toLocaleLowerCase();
  try {
    let booksByTitle = Object.values(books).filter(book => book.title.trim().replace(' ', '').toLocaleLowerCase() === title);
    if (booksByTitle.length > 0) {
      return res.status(200).json({ books: booksByTitle });
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  // 1: { "author": "Chinua Achebe", "title": "Things Fall Apart", "reviews": {"user": "Bob", "comment": "It's good book"} },
  let isbn = req.params.isbn;
  if (books[isbn]) {
    let reviews = books[isbn].reviews;
    if (Object.keys(reviews).length > 0) {
      return res.status(200).json({ reviews });
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
