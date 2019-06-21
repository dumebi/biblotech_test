/* eslint-disable no-undef */
const mongoose = require('mongoose');
const expect = require('chai').expect
const supertest = require('supertest')
const http = require('http');
const app = require('../server')
require('dotenv').config();
const { config } = require('../helpers/utils');

const UserModel = require('../models/user');

const api = supertest(`${config.host}`)
console.log(`${config.host}`)

describe('Admin Test', () => {
  let user_id = ''
  let user2_id = ''
  let admin_id = ''
  let admin_jwt = ''
  const admin_token = ''
  let team_id = ''
  let team2_id = ''
  let team3_id = ''
  let fixture_id = ''
  let fixture2_id = ''

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
  it('Should create a user', (done) => {
    const username = 'oneguylykdat'
    const email = 'email@mail.com'
    const password = 'John'
    api
      .post('users/signup')
      .set('Accept', 'application/json')
      .send({
        username,
        email,
        password
      })
      .expect(200)
      .end((err, res) => {
        console.log()
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.username).to.equal(username)
        expect(res.body.data.password).to.not.equal(password)
        admin_id = res.body.data._id
        admin_jwt = res.body.data.token
        done()
      })
  }).timeout(30000)

  it('Should make a user an admin', (done) => {
    const type = 'Admin'
    api
      .patch('users/'+ admin_id)
      .set('Accept', 'application/json')
      .send({
        type
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.type).to.equal(type)
        done()
      })
  }).timeout(30000)

  it('Should create user 2', (done) => {
    const username = 'oneguylykdat2'
    const email = 'email2@mail.com'
    const password = 'John'
    api
      .post('users/signup')
      .set('Accept', 'application/json')
      .send({
        username,
        email,
        password
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.username).to.equal(username)
        expect(res.body.data.password).to.not.equal(password)
        user_id = res.body.data._id
        done()
      })
  }).timeout(30000)

  it('Should create user 3', (done) => {
    const username = 'oneguylykdat3'
    const email = 'email3@mail.com'
    const password = 'John'
    api
      .post('users/signup')
      .set('Accept', 'application/json')
      .send({
        username,
        email,
        password
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.email).to.equal(email)
        expect(res.body.data.username).to.equal(username)
        expect(res.body.data.password).to.not.equal(password)
        user2_id = res.body.data._id
        done()
      })
  }).timeout(30000)

  it('Should create a team', (done) => {
    const name = 'Manchester United'
    const logo = 'https://www.google.com/search?q=manches+logo&tbm=isch&source=iu&ictx=1&fir=b5a9FnMdJJqEBM%253A%252CHSrEjIMMKy9whM%252C_&vet=1&usg=AI4_-kSa_ZPsBLpE5wyYTdYT7IgXv4bUUw&sa=X&ved=2ahUKEwjVm5OG3s_iAhWSXRUIHfAHB8wQ9QEwAHoECAMQBA#imgrc=b5a9FnMdJJqEBM:'
    const owner = 'Family'
    const manager = 'Ole Gunner'
    const stadium = 'Old Trafford'
    const established = '15-09-1970'
    api
      .post('teams')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name,
        logo,
        owner,
        manager,
        stadium,
        established
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.logo).to.equal(logo)
        expect(res.body.data.owner).to.equal(owner)
        expect(res.body.data.manager).to.equal(manager)
        expect(res.body.data.stadium).to.equal(stadium)
        expect(res.body.data.established).to.equal(established)
        team_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a team 2', (done) => {
    const name = 'Chelsea'
    const logo = 'https://www.google.com/search?q=chelsea+logo&tbm=isch&source=iu&ictx=1&fir=3JHzUrQWDhSUwM%253A%252CLDRCRbVndXOvZM%252C_&vet=1&usg=AI4_-kTRtK0Nczlc4tsfi1_ihJceeDhZsA&sa=X&ved=2ahUKEwjLsJuv1c_iAhWt1lkKHXSBA7QQ9QEwAXoECAMQBA#imgrc=3JHzUrQWDhSUwM:'
    const owner = 'Roman Abrahimovic'
    const manager = 'Sarri Ball'
    const stadium = 'Stamford Bridge'
    const established = '15-09-1860'
    api
      .post('teams')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name,
        logo,
        owner,
        manager,
        stadium,
        established
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.logo).to.equal(logo)
        expect(res.body.data.owner).to.equal(owner)
        expect(res.body.data.manager).to.equal(manager)
        expect(res.body.data.stadium).to.equal(stadium)
        expect(res.body.data.established).to.equal(established)
        team2_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a team 3', (done) => {
    const name = 'Liverpool'
    const logo = 'https://www.google.com/search?q=liverpool+logo&tbm=isch&source=iu&ictx=1&fir=pJe3l4xbQc_flM%253A%252C-ACJmZ9iiBFn6M%252C_&vet=1&usg=AI4_-kQftzYQ45bNZhAtV6jULWpKjNzXtQ&sa=X&ved=2ahUKEwiE0Z-x3c_iAhU8WhUIHfh7CDMQ9QEwAXoECAMQBA#imgrc=pJe3l4xbQc_flM:'
    const owner = 'Another man'
    const manager = 'Jurgen Klopp'
    const stadium = 'Anfield'
    const established = '15-09-1870'
    api
      .post('teams')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        name,
        logo,
        owner,
        manager,
        stadium,
        established
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.name).to.equal(name)
        expect(res.body.data.logo).to.equal(logo)
        expect(res.body.data.owner).to.equal(owner)
        expect(res.body.data.manager).to.equal(manager)
        expect(res.body.data.stadium).to.equal(stadium)
        expect(res.body.data.established).to.equal(established)
        team3_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should get all teams', (done) => {
    api
      .get('teams')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Teams retrieved')
        expect(res.body.data).to.have.lengthOf.above(0)
        done()
      })
  }).timeout(10000)

  it('Should get team 1', (done) => {
    api
      .get('teams/'+team_id)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data._id).to.equal(team_id)
        done()
      })
  }).timeout(10000)
  
  it('Should update team 1', (done) => {
    const established = '15-09-1890'
    api
      .patch('teams/'+team_id)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        established
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.established).to.equal(established)
        done()
      })
  }).timeout(10000)

  it('Should delete team 1', (done) => {
    api
      .delete('teams/'+team_id)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Team has been removed')
        done()
      })
  }).timeout(10000)

  it('Should create a fixture 1', (done) => {
    const home = team_id
    const away = team2_id
    const date = '10-12-2019'
    api
      .post('fixtures')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        home,
        away,
        date
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.home.team).to.equal(home)
        expect(res.body.data.home.score).to.equal(0)
        expect(res.body.data.away.team).to.equal(away)
        expect(res.body.data.away.score).to.equal(0)
        expect(res.body.data.date).to.equal(date)
        fixture_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a fixture 2', (done) => {
    const home = team_id
    const away = team3_id
    const date = '9-12-2019'
    api
      .post('fixtures')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        home,
        away,
        date
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.home.team).to.equal(home)
        expect(res.body.data.home.score).to.equal(0)
        expect(res.body.data.away.team).to.equal(away)
        expect(res.body.data.away.score).to.equal(0)
        expect(res.body.data.date).to.equal(date)
        fixture2_id = res.body.data._id
        done()
      })
  }).timeout(10000)

  it('Should create a fixture 3', (done) => {
    const home = team2_id
    const away = team3_id
    const date = '11-12-2019'
    api
      .post('fixtures')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        home,
        away,
        date
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.home.team).to.equal(home)
        expect(res.body.data.home.score).to.equal(0)
        expect(res.body.data.away.team).to.equal(away)
        expect(res.body.data.away.score).to.equal(0)
        expect(res.body.data.date).to.equal(date)
        done()
      })
  }).timeout(10000)

  it('Should get all fixtures', (done) => {
    api
      .get('fixtures')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Fixtures retrieved')
        expect(res.body.data).to.have.lengthOf.above(0)
        done()
      })
  }).timeout(10000)

  it('Should get fixture 1', (done) => {
    api
      .get('fixtures/'+fixture_id)
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data._id).to.equal(fixture_id)
        done()
      })
  }).timeout(10000)

  it('Should update fixture 1 scores', (done) => {
    const home = 1
    const away = 0
    api
      .patch('fixtures/'+fixture_id+'/scores')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        home,
        away
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.home.score).to.equal(home)
        expect(res.body.data.away.score).to.equal(away)
        done()
      })
  }).timeout(10000)

  it('Should update fixture 1', (done) => {
    const status = 'Completed'
    api
      .patch('fixtures/'+fixture_id)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .send({
        status
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data._id).to.have.lengthOf.above(0)
        expect(res.body.data.status).to.equal(status)
        done()
      })
  }).timeout(10000)

  it('Should delete fixture 1', (done) => {
    api
      .delete('fixtures/'+fixture_id)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.message).to.equal('Fixture has been removed')
        done()
      })
  }).timeout(10000)

  it('Should get a user', (done) => {
    api
      .get(`users/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Object)
        done()
      })
  }).timeout(10000)

  it('Should get all users', (done) => {
    api
      .get('users')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${admin_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).to.equal('success')
        expect(res.body.data).to.be.instanceof(Array)
        done()
      })
  }).timeout(10000)
})

