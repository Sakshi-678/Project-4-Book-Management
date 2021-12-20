const UserModel = require("../models/User Model")
const jwt = require('jsonwebtoken')


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidTitle = function (title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


const createUser = async (req, res) => {

    try {
        const requestbody = req.body;
        if (!isValidRequestBody(requestbody)) {
            return res.status(400).send({ status: false, message: 'Please provide details in request body' })
        }

        let { title, name, phone, email, password, address } = requestbody

        if (!isValid(title)) {

            return res.status(400).send({ status: false, message: 'title is required' })

        }
        title = title.trim()

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: `Title should be among Mr, Mrs, Miss.` })
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: 'name is required' })
        }
        // name = name.trim()

        
        const PhoneNoinUse = await UserModel.findOne({phone})
        if (PhoneNoinUse) {
            return res.status(400).send({ status: false, message: "Phone Number is already registered." })
        }
       
       
        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: 'Phone No is required' })
        }
        phone=phone.trim()
    
        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: `Phone Number is not valid` })
        }
        email=email.trim().toLowerCase()
        const EmailinUse = await UserModel.findOne({email})
        if (EmailinUse) {
            return res.status(400).send({ status: false, message: "Email Id is already registered." })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: `Email is required` })

        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` })

        }
        password=password.trim()
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: `Password is required` })

        }

        if (!((password.length > 7) && (password.length < 16))) {
            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })
        }
        //Validation Ends

        const userdata = { title, name, phone, email, password, address }

        let User = await UserModel.create(userdata)

        res.status(201).send({ data: User })

    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}

const loginUser = async (req, res)=> {
    try {
        const requestBody = req.body;
        if(!isValidRequestBody(requestBody)) {
            return res.status(400).send({status: false, message: 'Invalid request parameters. Please provide login details'})    
        }

        // Extract params
        let {email, password} = requestBody;
        
        // Validation starts
        
        if(!isValid(email)) {
            res.status(400).send({status: false, message: `Email is required`})
            return
        }
        email=email.toLowerCase().trim()
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            res.status(400).send({status: false, message: `Email should be a valid email address`})
            return
        }

        if(!isValid(password)) {
            res.status(400).send({status: false, message: `Password is required`})
            return
        }
        if (!((password.length > 7) && (password.length < 16))) {
            return res.status(400).send({ status: false, message: `Password length should be between 8 and 15.` })
        }

        // Validation ends

        const User = await UserModel.findOne({email, password});

        if(!User) {
            res.status(401).send({status: false, message: `Invalid login credentials`});
            return
        }

        const token = await jwt.sign({
            UserId: User._id,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 30*60
        }, 'Group16')

        res.header('x-api-key', token);
        res.status(200).send({status: true, message: `User login successfull`, data: {token}});
    } catch (err) {
        res.status(500).send({status: false, message: err.message});
    }
}

module.exports={createUser,loginUser}
