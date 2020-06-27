const mongoose = require('mongoose');
const { Schema } = mongoose;

const Author = new Schema({
    name: String,
    email: String
})

const Book = new Schema({
    title: String,
    authors: [Author],
    publishedDate: Date,
    price: Number,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book',Book);  // mongoose.model() -> Schema를 model로 변환, 다른 파일에서 사용할 수 있도록 exports, Schema이름은 복수형으로 지어짐