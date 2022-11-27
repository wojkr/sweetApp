const { reviewSchema } = require("../schemas");

module.exports = validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    console.log(error);
    const message = error.details.map((d) => d.message).join(", ");
    console.log(message);
    req.flash("error", message);
    // throw new ExpressError(message, 400);
  }
  next();
};
