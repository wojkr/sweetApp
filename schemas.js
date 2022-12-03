const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const extention = (joi) => ({
  type: 'string',
  base: BaseJoi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include html tag'
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value) return helpers.error('string.escapeHTML', { value })
        return clean
      }
    }
  }
})
const Joi = BaseJoi.extend(extention)

module.exports.dessertSchema = Joi.object({
  name: Joi.string().required().escapeHTML(),
  dsc: Joi.string().required().escapeHTML(),
  country: Joi.string().required().escapeHTML(),
  company: Joi.string().required().escapeHTML(),
  // imgs: Joi.string(),
  // author:Joi.string().required(),
  price: Joi.number().required().min(0),
  rate: Joi.number().required().min(0).max(5),
}).required();


module.exports.reviewSchema = Joi.object({
  text: Joi.string().required().escapeHTML(),
  rating: Joi.number().min(0).max(5).required()
})