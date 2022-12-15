if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const express = require("express");

const adminsId = process.env.ADMIN_ID
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const mongoSanitize = require('express-mongo-sanitize');
const engine = require("ejs-mate");
const methodOverride = require("method-override");
const helmet = require('helmet')

const session = require("express-session");
const cookieParser = require("cookie-parser"); //being forced to use cookie for redirecting user. Afrer calling passport.authenticate(): req.session's custom variables are destroyed... bug
app.use(cookieParser());
const flash = require("connect-flash");

const ExpressError = require("./utils/ExpressError");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const MongoStore = require('connect-mongo');

const port = process.env.PORT || 3000;
const secret = process.env.SECRET || "TheGemLettuceIsHidden";
// const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/sweetApp";
const dbUrl = "mongodb://localhost:27017/sweetApp";
main().catch((err) => {
  console.log(
    "#####################################MONGO CONNECTION ERROR!##############################################"
  );
  console.log(err);
});

async function main() {
  await mongoose.connect(dbUrl);
  console.log("----DB CONNECTED----");
}


app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require('./utils/helmetConfigCSP')

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/b789b130931413a/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
        "https://images.unsplash.com",
        "https://goldbelly.imgix.net/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// app.use(
//   helmet({
//     crossOriginEmbedderPolicy: false,
//     contentSecurityPolicy: false
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 3600 // time period in seconds
})

store.on("error", function (e) {
  console.log("-------SESSION STORE ERROR-------", e)
})

const sessionConfig = {
  store,
  name: 'sweetsession',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
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
  if (!(req.originalUrl == '/users/login' || req.originalUrl == '/users/register')) res.clearCookie('returnTo')
  res.locals.path = req.originalUrl;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || false;
  res.locals.defaultPic = 'https://res.cloudinary.com/b789b130931413a/image/upload/v1670111925/sweetApp/NO_PICTURE_gf5aio.jpg';
  res.locals.adminsId = adminsId;
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

const errorRoute = require("./routes/error");
app.use("*", errorRoute);

//------------------------------------------------------------------------------------------SEEDS IMPLEMENTATION 
//to add seeds, uncomment code below and move it before routes for express to hit it, or just simply uncomment and hit the 404 route ;
// const seeds = require(
//   './seeds/inputSeedsMiddleware'
// )
// app.use(seeds)
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

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});