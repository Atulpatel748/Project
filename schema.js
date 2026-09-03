const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    image: Joi.alternatives().try(Joi.string(), Joi.object()).allow(null, ""), // Allow empty string or null for image
    country: Joi.string().required(),
  }).required(),
});
