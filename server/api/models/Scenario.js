/**
* Scenario.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	type : {
  		type: 'string',
  		required: true
  	},
  	triggers: {
  		type: 'array'
  	},
  	groups: {
  		type: 'array'
  	},
  	vars: {
  		type: 'json',
  		required: true
  	},
  	contents: {
  		type: 'array',
  		required: true
  	}
  }
};

