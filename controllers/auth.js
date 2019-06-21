const randomstring = require('randomstring');
const UserModel = require('../models/user');
const InstitutionModel = require('../models/institution');
const {
  paramsNotValid, createToken, handleFail, handleError, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');
const { deepCopy } = require('../controllers/user');
const publisher = require('../helpers/rabbitmq');
const passport = require('passport');

const AuthController = {
  /**
   * Create User
   * @description Create a user
   * @param {string} name            User Name
   * @param {string} email           User Email
   * @param {string} password        User Password
   * @param {string} role            User Role
   * @return {object} user
   */
  async addUser(req, res, next) {
    try {
      if (paramsNotValid(req.body.email, req.body.name, req.body.password)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.email, req.body.name, req.body.password))
      }

      const userFound = await UserModel.findOne({ email: req.body.email })
      if (userFound) { return handleError(res, HttpStatus.BAD_REQUEST, 'email already exists') }

      const domain = req.body.email.split('@')
      console.log(domain)
      const institution = await InstitutionModel.findOne({ domain: domain[1]})

      if (institution) {
        const user = new UserModel({
          name: req.body.name,
          email: req.body.email,
          role: UserModel.UserRole.STUDENT,
          institution: institution._id,
          password: req.body.password
        })
  
        const jwtToken = createToken(user.email, user._id);
        user.token = jwtToken;
  
        const newUser = deepCopy(user)
  
        await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_INSTITUTION_CACHE', { newUser }), publisher.queue('SEND_USER_INSTITUTION_SIGNUP_EMAIL', { user })])
        return handleSuccess(res, HttpStatus.OK, newUser)
      } 
      return handleError(res, HttpStatus.BAD_REQUEST, 'Institution domain does not exist')
    } catch (error) {
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create user')
    }
  },

  /**
   * User Login
   * @description Login a user
   * @param {string} email
   * @param {string} password
   * @return {object} user
   */
  async login(req, res, next) {
    try {
      if (paramsNotValid(req.body.email, req.body.password)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.email, req.body.password))
      }

      return passport.authenticate('local', { session: false }, async (err, passportUser, info) => {
        if(err) {
          console.log(err)
          return handleError(res, HttpStatus.UNAUTHORIZED, 'Wrong password')
        }
    
        if(passportUser) {
          // const user = passportUser;
          // user.token = passportUser.generateJWT();
    
          // return res.json({ user: user.toAuthJSON() });
          const user = passportUser
          const newUser = deepCopy(user)

          // const jwtToken = createToken(email, user._id)
          // user.token = jwtToken;

          await Promise.all([publisher.queue('ADD_OR_UPDATE_USER_INSTITUTION_CACHE', { newUser })])
          return handleSuccess(res, HttpStatus.OK,  newUser)
        }
    
        return handleError(res, HttpStatus.BAD_REQUEST, 'Username/Password is not correct')
      })(req, res, next);
    } catch (error) {
      console.log(error)
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not login user')
    }
  },

  /**
     * User Send Token
     * @description Send a forgot password token to a user
     * @param {string} email
     * @return {null}
     */
  async sendToken(req, res, next) {
    try {
      if (paramsNotValid(req.body.email)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.email))
      }
      const email = req.body.email;
      const user = await UserModel.findOne({ email });
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here') }

      const token = randomstring.generate({
        length: 5,
        charset: 'numeric'
      });
      user.recover_token = user.encrypt(token);

      await Promise.all([user.save(), publisher.queue('SEND_USER_INSTITUTION_TOKEN_EMAIL', { user, token })])
      return handleSuccess(res, HttpStatus.OK, token)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting user')
    }
  },

  /**
     * Reset User Password
     * @description Resets a user password
     * @param {string} email
     * @param {string} password
     * @param {string} token
     * @return {object} user
     */
  async resetPass(req, res, next) {
    try {
      if (paramsNotValid(req.body.email, req.body.password, req.body.token)) {
        return handleFail(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.email, req.body.password, req.body.token))
      }
      const email = req.body.email;
      const password = req.body.password;
      const token = req.body.token;

      const user = await UserModel.findOne({email}).select('+recover_token');
      if (!user) { return handleError(res, HttpStatus.NOT_FOUND, 'User not found here') }
      if (!user.validateToken(token)) { return handleError(res, HttpStatus.UNAUTHORIZED, 'Wrong Token')}

      const jwtToken = createToken(email, user._id, user.type);
      user.password = user.encrypt(password);
      user.token = jwtToken;

      const newUser = deepCopy(user)
      await Promise.all([user.save(), publisher.queue('ADD_OR_UPDATE_USER_INSTITUTION_CACHE', { newUser })])
      return handleSuccess(res, HttpStatus.OK, null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error reseting password')
    }
  }

};

module.exports = AuthController;
