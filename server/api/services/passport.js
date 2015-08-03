'use strict';

var passport = require('passport'),
    Promise = require('bluebird'),
    jwt = require('jsonwebtoken');

passport.createToken = function (user) {
  return jwt.sign({
      user: user
    },
    sails.config.session.secret,
    {
      algorithm: sails.config.jwtSettings.algorithm,
      expiresInMinutes: sails.config.jwtSettings.expiresInMinutes,
      // issuer: sails.config.jwtSettings.issuer,
      // audience: sails.config.jwtSettings.audience
    }
  )
}

module.exports = passport;
