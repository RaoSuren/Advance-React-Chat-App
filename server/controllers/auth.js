const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const mailService = require("../services/mailer");

const {promisify} = require("util");
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

    mailService.sendEmail({
        from: "shreyanshshah242@gmail.com",
        to: user.email,
        subject: "Verification OTP",
        html: otp(user.firstName, new_otp),
        attachments: [],
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

    const token = signToken(user._id);

    res.status(200).json({
        status: "sucess",
        message: "User verified sucessfully",
        token
    });
};

exports.login = async (req, res, next) => {
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

exports.protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }
    else if(res.cookies.jwt){
        token = req.cookies.jwt;
    } else {
        req.status(400).json({
            status: "error",
            message: "You are not looged in Please log in to get access",
        })

        return;
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const this_user = await User.findById(decoded.userId);

    if(!this_user){
        res.status(400).json({
            status: "error",
            message: "The user doesn't exists",
        })
    }

    if(this_user.changedPasswordAfter(decodes.iat))
    {
        res.status(400).json({
            status: "error",
            message: "User recently updated password Please log in again"
        })
    }

    req.user = this_user;
    next();
}

exports.forgotPassword = async (req, res, next) => {
    const user - await User.findOne({email: req.body.email});
    if(!user) {
        res.status(400).json({
            status: "error",
            message: "No user found with this email"
        })

        return;
    }

    const resetToken = user.createPasswordResetToken();

    const resetURL = `https://tawk.com/auth/reset-password/?code=${resetToken}`;

    try {
        res.status(200).json({
            status: "sucess",
            message: "Reset Password link sent sucessfully"
        })
    } catch(error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save({validateBeforeSave: false});

        res.status(500).json({
            status: "error",
            message: "There was an error sending the mail, try after some time"
        })
    }
}

exports.resetPassword = (req, res, next) => {
    const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

    const user = await User.find({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()},
    });

    if(!user){
        res.status(400).json({
            status: "error",
            message: "TOken is invalid, Expired",
        })

        return;
    }

    user.password = req.body.password;
    user.passwordConfirmed = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const token = signTOken(user._id);

    res.status(200).json({
        status: "sucess",
        message: "Password Reset Sucessfully",
        token,
    });


}