/**
 * AppController
 *
 * @description :: Server-side logic for managing apps
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

function recurseTree(promise, tree) {
	for (var name in tree) {
		var rec = promise.populate(name);
		console.log(rec);
		rec.then(function (value) {
			console.log(value);
		});
	}
}

module.exports = {
	testSync: function(req, res) {

		var request = JSON.parse(req.body.request);

		try {
			var tree = JSON.parse(req.body.tree);
		}
		catch (e) {
			return res.badRequest('you request should contain a valid tree and request');
		}
		console.log(tree);
		console.log(request);
		var app = App.findOne()
		.where(request);
		// .then(function(app) {
		// 	console.log(app);
		// 	recurseTree(app, tree);
		// 	console.log(app);
		// });
		recurseTree(app, tree);
		res.ok('ok');
	},
	sync: function(req, res) {
		App.findOne()
		.where({name: req.body.name})
		.populate('map')
		.then(function (app) {
			console.log(req.body.updatedAt);
			console.log(app);
			var date = new Date(req.body.updatedAt);
			console.log(date);
			if (app == null)
				res.notFound({});
			else if (date == null)
				res.ok(app);
			else if (date < app.updatedAt)
				res.ok(app);
			else if (date.toString() == app.updatedAt.toString()) {
				console.log('equals');
				res.ok({});
			}
			else if (date > app.updatedAt) {
				console.log('superior');
				res.ok({});
			}
			else {
				console.log('got no idea');
				res.ok({});
			}
		});
	}
};

