const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const UserModel = mongoose.model('User');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
}, async(email, password, done) => {
  try {
    // const email = req.body.email;
    // const password = req.body.password;
    const user = await UserModel.findOne({ email }).select('+password');
    console.log('user ', user)
    if (!user) { return done(null, false, 'User not found here'); }

    if (!user.validatePassword(password)) {
      return done(null, false, 'Wrong username/password');
    }
    return done(null, user);
  } catch (error) {
    done()
  }
  
  // UserModel.findOne({ email })
  //   .then((user) => {
  //     if(!user) {
  //       return done(null, false, { errors: { 'email or password': 'is invalid' } });
  //     }
  //     return done(null, user);
  //   }).catch(done);
}));