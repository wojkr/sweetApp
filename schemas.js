const Joi = require("joi");

module.exports.dessertSchema = Joi.object({
  name: Joi.string().required(),
  dsc: Joi.string().required(),
  country: Joi.string().required(),
  company: Joi.string().required(),
  img: Joi.string(),
  price: Joi.number().required().min(0),
  rate: Joi.number().required().min(0).max(5),
}).required();


module.exports.reviewSchema = Joi.object({
  text: Joi.string().required(),
  rating: Joi.number().min(0).max(5).required()
})