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
function _auth(req, res, error, user, info) {
  if (error)
    return res.serverError(error);
  if (!user) {
    return res.unauthorized(null, info && info.code, info && info.message);
  }

  // console.log('Coucou', arguments);
  console.log('Hello', user)

  return Token.findOne(user).then(function (token) {
      return res.ok(token.token)
    })
    .catch(function (err) {
      return res.serverError(err);
    });
}

module.exports = {
  /**
   * Sign up in system
   * @param {Object} req Request object
   * @param {Object} res Response object
   */
  signup: function (req, res) {
    if (req.param('provider') === 'local') {
      User.register(_.omit(req.allParams(), 'id'))
      .then(res.ok)
      .catch(res.serverError);
    } else if (req.param('provider') === 'facebook') {
    } else
      res.badRequest('provider missing');
  },

  /**
   * Sign in passport
   * @param {Object} req Request object
   * @param {Object} res Response object
   */
  // TODO: Comment se comporte ce module si un login fb est fait sans que le user soit crée ?
  // TODO: Peut-on se log avec un token ?
  signin: function (req, res) {
    if (req.param('provider') === 'local')
      passport.authenticate('local', {session: false}, _auth.bind(this, req, res))(req, res);
    else if (req.param('provider') === 'facebook')
      passport.authenticate('facebook-token', {session: false}, _auth.bind(this, req, res))(req, res);
    else
      res.badRequest('provider missing');
  },
};
