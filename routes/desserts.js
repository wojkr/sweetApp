const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/desserts");

const catchAsync = require("../utils/catchAsync");
const validateDessert = require("../utils/validateDessert");

// Require the cloudinary library
const {cloudinary,storage} = require('../cloudinary/index');


const multer  = require('multer')
const upload = multer({ storage })

//-------------------------------------------------------------------------------SHOW-ALL
router.get("/", catchAsync(routes.showAllDesserts));

//-------------------------------------------------------------------------------------NEW
router.get("/new", routes.showNewDessertForm);

router.post("/", upload.array('img'),validateDessert, catchAsync(routes.postNewDessert));

//-------------------------------------------------------------------------------------SHOW-ONE
router.get("/:id", catchAsync(routes.showOneDessert));

//-------------------------------------------------------------------------------------EDIT
router.get("/:id/edit", catchAsync(routes.editOneDessertForm));

router.put("/:id/edit",upload.array('img'),  catchAsync(routes.putOneDessert));
//-------------------------------------------------------------------------------------DELETE
router.delete("/:id/edit", catchAsync(routes.deleteOneDessert));

module.exports = router;
