const Joi = require('joi');
const HttpStatus = require('./status')
  
exports.wallet = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      account: Joi.string().required().label("Account is required!")
    })

    await Joi.validate(req.body, schema);
    next()

  } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: 'failed',
        message: error.details,
      })
  }
}

// https://accounts.google.com/signin/continue?sarp=1&scc=1&plt=AKgnsbuqaU6vkoOVxtGNBQCrw-hrt0D5cQH8KcWKYaGjjoOoEoyImEx7CTrgz3bq1F5WQphVCDfdzQwuTyuu2vadnZh-307UJn5Xf_ayd0Lzb056fA2QkTBzTByEBeDJ6r2GD2a7kv0E