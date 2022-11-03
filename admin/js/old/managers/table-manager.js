KarmaFieldsAlpha.managers.table = function(field, history, resource) {

	var manager = {
		// resource: resource,
		// select: null,
		//
		// field: history.createFieldManager(resource),

		// build: function() {
		// 	if (KarmaFieldsAlpha.tables[resource.name || "grid"]) {
		// 		return KarmaFieldsAlpha.tables[resource.name || "grid"](this);
		// 	}
		// },
		getItems: function() {
			var items = history.read("table", ["items"]) || {};
			var drafts = history.read("table", ["drafts"]) || {};
			return Object.values(drafts).concat(Object.values(items)).filter(function(uri) {
				var status = history.request(["output", resource.driver, uri, "status"], ["input", resource.driver, uri, "status"]);

				return parseInt(status) < 2;
			});
		},
		request: function() {
			// this.stopRefresh();
			// var driver = field.getAttribute("driver") || "nodriver";
			var params = {};
			params.page = history.read("page", [], 1);
			params.options = history.read("options", [], {});
			params.filters = history.read("filters", [], {});
			params.order = history.read("order", [], {});

			history.write("static", ["loading"], 1);

			// field.trigger("load");


			return field.query(params).then(function(results) {
				var items = history.request(["table", "items"]);
				var count = history.request(["table", "count"]);
				results.items.forEach(function(item) {
					history.write("input", [resource.driver, item.uri], item);
				});
				history.write("static", ["loading"], 0);
				history.save(["table", "items"], results.items.map(function(item) {
					return item.uri;
				}), "nav", items);
				history.save(["table", "count"], parseInt(results.count), "nav", count);


				// field.trigger("render");
        return results;
      });
		},
		reorder: function(column) {
			var orderby = history.request(["order", "orderby"]);
			var order = history.request(["order", "order"]);
			var orderDriver = history.request(["order", "driver"]);
			var page = history.request(["page"]) || 1;
			if (orderby === column.key) {
				if (order === "asc") {
					history.save(["order", "order"], "desc", "nav", order);
				} else {
					history.save(["order", "order"], "asc", "nav", order);
				}
			} else {
				history.save(["order", "orderby"], column.key, "nav", orderby);
				history.save(["order", "driver"], column.driver, "nav", orderDriver);
				history.save(["order", "order"], column.default_order || "asc", "nav", order);
			}
			history.save(["page"], "1", "nav", page);
			return this.request();
		},

		getPpp: function() {
			var ppp = history.read("options", ["ppp"]);
			return parseInt(ppp || Number.MAX_SAFE_INTEGER);
		},
		getPage: function() {
			var page = history.read("page", []);
			return parseInt(page || 1);
		},
		setPage: function(page) {
			var currentPage = history.request(["page"]) || "1";
			history.save(["page"], page.toString(), "nav", currentPage);
		},
		getCount: function() {
			var count = manager.history.read("table", ["count"]);
			var drafts = manager.history.read("table", ["drafts"]) || [];
			return parseInt(count || 0) + drafts.length;
		},

		sync: function() {
			// this.stopRefresh();
			var output = history.request(["output"]) || {};

			if (KarmaFieldsAlpha.Object.isEmpty(output)) {
				console.log(output);
				console.warn("Output is empty");
				return;
			}
			var params = {
				input: output,
				page: history.request(["page",]) || "1",
				options: history.request(["options"]) || {},
				filters: history.request(["filters"]) || {}
			};

			history.write("static", ["loading"], 1);
			// this.renderFooter();
			// field.trigger("load");

			return field.sync(params).then(function(results) {

				// var timestamp = Date.now();

				history.setValue(["output"], null);

				var drafts = Object.values(history.request(["table", "drafts"]) || {});
				var uris = Object.values(history.request(["table", "items"]) || {});

				history.save(["table", "items"], drafts.concat(uris), null, uris);
				history.save(["table", "drafts"], null, null, drafts);

				history.merge("input", [], output);
				history.merge("input", [], {...results}); // results is maybe an empty array. Should be {driverName1: {uri1: {key1: value}}}

				// manager.save().then(function() {
				// 	manager.autoRefresh();
				// });

				history.write("static", ["loading"], 0);

				// if (manager.render) {
				// 	manager.render();
				// }

				// field.trigger("render");
			});
		},
		addItem: function() {
			// manager.stopRefresh();
			var params = {};
			// params.fields = resource.children.reduce(function(obj, child) {
			// 	if (child.key && child.default !== undefined) {
			// 		obj[child.key] = child.default;
			// 	}
			// 	return obj;
			// }, {});

			params.options = history.request(["options"]);
			params.filter = history.request(["filters"]);
			history.write("static", ["loading"], 1);
			// this.renderFooter();
			// field.trigger("load");
			return field.add(params).then(function(result) {
				history.merge("input", [resource.driver, result.uri], result);
				var drafts = Object.values(history.getValue(["table", "drafts"]) || {});
				history.save(["table", "drafts"], [...drafts, result.uri], result.uri, drafts);
				history.save(["output", resource.driver, result.uri, "status"], "1", result.uri, "0");
				history.write("static", ["loading"], 0);
				// field.trigger("render");
				// if (manager.render) {
				// 	manager.render();
				// }
				//
				// manager.autoRefresh();
			});
		},
		removeItems: function(rows) {
			var timestamp = Date.now();
			rows.forEach(function(uri) {
				history.save(["output", resource.driver, uri, "status"], "2", timestamp, "1");
			});
			var items = history.request(["table", "items"]);
			history.save(["table", "items"], items.filter(function(uri) {
				return rows.indexOf(uri) === -1;
			}), timestamp, items);



			// this.render();
			// field.trigger("render");
		},

		// save: function() {
		//
		// 	if (history.store && history.store.undos) {
		// 		var diff = KarmaFieldsAlpha.Object.unmerge(history.store.undos, this.lastData);
		// 		this.lastData = KarmaFieldsAlpha.Object.clone(history.store.undos);
		// 		//
		//
		//
		// 		return KarmaFieldsAlpha.Transfer.autoSave2(resource.driver, {diff: diff}).then(function(results) {
		// 			var timestamp = Date.now();
		// 			KarmaFieldsAlpha.Object.forEach(results, function(path, userId) {
		// 				KarmaFieldsAlpha.Transfer.get(...path).then(function(value) {
		// 					var currentValue = history.request(["output", ...path], ["input", ...path]);
		// 					history.write("input", path, value);
		// 					history.save(["output", ...path], value, timestamp, currentValue);
		// 				});
		// 			});
		// 			manager.render();
		// 		});
		// 	}
		//
		// },



		getDefaultFilters: function(resource, params) {
			if (!params) {
				params = {};
			}
			if (resource.driver && !params[resource.driver]) {
				params[resource.driver] = {};
			}
			if (resource.driver && resource.key && resource.default) {
				params[resource.driver][resource.key] = resource.default;
			}
			if (resource.children) {
				for (var i = 0; i < resource.children.length; i++) {
					this.getDefaultFilters(resource.children[i], params);
				}
			}
			return params;
		},
		getDefaultOptions: function(resource, params) {
			if (!params) {
				params = {};
			}
			if (resource.key && resource.default) {
				params[resource.key] = resource.default;
			}
			if (resource.children) {
				for (var i = 0; i < resource.children.length; i++) {
					this.getDefaultOptions(resource.children[i], params);
				}
			}
			return params;
		},

		// autoRefresh: function() {
		// 	this.stopRefresh();
		// 	this.refreshTimer = setTimeout(function() {
		// 		if (manager.onRefresh) {
		// 			manager.onRefresh();
		// 		}
		// 		manager.autoRefresh();
		// 	}, this.autorefreshInterval || 5000);
		// },
		// stopRefresh: function() {
		// 	if (this.refreshTimer) {
		// 		clearTimeout(this.refreshTimer);
		// 	}
		// }
	};
	// if (!resource.middleware) {
	// 	console.error("Middleware is missing");
	// }
	// KarmaFieldsAlpha.events.onSelectAll = function(event) {
	// 	if (document.activeElement === document.body) {
	// 		manager.select.onSelectAll(event);
	// 		event.preventDefault();
	// 	}
	// };
	// KarmaFieldsAlpha.events.onAdd = function(event) {
	// 	if (document.activeElement === document.body) {
	// 		manager.addItem();
	// 		event.preventDefault();
	// 	}
	// };
	// KarmaFieldsAlpha.events.onDelete = function(event) {
	// 	var items = manager.select.getSelectedItems();
	// 	if (items.length) {
	// 		manager.removeItems(items);
	// 		event.preventDefault();
	// 	}
	// };
	//
	// KarmaFieldsAlpha.events.onCopy = function(event) {
	// 	manager.select.onCopy(event);
	// }
	// KarmaFieldsAlpha.events.onPast = function(event) {
	// 	manager.select.onPast(event);
	// 	manager.render();
	// }
	//
	// KarmaFieldsAlpha.events.onSave = function(event) {
	// 	manager.sync();
	// 	event.preventDefault();
	// }
	// KarmaFieldsAlpha.events.onUndo = function(event) {
	// 	history.undo();
	// 	manager.render();
	//
	//
	// 	event.preventDefault();
	// }
	// KarmaFieldsAlpha.events.onRedo = function(event) {
	// 	history.redo();
	// 	manager.render();
	// 	event.preventDefault();
	// }
	//
	// KarmaFieldsAlpha.events.onUnload = function() {
	// 	// manager.save();
	// 	// manager.stopRefresh();
	// }




	// history.onUpdate = function() {
	// 	//
	// 	// manager.fields.forEach(function(field) {
	// 	// 	field.fetch();
	// 	// });
	//
	// 	// manager.fields.forEach(function(field) {
	// 	// 	field.update();
	// 	// });
	//
	// 	if (manager.renderOptions) {
	// 		manager.renderOptions();
	// 	}
	// 	manager.render();
	// 	manager.renderFooter();
	// }
	manager.history = history;


	// manager.history.store.input = localStorage.getItem("input");

	// manager.select = KarmaFieldsAlpha.selectors.grid(manager);

	// manager.optionsField = KarmaFieldsAlpha.managers.field(manager.resource.options, manager.options);


	if (resource.filter) {
		var filters = manager.getDefaultFilters(resource.filter);

		history.merge("filters", [], filters, true);
	}

	if (resource.options) {
		var options = manager.getDefaultOptions(resource.options);
		history.merge("options", [], options, true);
	}

	history.merge("options", [], {
		page: 1,
		ppp: 50
	}, true);





	manager.onRefresh = function() {
		//manager.save();
	}

	return manager;
}
