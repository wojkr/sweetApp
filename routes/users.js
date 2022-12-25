const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const validateUser = require("../utils/validateUser");
const isLoggedIn = require('../utils/isLoggedIn')
const isAuth = require("../utils/isAuth").user;

router
  .route("/login")
  .get(routes.showLoginForm)
  .post(routes.passportLogin, routes.postLogin);

router
  .route("/register")
  .get(routes.showRegisterForm)
  .post(validateUser, catchAsync(routes.postRegister));

router.route("/logout").get(routes.logout);

router.route("/").get(isLoggedIn, routes.showAllUsers);
router.route("/:id")
  .get(isLoggedIn, routes.showUser)
  .delete(isAuth, routes.deleteUser);

module.exports = router;
