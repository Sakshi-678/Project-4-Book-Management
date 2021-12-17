const jwt = require('jsonwebtoken')

const UserAuth = async (req, res, next) => {
    try {
        const token = req.header('x-api-key')
        if(!token) {
            res.status(403).send({status: false, message: `Missing authentication token in request`})
            return;
        }

        const decoded = await jwt.verify(token, 'Group16')

        if(!decoded) {
            res.status(403).send({status: false, message: `Invalid authentication token in request`})
            return;
        }

        req.user = decoded.UserId;

        next()
    } catch (error) {
        console.error(`Error! ${error.message}`)
        res.status(500).send({status: false, message: error.message})
    }
}

module.exports = {UserAuth}