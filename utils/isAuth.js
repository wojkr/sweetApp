const Dessert = require('../model/dessert');

module.exports = async (req, res, next) => {
    const dessert = await Dessert.findById(req.params.id);
    console.log(dessert.author._id, req.user._id)
    if (!dessert.author._id.equals(req.user._id)) {
        req.flash(
            "error",
            "You have no power here, weather boy... Youre not an Author! "
        );
        return res.redirect(`/threads/${req.params.id}`);
    }
    next();
};
