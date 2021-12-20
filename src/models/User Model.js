const mongoose = require('mongoose')

const userSchema=new mongoose.Schema({
    title:{type:String,trim:true,required:`Title is Required`,enum:['Mr','Miss','Miss']},
    name:{type:String,trim: true,required: `Name is required`},
    phone:{type:String,trim: true,required:`Phone Number is required`,unique:true},
    email:{type: String,trim: true,toLowercase:true,required: `Email is required`, unique: true},
    password:{type: String,required: `Password is required`, minlength:8,maxlength:15},
    address:{
        street:{type:String},
        city:{type:String},
        pincode:{type:String}
    },
    createdAt:{type: Date,default: Date.now},
    updatedAt:{type:Date, default:Date.now}

})

module.exports=mongoose.model('UserDB',userSchema)