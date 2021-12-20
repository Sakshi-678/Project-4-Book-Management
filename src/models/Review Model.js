const mongoose = require('mongoose')

const reviewSchema=new mongoose.Schema({

    bookId:{type:mongoose.Schema.Types.ObjectId,ref:'BooksDB',required: true},
    reviewedBy:{type:String,trim:true,required:true,default:'Guest'},
    reviewedAt:{type:Date, required:true,default : Date.now()},
    rating:{type:Number,required:true,min:1,max:5},
    review:{type:String,trim:true,},
    isDeleted:{type:Boolean,default:false}

})

module.exports=mongoose.model('ReviewDB',reviewSchema)