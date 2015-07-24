var _ = require('lodash');
var Promise = require("bluebird");

/** @module User */
module.exports = {
  attributes: {
    username: {
      type: 'string',
      unique: true,
      required: true
    },
    email: {
      type: 'email',
      unique: true,
    },
    passports: {
      collection: 'Passport',
      via: 'user'
    }

    toJSON: function () {
      var user = this.toObject();
      delete user.password;
      user.gravatarUrl = this.getGravatarUrl();
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
    return new Promise(function (resolve, reject) {
      sails.services.passport.createLocal(user, function (error, created) {
        if (error)
          return reject(error);

        resolve(created);
      });
    });
  }
};
