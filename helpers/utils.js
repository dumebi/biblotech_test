const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')
const Constants = require('./status')
const UserModel = require('../models/user.js');
require('dotenv').config();

exports.config = {
  jwt: process.env.JWT_SECRET,
  mongo: '',
  host: '',
  amqp_url: '',
  port: '',
  redis: ''
}

console.log(process.env.MONGO_LAB_DEV, process.env.MONGO_LAB_PROD)

if (process.env.NODE_ENV === 'development') {
  this.config.mongo = `${process.env.MONGO_LAB_DEV}`
  this.config.host = `http://localhost:${process.env.PORT}/v1/`
  this.config.db = 'biblotech_test'
  this.config.amqp_url = `${process.env.AMQP_URL}`
  this.config.port = `${process.env.PORT}`
} else {
  this.config.mongo = `${process.env.MONGO_LAB_PROD}`
  this.config.host = `https://vast-reef-55707.herokuapp.com/v1/`
  this.config.db = 'biblotech_test'
  this.config.amqp_url = `${process.env.CLOUDAMQP_URL}`
  this.config.port = `${process.env.PORT}`
  this.config.redis = `${process.env.REDIS_URL}`
}

exports.sendMail = (params, callback) => {
  const email = params.email;
  // let from_email = params.from_email;
  const body = params.body;
  const subject = params.subject;
  if (email == null || body == null || subject == null) {
    return {
      status: 'failed',
      err: 'the required parameters were not supplied'
    };
  }
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: 'dikejude49@gmail.com',
      pass: '*******'
    }
  });

  const mailOptions = {
    from: 'Biblotech Support <support@biblotech.com>',
    to: email,
    subject,
    html: body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      callback(error, null);
    } else {
      callback(error, info.response);
    }
  });
};

exports.generateTransactionReference = (x) => {
  let text = ''
  const possible = '0123456789'
  for (let i = 0; i < (x || 15); i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
  return ''.concat(text)
}

const paramsNotValid = (...args) => args
  .map(param => param !== undefined && param != null && param !== '')
  .includes(false)
exports.paramsNotValid = paramsNotValid

exports.paramsNotValidChecker = (...args) => args.map(
  param => `${param} : ${param !== undefined && param != null && param !== '' ? true : `${param} is required`}`
)

/**
 * Check token was sent
 */
exports.checkToken = async (req) => {
  try {
    let token = null;
    if (req.headers.authorization) {
      token = req.headers.authorization;
      const tokenArray = token.split(' ');
      token = tokenArray[1];
    }
    if (req.query.token) {
      token = req.query.token;
    }
    if (req.body.token) {
      token = req.body.token
    }
    if (!token) {
      return {
        status: 'failed',
        data: Constants.UNAUTHORIZED,
        message: 'Not authorized'
      };
    }
    const decryptedToken = await jwt.verify(token, this.config.jwt);
    // console.log(decryptedToken)
    const user = await UserModel.findById(decryptedToken.id)
    if(user){
      return {
        status: 'success',
        data: user
      }
    }
    return {
      status: 'failed',
      data: Constants.UNAUTHORIZED,
      message: 'Invalid token'
    };
  } catch (error) {
    console.log(error)
    if (error.name === 'TokenExpiredError') {
      return {
        status: 'failed',
        data: Constants.UNAUTHORIZED,
        message: 'Token expired'
      };
    }
    return {
      status: 'failed',
      data: Constants.UNAUTHORIZED,
      message: 'failed to authenticate token'
    }
  }
};

/**
 * Create Jwt token
 */
exports.createToken = (email, id) => {
  try {
    const jwtToken = jwt.sign({ email, id }, this.config.jwt, { expiresIn: 60 * 60 * 24 });
    return jwtToken
  } catch (error) {
    return false;
  }
};


exports.handleError = (res, code, message) => {
  console.log(message, err)
  return res.status(parseInt(code, 10)).json({
    status: 'error',
    message
  })
}

exports.handleFail = (res, code, data) => {
  console.log(message, err)
  return res.status(parseInt(code, 10)).json({
    status: 'fail',
    data
  })
}

exports.handleSuccess = (res, code, data) => {
  return res.status(parseInt(code, 10)).json({
    status: 'success',
    data
  })
}