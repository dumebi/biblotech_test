const { Schema, model } = require('mongoose')
const InstitutionSchema = new Schema(
  {
    name: { type: Schema.Types.String },
    url: { type: Schema.Types.String },
    domain: { type: Schema.Types.String },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Institution = model('Institution', InstitutionSchema)

module.exports = Institution
