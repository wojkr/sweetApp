const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const validateUser = require("../utils/validateUser");

router
  .route("/login")
  .get(routes.showLoginForm)
  .post(routes.passportLogin, routes.postLogin);

router
  .route("/register")
  .get(routes.showRegisterForm)
  .post(validateUser, catchAsync(routes.postRegister));

router.route("/logout").get(routes.logout);

// router.route("/user").get(routes.redirectUser);
router.route("/").get(routes.showAllUsers);
router.route("/:id").get(routes.showUser);

module.exports = router;
