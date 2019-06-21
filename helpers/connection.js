const mongoose = require('mongoose');
const utils = require('../helpers/utils');
const RabbitMQ = require('./rabbitmq')
const subscriber = require('./rabbitmq')

const { addOrUpdateCache, removeCache } = require('../controllers/user');
const { sendUserToken, sendUserSignupEmail } = require('../helpers/emails');
const { sendMail } = require('../helpers/utils');
require('dotenv').config();

// Socket config
module.exports = {
  mongo() {
    mongoose.promise = global.promise;
    mongoose
      .connect(utils.config.mongo, {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500
      })
      .then(() => {
        console.log('MongoDB is connected')
      })
      .catch((err) => {
        console.log(err)
        console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
        setTimeout(this.mongo, 5000)
      })
  },
  async rabbitmq() {
    RabbitMQ.init(utils.config.amqp_url);
  },
  async subscribe() {
    await subscriber.init(utils.config.amqp_url);

    // Add to redis cache
    subscriber.consume('ADD_OR_UPDATE_USER_INSTITUTION_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      addOrUpdateCache(data.newUser, 'biblotech_users')
      subscriber.acknowledgeMessage(msg);
    }, 3);

    subscriber.consume('ADD_OR_UPDATE_INSTITUTIONS_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      addOrUpdateCache(data.institution, 'biblotech_institutions')
      subscriber.acknowledgeMessage(msg);
    }, 3);

    subscriber.consume('REMOVE_INSTITUTIONS_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      removeCache(data._id, 'biblotech_institutions')
      subscriber.acknowledgeMessage(msg);
    }, 3);

    subscriber.consume('REMOVE_BOOKS_CACHE', (msg) => {
      const data = JSON.parse(msg.content.toString());
      removeCache(data._id, 'biblotech_books')
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Send User Signup Mail
    subscriber.consume('SEND_USER_INSTITUTION_SIGNUP_EMAIL', (msg) => {
      const data = JSON.parse(msg.content.toString());
      const userTokenMailBody = sendUserSignupEmail(data.user, data.link)
      const mailparams = {
        email: data.user.email,
        body: userTokenMailBody,
        subject: 'Welcome to biblotech'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });
      subscriber.acknowledgeMessage(msg);
    }, 3);

    // Send User Token Mail
    subscriber.consume('SEND_USER_INSTITUTION_TOKEN_EMAIL', (msg) => {
      const data = JSON.parse(msg.content.toString());
      const userTokenMailBody = sendUserToken(data.user, data.token)
      const mailparams = {
        email: data.user.email,
        body: userTokenMailBody,
        subject: 'Recover your password'
      };
      sendMail(mailparams, (error, result) => {
        console.log(error)
        console.log(result)
      });
      subscriber.acknowledgeMessage(msg);
    }, 3);
  }
}
