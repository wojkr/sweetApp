const Dessert = require("../model/dessert");
const { cloudinary } = require('../cloudinary/index')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

module.exports.showAllDesserts = async (req, res) => {
  const data = await Dessert.find({});
  return res.render("desserts/index", { data, title: "Desserts" });
};
module.exports.showNewDessertForm = (req, res) => {
  if (req.user) {
    res.render("desserts/new", { title: "Add a new dessert" });
  } else {
    req.flash("error", "You must be logged in:");
    res.redirect("/users/login");
  }
};
module.exports.postNewDessert = async (req, res, next) => {
  const newDessert = new Dessert(req.body);
  const geoData = await geocoder.forwardGeocode({
    query: newDessert.country,
    limit: 1
  })
    .send()
  newDessert.geometry = geoData.body.features[0].geometry;
  newDessert.author = req.user._id;
  newDessert.imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
  await newDessert.save();
  req.flash("success", "Successfully added a new dessert");
  res.redirect(`/desserts/${newDessert._id}`);
};
module.exports.showOneDessert = async (req, res, next) => {
  const { id } = req.params;
  if (!req.user) res.cookie('returnTo', req.originalUrl)
  if (id.length != 24) {
    req.flash("error", "Page not found");
    return res.redirect("/desserts");
  }
  const data = await Dessert.findById(id)
    .populate("author")
    .populate("reviews")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User"
      }
    });
  if (!data) {
    req.flash("error", "Dessert not found");
    return res.redirect("/desserts");
  }
  res.render("desserts/show", { data, title: `${data.name}` });
};
module.exports.editOneDessertForm = async (req, res) => {
  const { id } = req.params;
  const data = await Dessert.findById(id);
  if (!data) {
    req.flash("error", "Dessert not found");
    return res.redirect("/desserts");
  }
  res.render("desserts/edit", { data, title: `edit: ${data.name}` });
};
module.exports.putOneDessert = async (req, res, next) => {
  const { id } = req.params;
  const dessert = await Dessert.findByIdAndUpdate(id, req.body, { runValidators: true });
  const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
  dessert.imgs.push(...imgs);
  await dessert.save();
  if (req.body.toDelete) {
    for (let filename of req.body.toDelete) {
      cloudinary.uploader.destroy(filename).then(result => console.log(result));
    }
    await dessert.updateOne({ $pull: { imgs: { filename: { $in: req.body.toDelete } } } })
  }
  req.flash("success", "successfully edited a dessert");
  res.redirect(`/desserts/${id}`);
};
module.exports.deleteOneDessert = async (req, res) => {
  const { id } = req.params;
  await Dessert.findByIdAndDelete(id);
  req.flash("success", "successfully deleted a dessert");
  res.redirect(`/desserts`);
};
