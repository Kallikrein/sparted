/**
 * AuthController
 * @description :: Server-side logic for manage user's authorization
 */
var passport = require('passport');
/**
 * Triggers when user authenticates via passport
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {Object} error Error object
 * @param {Object} user User profile
 * @param {Object} info Info if some error occurs
 * @private
 */
function _onPassportAuth(req, res, error, user, info) {
  if (error)
    return res.serverError(error);
  if (!user)
    return res.unauthorized(null, info && info.code, info && info.message);

  Token.findOne({user: user.id})
  .then(function (token) {
    // TODO Gérer le cas où le token est vide
      res.ok({
        token: token.token,
        user: user
      })
  })
}

function _onFacebookAuth(req, res, error, ret, info) {
  if (error)
    return res.serverError(error);
  if (!ret)
    return res.unauthorized(null, info && info.code, info && info.message);

  return res.ok(ret);
}

module.exports = {
  /**
   * Sign up in system
   * @param {Object} req Request object
   * @param {Object} res Response object
   */
  signup: function (req, res) {
    User.register(_.omit(req.allParams(), 'id'))
    .then(res.created)
    .catch(res.serverError);
  },

  /**
   * Sign in passport
   * @param {Object} req Request object
   * @param {Object} res Response object
   */
  signin: function (req, res) {
    if (req.param('provider') === 'local')
      passport.authenticate(
        'local',
        {session: false},
        _onPassportAuth.bind(this, req, res)
      )(req, res);
    else if (req.param('provider') === 'facebook')
      passport.authenticate(
        'facebook-token',
        {session: false},
        _onFacebookAuth.bind(this, req, res)
      )(req, res);
    else
      res.badRequest('provider missing');
  },
};
