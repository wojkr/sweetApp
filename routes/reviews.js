const express = require("express");
const router = express.Router({ mergeParams: true });

// const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const validateReview = require("../utils/validateReview");
const routes = require("../controllers/reviews");

router.post("/", validateReview, catchAsync(routes.postNewReview));
router.delete("/:reviewId", catchAsync(routes.deleteOneReview));

module.exports = router;
