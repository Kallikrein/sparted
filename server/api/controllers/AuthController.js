/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



  /**
   * `AuthController.login()`
   */
  login: function (req, res) {
    return sails.services.passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/coucou',
      session: false
    })(req, res, req.next);
  }
};

