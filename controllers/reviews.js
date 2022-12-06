const Dessert = require("../model/dessert");
const Review = require("../model/review");

module.exports.showTheDessert = (req, res) => {
  const { id } = req.params;
  res.redirect(`/desserts/${id}`)
}

module.exports.postNewReview = async (req, res) => {
  const { id } = req.params;
  const review = new Review(req.body);
  const dessert = await Dessert.findById(id);
  dessert.reviews.push(review);
  await review.save();
  await dessert.save();
  req.flash("success", "Successfully added a new review");
  res.redirect(`/desserts/${id}`);
};
module.exports.deleteOneReview = async (req, res) => {
  const { id, reviewId } = req.params;
  console.log("!!!! from dessert: ", id);
  console.log("!!!! deleting reivew: ", reviewId);
  await Dessert.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted a review");
  res.redirect(`/desserts/${id}`);
};
