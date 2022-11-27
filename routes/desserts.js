const express = require("express");
const router = express.Router({ mergeParams: true });
const routes = require("../controllers/desserts");

const catchAsync = require("../utils/catchAsync");
const validateDessert = require("../utils/validateDessert");

//-------------------------------------------------------------------------------SHOW-ALL
router.get("/", catchAsync(routes.showAllDesserts));

//-------------------------------------------------------------------------------------NEW
router.get("/new", routes.showNewDessertForm);

router.post("/", validateDessert, catchAsync(routes.postNewDessert));
//-------------------------------------------------------------------------------------SHOW-ONE
router.get("/:id", catchAsync(routes.showOneDessert));

//-------------------------------------------------------------------------------------EDIT
router.get("/:id/edit", catchAsync(routes.editOneDessertForm));

router.put("/:id/edit", validateDessert, catchAsync(routes.putOneDessert));
//-------------------------------------------------------------------------------------DELETE
router.delete("/:id/edit", catchAsync(routes.deleteOneDessert));

module.exports = router;
