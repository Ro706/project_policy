const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSessionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true // Each user has only one active session/context
    },
    context: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ChatSession = mongoose.model('chatsession', ChatSessionSchema);
module.exports = ChatSession;
