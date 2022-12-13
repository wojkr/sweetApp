const Dessert = require('../model/dessert');
const Review = require('../model/review');

module.exports.dessert = async (req, res, next) => {
    if (req.user) {
        if (req.user._id.equals("6398ab6ccc79c7ec7ffc48ee")) {
            console.log('admin pass granted')
            return next()
        }
        const dessert = await Dessert.findById(req.params.id);
        if (!dessert.author || !dessert.author.equals(req.user._id)) {
            req.flash(
                "error",
                "You have no power here, weather boy... Youre not an Author! "
            );
            return res.redirect(`/desserts/${req.params.id}`);
        }
        return next();
    }
    res.cookie("returnTo", req.originalUrl)
    req.flash('error', 'No access, log in and try again')
    res.redirect('/users/login')
};

module.exports.review = async (req, res, next) => {
    if (req.user) {
        if (req.user._id.equals("6398ab6ccc79c7ec7ffc48ee")) {
            console.log('admin pass granted')
            return next()
        }
        const review = await Review.findById(req.params.reviewId);
        if (!review.author || !review.author._id.equals(req.user._id)) {
            req.flash(
                "error",
                "You have no power here, weather boy... Youre not an Author! "
            );
            return res.redirect(`/desserts/${req.params.id}`);
        }
        return next();
    }
    res.cookie("returnTo", req.originalUrl)
    req.flash('error', 'No access, log in and try again')
    res.redirect('/users/login')
};
