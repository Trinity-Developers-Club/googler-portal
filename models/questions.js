const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    questionNumber: {
        type: Number,
        required: true,
        unique: true,
        dropDups: true
    },
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true
    },
});


const questionModel = mongoose.model('questions', questionSchema);
module.exports = questionModel;
