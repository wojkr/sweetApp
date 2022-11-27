const passport = require("passport");
const User = require("../model/user");
//----------------------------------------------------------REGISTER
// };
module.exports.showRegisterForm = (req, res, next) => {
  res.render("users/register", { title: "Register" });
};

module.exports.postRegister = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const newUser = await User.register(new User({ username }), password);
    req.login(newUser, () => {
      (err) => {
        if (err) return next(err);
      };
      req.flash(
        "success",
        `Successfully registered. Welcome, ${req.body.username}`
      );
      return res.redirect("/desserts");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

//----------------------------------------------------------LOGIN
module.exports.showLoginForm = (req, res, next) => {
  res.render("users/login", { title: "Log in" });
};

module.exports.passportLogin = passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/users/login",
});

module.exports.postLogin = (req, res, next) => {
  req.flash("success", `Welcome back, ${req.user.username}`);
  res.redirect("/desserts");
};

//----------------------------------------------------------LOGOUT
module.exports.logout = (req, res, next) => {
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
  }
  res.redirect("/desserts");
};
