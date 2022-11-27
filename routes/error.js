const express = require("express");
const ExpressError = require("../utils/ExpressError");
const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
  console.log("from error route", req.originalUrl);
  next(new ExpressError("Page not found", 404));
});

module.exports = router;
