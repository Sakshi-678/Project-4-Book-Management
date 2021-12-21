const BooksModel = require("../models/Books Model");
const UserModel = require("../models/User Model");
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

const createbook = async (req, res) => {

    try {
        let decodedUserToken = req.user
        const requestbody = req.body;
        if (!isValidRequestBody(requestbody)) {
            return res.status(400).send({ status: false, message: 'Please provide details in request body' })
        }
        //Authorisation
        if (!(decodedUserToken == requestbody.userId)) {
            return res.status(403).send({ Message: "you are trying to access a different's user account" })
        }
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = requestbody
         
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }
       
        const TitleinUse = await BooksModel.findOne({ title })
        if (TitleinUse) {
            return res.status(400).send({ status: false, message: "Title is already registered." })
        }
        
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: 'Excerpt is required' })
        }
      

        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: 'userId is required' })
        }

        const findUserId = await UserModel.findById(userId);
        if (!findUserId) {
            return res.status(400).send({ status: false, message: 'Not a valid UserId' })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: 'ISBN is required' })
        }

        const findISBN = await BooksModel.findOne({ ISBN });
        if (findISBN) {
            return res.status(400).send({ status: false, message: 'Given ISBN is already present.' })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: 'Category is required' })
        }

        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: 'SubCategory is required' })
        }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: 'Release Date is required' })
        }
        releasedAt=releasedAt.trim()
        const regex=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
        if(!regex.test(releasedAt))
        {
            return res.status(400).send({status:false,message:"Date format is not correct."})
        }
    

        //validation ends

        const Bookdata = { title, excerpt, userId, ISBN, category, subcategory, releasedAt }

        let Book = await BooksModel.create(Bookdata)

        res.status(201).send({ data: Book })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }

}

const getbooks = async (req, res) => {

    try {

        const queryParams = req.query
        const filterQuery = { isDeleted: false }
        if(!isValidRequestBody(queryParams))
        {
               let NDeleted=await BooksModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
                 res.status(200).send({ status: true, message: 'Not Deleted Books List', data: NDeleted })
                 return
        }

        const { userId, category, subcategory } = queryParams

        if(!isValidObjectId(userId))
       {
           return res.status(400).send({status:false,message:"User Id is not valid. Please enter it correctly"})
       }


        if (isValid(userId) && isValidObjectId(userId)) {
            filterQuery['userId'] = userId
        }

        if (isValid(category)) {
            filterQuery['category'] = category.trim()
        }

        if (isValid(subcategory)) {
            filterQuery['subcategory'] = subcategory.trim()
        }

        const Books = await BooksModel.find(filterQuery).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        if (Array.isArray(Books) && Books.length === 0) {
            return res.status(404).send({ status: false, message: 'No Books found' })

        }

        let SortedBook=Books.sort(function (a, b) { return a.title>b.title && 1 || -1 })
        res.status(200).send({ status: true, message: 'Books list', data: SortedBook })

    } catch (err) {
        res.status(500).send({ staus: false, msg: err.message })
    }
}

const getbookbyId = async (req, res) => {

    try {

        const bookId = req.params.bookId

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        let BookDetail = await BooksModel.findOne({ _id: bookId, isDeleted: false })


        if (!BookDetail) {
            return res.status(400).send({ status: false, message: "BookId is not correct or available in DB or this book is deleted" })
        }
        let FetchBook = {
            _id: BookDetail._id,
            title: BookDetail.title,
            excerpt: BookDetail.excerpt,
            userId: BookDetail.userId,
            ISBN: BookDetail.ISBN,
            category: BookDetail.category,
            subcategory: BookDetail.subcategory,
            reviews: BookDetail.reviews,
            deletedAt: BookDetail.deletedAt,
            releasedAt: BookDetail.releasedAt,
            createdAt: BookDetail.createdAt,
            updatedAt: BookDetail.updatedAt
        }

        let reviewsData = await ReviewModel.find({ bookId: bookId, isDeleted: false }).select({ isDeleted: 0, __v: 0 })

        FetchBook.reviewsData = reviewsData;
        res.status(200).send({ status: true, message: 'Books list', data: FetchBook })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const updatebooks = async (req, res) => {
    try{
    let decodedUserToken = req.user
    const requestBody = req.body;
    const bookId = req.params.bookId;

    if (!isValidObjectId(bookId)) {
        return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
    }

    const book = await BooksModel.findOne({ _id: bookId, isDeleted: false })

    if (!book) {
        return res.status(404).send({ status: false, message: `Book not found` })
    }
    //Authorisation
    if (!(decodedUserToken == book.userId)) {
        return res.status(403).send({ Message: "you are trying to access a different's user account" })
    }

    if (!isValidRequestBody(requestBody)) {
        return res.status(400).send({ status: false, message: 'No paramateres passed. Book unmodified'})
    }

    //Extract requestbody
    const { title, excerpt, releasedAt, ISBN } = requestBody;

    const upatedBookData = {}

    const TitleinUse = await BooksModel.findOne({ title })
    if (TitleinUse) {
        return res.status(400).send({ status: false, message: "Title is already registered." })
    }

    if(!isValid(title))
    {
        return res.status(400).send({ status: false, message: 'A valid Title is required' })
    }

    if (isValid(title)) {
        if (!Object.prototype.hasOwnProperty.call(upatedBookData, '$set')) upatedBookData['$set'] = {}
        upatedBookData['$set']['title'] = title
    }

    if(!isValid(excerpt))
    {
        return res.status(400).send({ status: false, message: 'Excerpt is required' })
    }

    if (isValid(excerpt)) {
        if (!Object.prototype.hasOwnProperty.call(upatedBookData, '$set')) upatedBookData['$set'] = {}
        upatedBookData['$set']['excerpt'] = excerpt
    }

    if(!isValid(releasedAt))
    {
        return res.status(400).send({ status: false, message: 'released date is required' })
    }

    if (isValid(releasedAt)) {
        if (!Object.prototype.hasOwnProperty.call(upatedBookData, '$set')) upatedBookData['$set'] = {}
        upatedBookData['$set']['releasedAt'] = releasedAt
    }
    const regex=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
    if(!regex.test(releasedAt))
    {
        return res.status(400).send({status:false,message:"Date format is not correct."})
    }

    const findISBN = await BooksModel.findOne({ ISBN });
    if (findISBN) {
        return res.status(400).send({ status: false, message: 'Given ISBN is already present.' })
    }

    if (isValid(ISBN)) {
        if (!Object.prototype.hasOwnProperty.call(upatedBookData, '$set')) upatedBookData['$set'] = {}
        upatedBookData['$set']['ISBN'] = ISBN
    }
     
   
    upatedBookData['$set']['updatedAt']=new Date()

    const upatedBook = await BooksModel.findOneAndUpdate({ _id: bookId }, upatedBookData,{ new: true })
    res.status(200).send({ status: true, message: 'Books updated successfully', data: upatedBook });

}catch(err)
{
    res.status(500).send({status:false,msg:err.message})
}

}

const deletebyBookId = async (req, res) => {

    try {
        let decodedUserToken = req.user
        const bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid book id` })
        }

        const book = await BooksModel.findOne({ _id: bookId, isDeleted: false })

        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found or it is deleted` })
        }

        //Authorisation
        if (!(decodedUserToken == book.userId)) {
            return res.status(403).send({ Message: "you are trying to access a different's user account" })
        }

        await BooksModel.findOneAndUpdate({ _id: bookId }, { $set: { isDeleted: true, deletedAt: new Date()} })
        res.status(200).send({ status: true, message: `Book deleted successfully` })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }

}
module.exports = { createbook, getbooks, getbookbyId, updatebooks, deletebyBookId }
