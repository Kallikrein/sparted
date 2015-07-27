var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token').Strategy;

var EXPIRES_IN_MINUTES = 60 * 24;
var SECRET = 'c429d2df734a9134244e2b4401976eed'
var ALGORITHM = "HS256";
var ISSUER = "http://192.168.59.100:1337/";
var AUDIENCE = "http://192.168.59.100:1337/";

/**
 * Configuration object for local strategy
 */
var LOCAL_STRATEGY_CONFIG = {
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: false
};

/**
 * Configuration object for JWT strategy
 */
var JWT_STRATEGY_CONFIG = {
  secretOrKey: SECRET,
  // issuer : ISSUER,
  // audience: AUDIENCE,
  passReqToCallback: false
};

/**
 * Configuration object for facebook token strategy
 */
 var FACEBOOK_STRATEGY_CONFIG = {
  clientID: '935243386517650',
  clientSecret: 'ba454c6e6bf89004a69f6232ad2f938d',
  passReqToCallback: false
 }

/**
 * Triggers when user authenticates via local strategy
 */
function _onLocalStrategyAuth(username, password, next) {
  User.findOne({ username: username })
  .then(processUser)
  .then(processPassport)
  .then(processResponse)
  .catch(errorHandler);


  function processUser (user) {
    if (!user)
      return Promise.reject({
        status  : 400,
        code    : 'E_USER_NOT_FOUND',
        message : username + ' not found'
      })
    else
      return Passport.findOne({
        protocol : 'local',
        user     : user.id
      }).populate('user');
  }

  function processPassport (pass) {
    return pass.validatePassword(password);
  }

  function processResponse (res) {
    return next(null, res.user, { message: 'Login successfull.'});
  }

  function errorHandler (err) {
    if (err.status && err.status === 400)
      return next(null, false, err);
    return next(err, false, {});
  }
}

/**
 * Triggers when user authenticates via JWT strategy
 */
function _onJwtStrategyAuth(payload, next) {
  var user = payload.user;

  return next(null, user, {});
}

/**
 * Triggers when user authenticates via Facebook Token strategy
 */
function _onFacebookStrategyAuth(accessToken, refreshToken, profile, next) {
  var self = this
  self.user = {};

  User.findOrCreate({ username: profile.id })
  .then(function (user) {
    self.user = user
    return Passport.create({
      protocol   : 'facebook',
      user       : user.id,
      identifier : user.username,
      provider   : 'facebook'
    })
    .then(function (passport) {
      return Token.create({
        user: passport.user,
        token: sails.services.passport.createToken(passport.user)
      });
    })
    .then(function (token) {
      var res = {
        token: token.token,
        user: self.user
      }
      return next(null, res, {});
    })
    .catch(function (err) {
      return next(err, false, {});
    })
  })

}

passport.use(new LocalStrategy(LOCAL_STRATEGY_CONFIG, _onLocalStrategyAuth));
passport.use(new JwtStrategy(JWT_STRATEGY_CONFIG, _onJwtStrategyAuth));
passport.use(new FacebookTokenStrategy(FACEBOOK_STRATEGY_CONFIG, _onFacebookStrategyAuth));

module.exports.jwtSettings = {
  expiresInMinutes: EXPIRES_IN_MINUTES,
  secret: SECRET,
  algorithm : ALGORITHM,
  // issuer : ISSUER,
  // audience : AUDIENCE
};
