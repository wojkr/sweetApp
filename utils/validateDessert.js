const ExpressError = require("../utils/ExpressError");
const { dessertSchema } = require("../schemas");

module.exports = validateDessert = (req, res, next) => {
  console.log("IN VALIDATE DESSERT UTILS", req.body);
  const { error } = dessertSchema.validate(req.body);
  if (error) {
    console.log(error);
    const message = error.details.map((d) => d.message).join(", ");
    console.log(message);
    req.flash("error", message);
    throw new ExpressError(message, 400);
  }
  next();
};