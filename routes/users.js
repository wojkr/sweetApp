const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");

router
  .route("/login")
  .get(routes.showLoginForm)
  .post(routes.passportLogin, routes.postLogin);

router
  .route("/register")
  .get(routes.showRegisterForm)
  .post(catchAsync(routes.postRegister));

router.route("/logout").get(routes.logout);

module.exports = router;
