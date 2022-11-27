const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const methodOverride = require("method-override");

const session = require("express-session");
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const passport = require("passport");
const LocalStrategy = require("passport-local");

main().catch((err) => {
  console.log(
    "#####################################MONGO CONNECTION ERROR!##############################################"
  );
  console.log(err);
});

async function main() {
  await mongoose.connect("mongodb://localhost:27017/sweetApp");
  console.log("----DB CONNECTED----");
}

app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

const sessionConfig = {
  secret: "GemLettuceIsHidden",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// requires the model with Passport-Local Mongoose plugged in
const User = require("./model/user");

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(passport.authenticate("session"));
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || false;
  next();
});

const dessertsRoutes = require("./routes/desserts");
app.use("/desserts", dessertsRoutes);

const reviewsRoutes = require("./routes/reviews");
app.use("/desserts/:id/review", reviewsRoutes);

const usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.render("./home", { title: "Home" });
});

// const errorRoute = require("./routes/error");
// app.use("*", errorRoute);

//------------------------------------------------------------------------------------------------ERROR-HANDLING
const handleValidationErr = (err) => {
  console.log("IN THE HANDLER!");
  //   console.dir(err);
  return new ExpressError(`Validation Failed... ${err.message}`, 400);
};

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "something went wrong" } = err;
  // console.log(message);

  res
    .status(statusCode)
    .render("./error", { title: "ERROR", statusCode, message, err });
});

app.listen(3000, () => {
  console.log("LISTEN ON PORT 3000");
});
