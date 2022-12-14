const passport = require("passport");
const Dessert = require("../model/dessert");
const Review = require("../model/review")
const User = require("../model/user");
const cloudinary = require('cloudinary').v2;

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
  const username = req.user.username;
  if (req.user) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
  }
  req.flash("success", `Bye bye, ${username}`);
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
  const { id } = req.params;
  const userToDelete = await User.findById(id).populate('desserts');

  let reviewsToDelete = [];
  let dessertsToDelete = [];
  if (userToDelete.reviews.length) {
    reviewsToDelete = userToDelete.reviews.map(r => r._id)
  }
  if (userToDelete.desserts.length) {
    dessertsToDelete = userToDelete.desserts.map(d => d._id)
  }

  //other users reviews in our user desserts
  const returnedReviews = await returnAllReviews(dessertsToDelete, userToDelete._id)
  if (returnedReviews && returnedReviews.length) reviewsToDelete.push(...returnedReviews)

  console.log('in delete controllers/user')
  console.log(`All content created by user ${userToDelete.username} to be deleted. DESSERTS: ${dessertsToDelete.length}, REVIEWS: ${reviewsToDelete.length}`)

  //delete updated images
  let imgsToDelete = [];
  for (let dessert of userToDelete.desserts) {
    dessert.imgs.map(i => imgsToDelete.push(i.filename))
  }
  if (imgsToDelete.length) cloudinary.api.delete_resources(imgsToDelete).then(result => console.log(result));
  console.log(imgsToDelete)

  // delete user.reviews + user.desserts 
  await User.bulkWrite([
    {
      updateMany: {
        filter: {
          desserts: { $in: dessertsToDelete }
        },
        update: {
          $pull: { desserts: { $in: dessertsToDelete } }
        }
      }
    },
    {
      updateMany: {
        filter: {
          reviews: { $in: reviewsToDelete }
        },
        update: {
          $pull: { reviews: { $in: reviewsToDelete } }
        }
      }
    }
  ])

  //delete reviews
  await Review.deleteMany({ _id: { $in: reviewsToDelete } })
  //delete dessert
  await Dessert.deleteMany({ _id: { $in: dessertsToDelete } })

  if (userToDelete.equals(req.user._id)) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
    });
  }
  await User.findByIdAndDelete(userToDelete._id)
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