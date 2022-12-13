const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/desserts");

const catchAsync = require("../utils/catchAsync");
const validateDessert = require("../utils/validateDessert");
const isLoggedIn = require("../utils/isLoggedIn")
const isAuth = require("../utils/isAuth").dessert
// Require the cloudinary library
const { cloudinary, storage } = require('../cloudinary/index');


const multer = require('multer');
const upload = multer({ storage })

//-------------------------------------------------------------------------------SHOW-ALL
router.get("/", catchAsync(routes.showAllDesserts));

//-------------------------------------------------------------------------------------NEW
router.get("/new", isLoggedIn, routes.showNewDessertForm);

router.post("/", isLoggedIn, upload.array('img'), validateDessert, catchAsync(routes.postNewDessert));

//-------------------------------------------------------------------------------------SHOW-ONE
router.get("/:id", catchAsync(routes.showOneDessert));

//-------------------------------------------------------------------------------------EDIT
router.get("/:id/edit", isLoggedIn, isAuth, catchAsync(routes.editOneDessertForm));

// router.put("/:id/edit",upload.array('img'),  catchAsync(routes.putOneDessert));
router.put("/:id/edit", isLoggedIn, isAuth, upload.array('img'), validateDessert, catchAsync(routes.putOneDessert));
//-------------------------------------------------------------------------------------DELETE
router.delete("/:id/edit", isLoggedIn, isAuth, catchAsync(routes.deleteOneDessert));

module.exports = router;
