const passport = require("passport");
const User = require("../model/user");
//----------------------------------------------------------REGISTER
// };
module.exports.showRegisterForm = (req, res, next) => {
  if (req.user) {
    req.flash('error', 'You are registered already')
    res.redirect(req.cookies.returnTo || '/desserts')
  } else {
    res.render("users/register", { title: "Register" });
  }
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
      if (req.cookies.returnTo) {
        const returnToUrl = req.cookies.returnTo;
        res.clearCookie(returnTo);
        return res.redirect(returnToUrl);
      }
      return res.redirect("/desserts");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/users/register");
  }
};

//----------------------------------------------------------LOGIN
module.exports.showLoginForm = (req, res, next) => {
  const { returnTo } = req.query;
  console.log('from contr users ', returnTo)
  if (returnTo && returnTo.length > 1) {
    res.cookie('returnTo', returnTo)
  }
  if (req.user) {
    req.flash('error', 'You are logged in already')
    res.redirect(req.cookies.returnTo || '/desserts')
  } else {
    res.render("users/login", { title: "Log in" });
  }
};

module.exports.passportLogin = passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/users/login",
});

module.exports.postLogin = (req, res, next) => {
  req.flash("success", `Welcome back, ${req.user.username}`);
  if (req.cookies.returnTo) {
    const returnToUrl = req.cookies.returnTo;
    res.clearCookie("returnTo");
    return res.redirect(returnToUrl);
  }
  return res.redirect("/desserts");
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
