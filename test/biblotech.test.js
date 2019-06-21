/* eslint-disable no-undef */
const mongoose = require('mongoose');
const expect = require('chai').expect
const supertest = require('supertest')
const http = require('http');
const app = require('../index')
require('dotenv').config();
const { config } = require('../helpers/utils');
const status = require('../helpers/status');

const api = supertest(`${config.host}`)
console.log(`${config.host}`)

describe('Biblotech Test', () => {
  let user_id = ''
  let user_jwt = ''
  let user_token = ''
  let institution_id_1 = ''
  let institution_id_2 = ''
  let rec_token = ''
  let book_id = ''

  before(async () => {
    // const port = process.env.PORT || 8080;
    // app.set('port', port);
    // /**
    //  * Create HTTP server.
    //  */
    // const server = http.createServer(app);
    // /**
    //  * Listen on provided port, on all network interfaces.
    //  */
    // server.listen(port);
    console.log(config.mongo);
    // this.timeout(13000); // A very long environment setup.
    // await setTimeout(done, 20000);
    await mongoose.connect(config.mongo, { useNewUrlParser: true });
    await mongoose.connection.db.dropDatabase();
    // await dbSeeder();
  })

  it('Should create an institution 1', (done) => {
    const name = "Unilag"
    const url = "unilag.edu.ng"
    const domain =  "unilag.edu.ng"
    api
      .post('admin/institutions')
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name,
        url,
        domain
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.url).to.equal(url)
        expect(res.body.data.domain).to.equal(domain)
        institution_id_1 = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create an institution 2', (done) => {
    const name = "Uniben"
    const url = "uniben.edu.ng"
    const domain =  "uniben.edu.ng"
    api
      .post('admin/institutions')
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name,
        url,
        domain
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.url).to.equal(url)
        expect(res.body.data.domain).to.equal(domain)
        institution_id_2 = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should get all institutions', (done) => {
    api
      .get('admin/institutions')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data.length).to.equal(2)
        done()
      })
  }).timeout(10000)

  it('Should get institution 1', (done) => {
    api
      .get('admin/institutions/'+institution_id_1)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.equal(institution_id_1)
        done()
      })
  }).timeout(10000)

  it('Should update institution 1', (done) => {
    const name = "University of Lagos"
    api
      .patch('admin/institutions/'+institution_id_1)
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data._id).to.equal(institution_id_1)
        expect(res.body.data.name).to.equal(name)
        done()
      })
  }).timeout(10000)

  it('Should delete institution 1', (done) => {
    api
      .delete('admin/institutions/'+institution_id_1)
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.equal(null)
        done()
      })
  }).timeout(10000)

  it('Should create a user', (done) => {
    const name = "oneguylykdat"
    const email = "email@uniben.edu.ng"
    const password = "John"
    api
      .post('users/create')
      .set('Accept', 'application/json')
      .send({
        name,
        email,
        password
      })
      .expect(200)
      .end((err, res) => {
        console.log(res.body)
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.password).to.not.equal(password)
        user_id = res.body.data._id
        user_jwt = res.body.data.token
        done()
      })
  }).timeout(30000)

  it('Should login user', (done) => {
    const email = "email@uniben.edu.ng"
    const password = "John"
    api
      .post('users/signin')
      .set('Accept', 'application/json')
      .send({
        email,
        password
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.password).to.not.equal(password)
        user_id = res.body.data._id
        user_jwt = res.body.data.token
        done()
      })
  }).timeout(30000)

  it('Should send token', (done) => {
    const email = "email@uniben.edu.ng"
    api
      .post('users/send-token')
      .set('Accept', 'application/json')
      .send({
        email
      })
      .expect(200)
      .end((err, res) => {
        console.log(res.body)
        expect(res.body.status).to.equal('success')
        expect(res.body.data.length).to.equal(5)
        rec_token = res.body.data
        done()
      })
  }).timeout(10000)

  it('Should reset password', (done) => {
    const email = "email@uniben.edu.ng"
    const password = "John"
    const token = rec_token
    api
      .patch('users/reset-pass')
      .set('Accept', 'application/json')
      .send({
        email,
        password,
        token
      })
      .expect(200)
      .end((err, res) => {
        console.log(res.body)
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.equal(null)
        done()
      })
  }).timeout(10000)

  it('Should create a book 1', (done) => {
    const isbn = "12345"
    const title = "Engineering Maths"
    const author = "Ike Mowete"
    const institution = institution_id_2
    api
      .post('admin/books')
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        isbn,
        title,
        author,
        institution
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.isbn).to.equal(isbn)
        expect(res.body.data.title).to.equal(title)
        expect(res.body.data.author).to.equal(author)
        expect(res.body.data.institution).to.equal(institution)
        book_id = res.body.data._id
        done()
      })
  }).timeout(10000)


  it('Should get all book', (done) => {
    api
      .get('admin/books')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data.length).to.equal(1)
        done()
      })
  }).timeout(10000)

  it('Should get book 1', (done) => {
    api
      .get('admin/books/'+book_id)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.equal(book_id)
        done()
      })
  }).timeout(10000)

  it('Should update book 1', (done) => {
    const title = "Engineering Math"
    const author = "Sir Ike Mowete"
    api
      .patch('admin/books/'+book_id)
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        title,
        author
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.title).to.equal(title)
        expect(res.body.data.author).to.equal(author)
        done()
      })
  }).timeout(10000)

  it('Should delete book 1', (done) => {
    api
      .delete('admin/books/'+book_id)
      .set('Accept', 'application/json')
      // .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.equal(null)
        done()
      })
  }).timeout(10000)

  /**
   * Exceptions test
   */

  it('Should get 412 preconditioned failed on create institution', (done) => {
    const name = "Uniben"
    const url = "uniben.edu.ng"
    api
      .post('admin/institutions')
      .set('Accept', 'application/json')
      .send({
        name,
        url,
      })
      .expect(status.PRECONDITION_FAILED)
      .end((err, res) => {
        expect(res.body.status).to.equal('fail')
        done()
      })
  }).timeout(10000)

  it('Should get status 404 on book not found', (done) => {
    api
      .get('admin/books/'+institution_id_1)
      .set('Accept', 'application/json')
      .expect(status.NOT_FOUND)
      .end((err, res) => {
        expect(res.body.status).to.equal('error')
        done()
      })
  }).timeout(10000)
})

