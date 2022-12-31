const { userSchema } = require('../schemas')

module.exports = (req, res, next) => {
    console.log('IN VALIDATE USER')
    if (req.body.password2 && req.body.password !== req.body.password2) {
        req.flash("error", "passwords must match");
        return res.redirect("/users/register");
    }
    if (req.body.password2) delete req.body.password2;
    const { error } = userSchema.validate(req.body);
    if (error) {
        const message = error.details.map((d) => d.message).join(", ");
        req.flash("error", message);
        return res.redirect('/users/register')
    }
    next()
}