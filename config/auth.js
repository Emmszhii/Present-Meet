module.exports = {
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    // req.flash('error', 'Please Log in to view the resource');
    res.redirect('/login');
  },
};
