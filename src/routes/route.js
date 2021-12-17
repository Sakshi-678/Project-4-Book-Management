const express = require('express');

const router = express.Router();

const usercontroller=require("../controllers/UserController")
const bookcontroller=require("../controllers/BooksController")
const reviewcontroller=require("../controllers/ReviewController")
const Middleware=require("../middleware/Authentication")

router.get('/test-me', function (req, res) {
    res.send('My first ever api!')
});

//User API
router.post('/register',usercontroller.createUser)
router.post('/login',usercontroller.loginUser)

//Books API
router.post('/books',Middleware.UserAuth,bookcontroller.createbook)
router.get('/books',Middleware.UserAuth,bookcontroller.getbooks)
router.get('/books/:bookId',Middleware.UserAuth,bookcontroller.getbookbyId)
router.put('/books/:bookId',Middleware.UserAuth,bookcontroller.updatebooks)
router.delete('/books/:bookId',Middleware.UserAuth,bookcontroller.deletebyBookId)

//Review API
router.post('/books/:bookId/review',reviewcontroller.createReview)
router.put('/books/:bookId/review/:reviewId',reviewcontroller.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewcontroller.deletebyReviewId)

module.exports = router;