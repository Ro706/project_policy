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
    password:{
        type: String,
        required: true //Asking for user's password and it's required (encrypted)
    },
    date:{
        type: Date,
        default: Date.now //creation date (current date)
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;