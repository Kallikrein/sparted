/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  create: function (req, res, next) {
    sails.models.user.register(req.allParams())
    .then(res.ok)
    .catch(next);
  },

  me: function (req, res) {
    res.ok(req.user);
  }
};

