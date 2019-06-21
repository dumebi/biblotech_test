const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')
const UserRole = Object.freeze({
  STUDENT: 'student',
  ACADEMIC: 'academic',
  ADMINISTRATOR: 'administrator'
})

const UserSchema = new Schema(
  {
    // Personal Details
    name: { type: Schema.Types.String },
    email: { type: Schema.Types.String },
    institution: {type: Schema.Types.ObjectId, ref: 'Institution'},
    // Access levels
    role: { type: Schema.Types.String, enum: Object.values(UserRole), default: UserRole.STUDENT, required: true },
    password: { type: Schema.Types.String, required: true, select: false },
    token: { type: Schema.Types.String, select: true }, // JWT token
    recover_token: { type: Schema.Types.String, select: false },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

UserSchema.statics.UserRole = UserRole

UserSchema.pre('save', async function pre(next) {
  if (this.isNew) {
    const hashedPassword = bcrypt.hashSync(this.password, bcrypt.genSaltSync(5), null)
    this.password = hashedPassword
    this.role = UserRole.STUDENT
  }
  next();
});

UserSchema.methods.encrypt = function encrypt(text) {
  return bcrypt.hashSync(text, bcrypt.genSaltSync(5), null)
}

UserSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.methods.validateToken = function validateToken(token) {
  return bcrypt.compareSync(token, this.recover_token)
}
const User = model('User', UserSchema)

module.exports = User
