'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    JwtStrategy = require('passport-jwt').Strategy,
    Promise = require('bluebird');

/**
 * Load passport strategies
 *
 * TODO : externalize strategies in a config file
 */
passport.loadStrategies = function () {
  var self = this;

  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done) {
      sails.models.user.findOne({ username: username })
      .then(processUser)
      .then(processPassport)
      .then(processResponse)
      .catch(errorHandler);


      function processUser(user) {
        // TODO : Promise.reject
        if (!user)
          return Promise.reject('Incorrect username.');
        else
          return sails.models.passport.findOne({
            protocol: 'local',
            user:     user.id
          }).populate('user');
      }

      function processPassport(pass) {
        // TODO : Gérer le cas où passport n'est pas défini
        return pass.validatePassword(password);
      }

      function processResponse(res) {
        // TODO : Le nom est-il adapté ?
        // TODO : Comment formater res ?
        console.log(res);
        return done(null, res.user, { message: 'Login successfull.'});
      }

      function errorHandler(err) {
        return done(err);
      }
    }
  ));

  passport.use(new JwtStrategy({
      secretOrKey: sails.config.session.secret,
      tokenBodyField: 'auth_token',
      tokenQueryParameterName: 'auth_token'
    },
    function (jwt_payload, done) {
      console.log(jwt_payload);
    })
  )

}

/**
 * Create an authentication endpoint
 * @param  {Object} req
 * @param  {Object} res
 */
passport.endpoint = function (req, res) {
  var provider = req.param('provider');

  // this.authenticate(provider)
}

passport.createLocal = function (_user, next) {
  var password = _user.password;
  delete _user.password;

  return sails.models.user.create(_user, function (err, user) {
    if (err) {
      sails.log(err);

      return next(err);
    }

    sails.models.passport.create({
      protocol   : 'local'
    , password   : password
    , user       : user.id
    , identifier : user.username
    , provider   : 'local'
    }, function (err, passport) {
      if (err) {
        return user.destroy(function (destroyErr) {
          next(destroyErr || err);
        });
      }

      next(null, user);
    });
  });
}

module.exports = passport;
