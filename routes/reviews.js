const express = require("express");
const router = express.Router({ mergeParams: true });
const isLoggedIn = require('../utils/isLoggedIn')

// const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const validateReview = require("../utils/validateReview");
const routes = require("../controllers/reviews");

router.get("/", routes.showTheDessert);
router.post("/", isLoggedIn, validateReview, catchAsync(routes.postNewReview));
router.delete("/:reviewId", isLoggedIn, catchAsync(routes.deleteOneReview));

module.exports = router;
