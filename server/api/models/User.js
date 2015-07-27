var _ = require('lodash');
var Promise = require("bluebird");

/** @module User */
module.exports = {
  attributes: {
    username: {
      type: 'string',
      unique: true,
      required: true,
      alphanumericdashed: true
    },
    email: {
      type: 'email',
      unique: true,
    },
    // passports: {
    //   collection: 'Passport',
    //   via: 'user'
    // },
    // tokens: {
    //   model: 'token'
    // },

    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      return user;
    }
  },

  beforeCreate: function (user, next) {
    if (_.isEmpty(user.username)) {
      user.username = user.email;
    }
    next();
  },

  /**
   * Register a new User with a passport
   */
  register: function (user) {
    var password = user.password;
    delete user.password;

    if (!password)
      return Promise.reject('password missing');

    return User.create(user)
    .then(function (user) {
      return Passport.create({
          protocol   : 'local',
          password   : password,
          user       : user.id,
          identifier : user.username,
          provider   : 'local'
        })
    })
    .then(function (passport) {
      return Token.create({
        user: passport.user,
        token: sails.services.passport.createToken(passport.user)
      });
    })
    .then(function (token) {
      return Promise.resolve(token.token);
    })
  }
};
