/**
 * ApiController
 *
 * @description :: Server-side logic for managing apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require("bluebird");
module.exports = {
	sync: function(req, res) {
		try {
			var request = JSON.parse(req.body.request);
			var tree = JSON.parse(req.body.tree);
			var model = sails.models[req.param('model')];
		} catch (e) {
			return res.badRequest();
		}

		forArray(request, tree, model)
		.then(res.ok)
		.catch(res.ok);



		function collectionModel(model, collection) {
			for (var i in model.associations) {
				if (model.associations[i].alias == collection && model.associations[i].type == 'collection')
					return sails.models[model.associations[i].collection];
			}
		}

		function forObj (obj, tree, model) {
			return new Promise(function (resolve, reject) {
				var _obj = obj.toJSON();
				var promiseObj = {};
				for (var collection in tree) {
					if ({}.toString.call(tree[collection]).slice(8, -1) == 'Object')
						promiseObj[collection] = forArray(_obj[collection], tree[collection], collectionModel(model, collection));
				}
				Promise.props(promiseObj).then(function (collectionObj) {
					for (var collection in collectionObj)
						_obj[collection] = collectionObj[collection];
					resolve (_obj);
				});
			})
		}

		function requestItem (item, tree, model) {
			return new Promise(function (resolve, reject) {
				var response = model.findOne().where(item);
				for (collection in tree) {
					response.populate(collection);
				}
				response.exec(function(err, obj) {
					forObj(obj, tree, model).then(resolve);
				});
			});
		}

		function forArray (request, tree, model) {
			return Promise.all(request.map(function (item) {
				if ({}.toString.call(item).slice(8, -1) == 'Object') {
					return requestItem (item, tree, model);
				}
			}));
		}
	}
};
