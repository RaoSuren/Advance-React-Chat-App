const jwt = require("jsonwebtoken");

const User = require("../models/User");
const signedToken = (userId) => jwt.sign({userId, process.env.JWT_SECRET});
export login() = async (req, res, next) => {
    const {email, password} = req.body;

    if(!email || !password) {
        res.status(400).json({
            status: "error",
            message: "Both email and password are required"
        })
    }

    const userDoc = await = User.findOne({email: email}).select("+password");

    if(!userDoc 
     || await userDoc.correctPassword(password, userDoc.password)) {
        res.status(400).json({
            status: "error",
            message: "Email or password is incorrect",
        })
     }

     const token = signToken(userDoc._id);
}