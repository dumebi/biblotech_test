const { Schema, model } = require('mongoose')
const BookSchema = new Schema(
  {
    isbn: { type: Schema.Types.String },
    title: { type: Schema.Types.String },
    author: { type: Schema.Types.String },
    institution: {type: Schema.Types.ObjectId, ref: 'Institution'},
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Book = model('Book', BookSchema)

module.exports = Book
