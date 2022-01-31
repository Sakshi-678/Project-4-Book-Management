const mongoose = require('mongoose')

const bookSchema=new mongoose.Schema({
    title:{type:String,trim:true,required:true,unique:true},
    excerpt:{type:String,trim:true,required:true},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'UserDB',required: true},
    ISBN:{type:String,trim:true,required:true,unique:true},
    category:{type:String,trim:true,required:true},
    subcategory:{type:String,trim:true,required:true},
    reviews:{type:Number,default:0},
    deletedAt:{type:Date,default: null},
    isDeleted:{type:Boolean,default:false},
    releasedAt:{type:Date,required:true,format:"YYYY-MM-DD"},
    createdAt:{type: Date,default: Date.now},
    updatedAt:{type:Date, default:Date.now}

})

module.exports=mongoose.model('BooksDB',bookSchema)