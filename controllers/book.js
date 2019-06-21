const BookModel = require('../models/book');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, handleError, handleFail, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const publisher = require('../helpers/rabbitmq');

const BookController = {
  /**
   * Create Book
   * @description Create an book
   * @param {string} name 
   * @param {string} url      
   * @param {string} domain
   * @return {object} book
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.isbn, req.body.title, req.body.author, req.body.institution)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.isbn, req.body.title, req.body.author, req.body.institution))
      }

      const bookFound = await BookModel.findOne({ isbn: req.body.isbn })
      if (bookFound) { return handleError(res, HttpStatus.BAD_REQUEST, 'book already exists') }

    //   isbn: { type: Schema.Types.String },
    // title: { type: Schema.Types.String },
    // author: { type: Schema.Types.String },
    // institution: {type: Schema.Types.ObjectId, ref: 'Institution'},

      const book = new BookModel({
        isbn: req.body.isbn,
        title: req.body.title,
        author: req.body.author,
        institution: req.body.institution
      })
      await Promise.all([book.save(), publisher.queue('ADD_OR_UPDATE_BOOKS_CACHE', { book })])
      return handleSuccess(res, HttpStatus.OK, book)
    } catch (error) {
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create book')
    }
  },
  /**
   * Get Books.
   * @description This returns all books in the Premier League Ecosystem.
   * @return {object[]} books
   */
  async all(req, res, next) {
    try {
      let books = {}
      const result = await getAsync('biblotech_books');
      // console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        books = JSON.parse(result);
      } else {
        allBooks = await BookModel.find({});
        for (let index = 0; index < allBooks.length; index++) {
          books[allBooks[index]._id] = allBooks[index]
        }
        await client.set('biblotech_books', JSON.stringify(books));
      }
      return handleSuccess(res, HttpStatus.OK, Object.values(books))
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not get books')
    }
  },

  /**
     * Get Book
     * @description This returns a book details in thw Premier League Ecosystem.
     * @param   {string}  id  Book's ID
     * @return  {object}  book
     */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const book = await BookModel.findById(_id);

      if (book) {
        return handleSuccess(res, HttpStatus.OK, book)
      }
      return handleError(res, HttpStatus.NOT_FOUND,  'Book not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting book')
    }
  },

  /**
     * Get User Books
     * @description This returns a book details in thw Premier League Ecosystem.
     * @param   {string}  id  Book's ID
     * @return  {object}  book
     */
    async user(req, res, next) {
      try {
        const user = req.jwtUser;
        const books = await BookModel.find({ institution: user.institution });
  
        if (books) {
          return handleSuccess(res, HttpStatus.OK, books)
        }
        return handleError(res, HttpStatus.NOT_FOUND,  'Book not found')
      } catch (error) {
        return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting book')
      }
    },

  /**
   * Update Book
   * @description This updates a book details in thw Premier League Ecosystem.
   * @param   {string}  id  Book's ID
   * @return {object} book
   */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const book = await BookModel.findByIdAndUpdate(
        _id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (book) {
        await Promise.all([publisher.queue('ADD_OR_UPDATE_BOOKS_CACHE', { book })])
        return handleSuccess(res, HttpStatus.OK, book)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Book not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating book')
    }
  },

  /**
   * Update Book
   * @description This removes a book details in thw Premier League Ecosystem.
   * @param   {string}  id  Book's ID
   * @return {object} book
   */
  async remove(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id))
      }
      const _id = req.params.id;
      const book = await BookModel.findByIdAndRemove(
        _id,
        { safe: true, multi: true, new: true }
      )
      if (book) {
        await Promise.all([publisher.queue('REMOVE_BOOKS_CACHE', { _id })])
        return handleSuccess(res, HttpStatus.OK, null)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Book not found')
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating book')
    }
  }
};

module.exports = BookController;
