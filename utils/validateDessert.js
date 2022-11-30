const ExpressError = require("../utils/ExpressError");
const { dessertSchema } = require("../schemas");

module.exports = validateDessert = (req, res, next) => {
  console.log("multer parsing req.body after uploading imgs.... MUST BE FIXED. To make program works: 1.validation after uploading, 2. not verifying imgs ind JOIschemas")
  console.log("IN VALIDATE DESSERT UTILS", req.body);
  const { error } = dessertSchema.validate(req.body);
  if (error) {
    console.log(error);
    const message = error.details.map((d) => d.message).join(", ");
    console.log(message);
    req.flash("error", message);
    // throw new ExpressError(message, 400);
  }
  next();
};
//maybe dummy url and override after validation and uploading...??