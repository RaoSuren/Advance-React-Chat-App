const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

const User = require("../models/User");
const signedToken = (userId) => jwt.sign({userId, process.env.JWT_SECRET});

exports.register = async(req, res, next) => {
    const {firstName, lastName, email, password} = req.body;

    const filteredBody = filterObj(req.body, "firstName", "lastName", "password", "email");

    const existing_user = await User.findOne({email: email});

    if(existing_user && existing_user.verified) {
        res.status(400).json({
            status: "error",
            message: 'Email is already in use, Please Login'
        });
    } else if(existing_user) {
        await User.findOneAndUpdate({email: email}, filteredBody, {new: true, validateModifiedOnly: true,});
        req.userId = existing_user._id;
        next();
    }
    else {
        const newuser = await User.create(filteredBody);

        req.userId = newuser._id;
        next();
    }
}

exports.sendOTP = async (req, res, next) => {
    const {userId} = req;
    const new_otp = otpGenerator.generate(6, 
        {
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
    
    const otp_expiry = Date.now()+10*60*1000;

    await User.findByIdAndUpdate(userID, {
        otp: new_otp,
        otp_expiry_time: otp_expiry
    });

    res.status(200).json({
        status: "success",
        message: "OTP Sent Sucessfully"
    })
}

exports.verifyOTP = async (req, res, next) => {
    const {email, otp} = req.body;
    const user = await User.findOne({
        email,
        otp_expiry_time: {$gt: Date.now()},
    });

    if(!user){
        res.status(400).json({
            status: "error",
            message: "Email is invalid or OTP Expired",
        });

    }

    if(!await user.correctOTP(otp, user.otp)) {
        res.status(400).json({
            status: "error",
            message: "OTP is incorrect",
        })
    }

    user.verified = true;
    user.otp = undefined;

    await user.save({new: true, validateModifiedOnly: true});

    cosnt token = signToken(user._id);

    res.status(200).json({
        status: "sucess",
        message: "User verified sucessfully",
        token
    });
};

exports.login() = async (req, res, next) => {
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

     res.staus(200).json({
        status: "sucess",
        message: "Looged in sucessfully",
        token
     })
}

exports.forgotPassword = async (req, res, next) => {
    
}