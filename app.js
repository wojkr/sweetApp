if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}
const express = require("express");

const adminsId = process.env.ADMIN_ID
const defaultPic = 'https://res.cloudinary.com/b789b130931413a/image/upload/v1672100552/sweetApp/zktpwpnd3xtjpvkooquy.png';
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
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/sweetApp";
// const dbUrl = "mongodb://localhost:27017/sweetApp";
// Node >= 15 exits on unhandled rejections (e.g. connect-mongo failing to reach the DB).
// Keep the pre-15 behaviour: log and stay up, so the app can still serve error pages.
process.on("unhandledRejection", (reason) => {
  console.error("-------UNHANDLED REJECTION-------", reason);
});

main().catch((err) => {
  console.error(
    "#####################################MONGO CONNECTION ERROR!##############################################"
  );
  console.error(err);
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

let store;
try {
  store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600 // time period in seconds
  })
} catch (e) {
  console.error("-------SESSION STORE CREATION FAILED-------", e)
  console.error("Sessions are in-memory (express-session MemoryStore) because the Mongo session store could not be created.")
}

if (store) {
  store.on("error", function (e) {
    console.log("-------SESSION STORE ERROR-------", e)
  })
}

const sessionConfig = {
  store, // undefined => express-session falls back to its default MemoryStore
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
  console.log('IN THE APP.JS, req.orgUrl: ', req.originalUrl)
  res.locals.path = req.originalUrl;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || false;
  res.locals.defaultPic = defaultPic;
  res.locals.adminsId = adminsId;
  next();
});

// mongoose 6 buffers queries forever after a failed initial connect, so DB-backed requests would hang.
const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) return next(new ExpressError("Database unavailable", 503));
  next();
};
app.use(["/desserts", "/users"], requireDb);

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
  console.error(`ERROR HANDLER: ${req.method} ${req.originalUrl}`, err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);

  const isProd = process.env.NODE_ENV === "production";
  const rawStatus = err.statusCode || err.status;
  const statusCode = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599 ? rawStatus : 500;

  // The session/passport/locals middleware may not have run, so make sure every local the views use exists.
  const defaults = {
    path: req.originalUrl || "/",
    user: req.user || false,
    success: [],
    error: [],
    defaultPic,
    adminsId: adminsId || "",
    title: "ERROR",
  };
  for (const key of Object.keys(defaults)) {
    if (res.locals[key] === undefined) res.locals[key] = defaults[key];
  }

  // Raw 5xx messages (e.g. DB errors) can leak internals in production.
  const message = statusCode >= 500 && isProd
    ? "Something went wrong. Please try again later."
    : err.message || "Something went wrong.";

  res.status(statusCode).render("./error", {
    statusCode,
    message,
    errName: err.name || "Error",
    stack: isProd ? null : err.stack || null,
  }, (renderErr, html) => {
    if (renderErr) {
      console.error("ERROR PAGE RENDER FAILED:", renderErr);
      return res.status(statusCode).type("text/plain").send(`${statusCode} ERROR`);
    }
    res.send(html);
  });
});

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
