const BooksModel = require("../models/Books Model");
const ReviewModel = require("../models/Review Model")
const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const createReview = async (req, res) => {
    try {

        const bookId = req.params.bookId;
        const requestbody = req.body;


        if(!isValidObjectId(bookId))
        {
            return res.status(400).send({ status: false, message: 'Invalid Book Id' })
        }

        const BookExist = await BooksModel.findById({ _id: bookId, isDeleted: false })
        if (!BookExist) {
            return res.status(400).send({ status: false, message: "Either bookId is not present in DB or book is deleted" })
        }

        if (!isValidRequestBody(requestbody)) {
            return res.status(400).send({ status: false, message: 'Please provide details in request body' })
        }

        const { reviewedBy, rating, review, isDeleted } = requestbody;

        if (!isValid(rating)) {
            return res.status(400).send({ status: false, message: `Rating is required` })

        }

        if (!((rating > 0) && (rating < 6))) {
            return res.status(400).send({ status: false, message: `Rating  should be between 1 and 5.` })
        }


        let ReviewDetails = { bookId, reviewedBy, rating, review, isDeleted }

        const DataInsertedForReview = await ReviewModel.create(ReviewDetails)
        await BooksModel.findOneAndUpdate({ _id: bookId }, { $inc: { 'reviews': 1 } }, { new: true })
        res.status(200).send({ status: true, data: DataInsertedForReview })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }

}

const updateReview = async (req, res) => {
    try {

        const requestBody = req.body;
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
        }

        const book = await BooksModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        const reviewD = await ReviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewD) {
            return res.status(404).send({ status: false, message: `Review not found` })
        }

        bookId == reviewD.bookId
        if (!(bookId == reviewD.bookId)) {
            return res.status(400).send({ status: false, Message: "Reviewer Id is not valid" })
        }

        const { review, rating, reviewedBy } = requestBody;

        const upatedReviewData = {}

        if (isValid(review)) {
            if (!Object.prototype.hasOwnProperty.call(upatedReviewData, '$set')) upatedReviewData['$set'] = {}
            upatedReviewData['$set']['review'] = review
        }

        if (isValid(rating)) {
            if (!Object.prototype.hasOwnProperty.call(upatedReviewData, '$set')) upatedReviewData['$set'] = {}
            upatedReviewData['$set']['rating'] = rating
        }

        if (!((rating > 0) && (rating < 6))) {
            return res.status(400).send({ status: false, message: `Rating  should be between 1 and 5.` })
        }

        if (isValid(reviewedBy)) {
            if (!Object.prototype.hasOwnProperty.call(upatedReviewData, '$set')) upatedReviewData['$set'] = {}
            upatedReviewData['$set']['reviewedBy'] = reviewedBy
        }

        const UpdatedReview = await ReviewModel.findOneAndUpdate({ _id: reviewId }, upatedReviewData, { new: true })
        res.status(200).send({ status: true, message: 'Review updated successfully', data: UpdatedReview });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const deletebyReviewId = async (req, res) => {

    try {

        const requestBody = req.body;
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: `${reviewId} is not a valid review id` })
        }

        const book = await BooksModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        const reviewD = await ReviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!reviewD) {
            return res.status(404).send({ status: false, message: `Review not found or it is deleted` })
        }

        let vReviewer=(bookId==reviewD.bookId)
        if(!vReviewer)
        {
            return res.status(400).send({status:false,Message:"Reviewer Id is not valid"})
        }

        await ReviewModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true, } })
        await BooksModel.findOneAndUpdate({ _id: bookId }, { $inc: { 'reviews': -1 } }, { new: true })
        res.status(200).send({ status: true, message: `Review deleted successfully` })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createReview, updateReview, deletebyReviewId }
