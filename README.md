# radium
Repository for backend cohort - Radium



    if (!isValid(rating)) {
        return res.status(400).send({ status: false, message: `Rating is required` })

    }

    if (!((rating > 0) && (rating < 6))) {
        return res.status(400).send({ status: false, message: `Rating  should be between 1 and 5.` })
    }

    const ReviewData = {}

    // ReviewData['$set']['bookId']=req.params.bookId

    if (isValid(rating)) {
        if (!Object.prototype.hasOwnProperty.call(ReviewData, '$set')) ReviewData['$set'] = {}
        ReviewData['$set']['rating'] = rating
    }

    if (isValid(reviewedBy)) {
        if (!Object.prototype.hasOwnProperty.call(ReviewData, '$set')) ReviewData['$set'] = {}
        ReviewData['$set']['reviewedBy'] = reviewedBy
    }

    if (isValid(review)) {
        if (!Object.prototype.hasOwnProperty.call(ReviewData, '$set')) ReviewData['$set'] = {}
        ReviewData['$set']['review'] = review
    }


    if (isDeleted !== undefined) {
        if (!Object.prototype.hasOwnProperty.call(ReviewData, '$set')) ReviewData['$set'] = {}

        ReviewData['$set']['isDeleted'] = isDeleted
        ReviewData['$set']['reviewedAt'] = isDeleted ? new Date() : null

    }

    const DataInsertedForReview = await ReviewModel.findOneAndUpdate({ _id: bookId }, ReviewData, { $inc: { 'post.review': 1 } }, { new: true })
    res.status(200).send({ status: true, data: DataInsertedForReview })

