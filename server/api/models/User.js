var _ = require('lodash');
var Promise = require("bluebird");

/** @module User */
module.exports = {
  attributes: {
  	email: {
  		type: 'email',
  		unique: true
  	},
  	firstName: {
  		type: 'string',
  		required: true
  	},
  	lastName: {
  		type: 'string',
  		required: true
  	},
    scenario: {
      collection: 'scenario'
    },
    friend: {
      collection: 'user'
    },
    username: {
      type: 'string',
      unique: true,
      required: true,
      alphanumericdashed: true
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
    delete user.provider;

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
  },

  registerFb: function (user) {
    if (!user)
      return Promise.reject('access_token missing');

    return User.create({ username: user })
    .then(function (user) {
      return Passport.create({
        protocol   : 'facebook',
        user       : user.id,
        identifier : user.username,
        provider   : 'facebook'
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
