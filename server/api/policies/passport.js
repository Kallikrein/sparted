module.exports = function (req, res, next) {
  var passport = sails.services.passport;

  // Initialize Passport
  passport.initialize()(req, res, function () {
    next();
  });
};
