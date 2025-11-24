const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true //Asking for user's name and it's required
    },
    email:{
        type: String,
        required: true,
        unique: true //Asking for user's email and it's required
    },
    phone:{
        type: String,
        unique: true //Asking for user's phone number and it's required
    },
    password:{
        type: String,
    },
    googleId: {
        type: String
    },
    date:{
        type: Date,
        default: Date.now //creation date (current date)
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isSubscribed: {
        type: Boolean,
        default: false
    },
    subscriptionExpiresAt: {
        type: Date
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;