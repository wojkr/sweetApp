const passport = require("passport");
const Dessert = require("../model/dessert");
const Review = require("../model/review")
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
    console.log('in user controller')
    const newUser = await User.register(new User({ username }), password);
    console.log('in user controller', newUser)
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
        res.clearCookie("returnTo");
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

//-----------------------------------------------------------SHOW USER

module.exports.showUser = async (req, res, next) => {
  if (!req.params.id) {
    res.cookie('returnTo', req.originalUrl)
    return res.redirect("users/login")
  }
  const { id } = req.params;
  const data = await User.findById(id).populate('desserts').populate('reviews')
  res.render("users/showUser", { title: `${data.username}`, data })
}

module.exports.showAllUsers = async (req, res, next) => {
  const data = await User.find({})
  res.render('users/showAllUsers', { title: "All Users", data })
}


//-----------------------------------------------------------DELETE USER
module.exports.deleteUser = async (req, res) => {
  let reviewsToDelete = [];
  let dessertsToDelete = [];
  if (req.user.reviews.length) {
    reviewsToDelete = req.user.reviews.map(r => r._id)
  }
  if (req.user.desserts.length) {
    dessertsToDelete = req.user.desserts.map(d => d._id)
  }

  //other users reviews in our user desserts
  const returnedReviews = await returnAllReviews(dessertsToDelete, req.user._id)
  if (returnedReviews && returnedReviews.length) reviewsToDelete.push(...returnedReviews)

  console.log('in delete controllers/user')
  console.log(`All content created by user ${req.user.username} to be deleted. DESSERTS: ${dessertsToDelete.length}, REVIEWS: ${reviewsToDelete.length}`)

  // delete user.reviews + user.desserts 
  await User.updateMany({
    $or: [
      { reviews: { $in: reviewsToDelete } },
      { desserts: { $in: dessertsToDelete } }
    ]
  },
    {
      $or: [
        { $pull: { reviews: { $in: reviewsToDelete } } },
        { $pull: { desserts: { $in: dessertsToDelete } } }
      ]
    })

  //delete reviews
  await Review.deleteMany({ _id: { $in: reviewsToDelete } })
  //delete dessert
  await Dessert.deleteMany({ _id: { $in: dessertsToDelete } })

  const userId = req.user._id;
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
  }
  await User.findByIdAndDelete(userId)
  req.flash('success', 'Succesfully removed account with all content. Bye!')
  res.redirect("/users/")
}

const returnAllReviews = async function (dessertsToDelete, userId) {
  const desserts = await Dessert.find({ _id: { $in: dessertsToDelete } }).populate('reviews')
  if (desserts.length) {
    const reviewsToDelete = desserts.map(
      dessert => dessert.reviews.map(
        d => {
          if (!d.author.equals(userId))
            return d._id
        })).flat(1)
    return reviewsToDelete.filter(r => r !== undefined)
  }
}