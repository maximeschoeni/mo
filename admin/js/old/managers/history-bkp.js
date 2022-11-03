// KarmaFieldsAlpha.History = {
// 	current: undefined,
// 	createInstance: function() {
// 		var history = {
// 			index: 0,
// 			flux: undefined,
// 			update: function(flux) {
// 				if (flux !== this.flux || KarmaFieldsAlpha.History.current !== this) {
// 					this.flux = flux;
// 					KarmaFieldsAlpha.History.current = this;
// 					this.index++;
// 				}
// 			}
// 		};
// 		return history;
// 	}
// };



KarmaFieldsAlpha.History = {
	instances: {},
	getInstance: function(field) {
		let driver = field.getRoot().resource.driver || "default";
		return this.getDriverInstance(driver);
	},
	getDriverInstance: function(driver) {
		if (!this.instances[driver]) {
			this.instances[driver] = {
				index: 0,
				max: 0
			};
		}
		return this.instances[driver];
	},
	update: function(field, driver) {
		let state = field.getId()+(field.state && "-"+field.state || "");
		// let instance = this.getInstance(field);
		let instance = this.getDriverInstance(driver || this.getDriver());
		if (state !== instance.state) {
			while (instance.max > instance.index) {
				field.getRoot().history.delete(instance.max); // !!! Field must be a descendant of Form
				instance.max--;
			}
			instance.index++;
			instance.max++;
			instance.state = state;
		}
		return instance.index;
	},
	save: function(field, driver, withUpdate) {
		if (withUpdate) {
			this.update(field, driver);
		}
		let index = this.getDriverInstance(driver || this.getDriver()).index;
		field.history.undos[index] = field.value;
	},
	getIndex: function(field, driver) {
		return this.getInstance(field).index;
	},
	getDriver: function(field) {
		return field.getRoot().resource.driver || "default";
	},
	getDriverIndex: function(driver) {
		return this.getDriverInstance(driver).index;
	},
	undo: function(field) {
		let instance = this.getInstance(field);
		instance.index = Math.max(instance.index-1, 0);
		instance.state = undefined;
		field.history.go(instance.index);
	},
	redo: function(field) {
		let instance = this.getInstance(field);
		instance.index = Math.min(instance.index+1, instance.max);
		instance.state = undefined;
		field.history.go(instance.index);
	}
	// update: function(driver, state) {
	// 	let instance = this.getInstance(driver);
	// 	if (state && state !== instance.state) {
	// 		instance.index++;
	// 		instance.state = state;
	// 	}
	// 	return instance.index;
	// },
	// getIndex: function(driver) {
	// 	let instance = this.getInstance(driver);
	// 	return instance.index;
	// }
};

// KarmaFieldsAlpha.History = {};
// KarmaFieldsAlpha.History.createInstance = function(store) {
// 	var history = {};
//
// 	history.store = store || {};
// 	history.fields = {};
// 	history.lastFlux = "nav";
//
//
//
// 	history.empty = function(path) {
// 		KarmaFieldsAlpha.Object.setValue(this.store, path, null);
// 	};
// 	history.getValue = function(path) {
// 		return KarmaFieldsAlpha.Object.getValue(this.store, path);
// 	};
// 	history.setValue = function(path, value, under) {
// 		// console.trace();
// 		KarmaFieldsAlpha.Object.setValue(this.store, path, value, under);
// 	};
// 	history.isEmpty = function(path) {
// 		var value = this.getValue(path);
// 		return KarmaFieldsAlpha.Object.isEmpty(value);
// 	};
// 	history.clean = function(path) {
// 		var value = this.getValue(path);
// 		value = KarmaFieldsAlpha.Object.clean(value);
// 		KarmaFieldsAlpha.Object.setValue(path, value);
// 	};
// 	history.filter = function(buffer, path, callback) {
// 		var value = this.read(buffer, path);
// 		var clone = {};
// 		for (var i in value) {
// 			if (callback(value[i])) {
// 				clone[i] = value[i];
// 			}
// 		}
// 		this.write(buffer, path, clone);
// 	};
//
// 	history.removeUndos = function() {
// 		var index = this.getValue(["index"]) || 0;
// 		this.setValue(["max"], index);
// 	};
//
//
// 	history.write = function(buffer, path, value, flux) {
//
// 		// value = KarmaFieldsAlpha.Object.clone(value);
// 		// if (buffer !== "static" && buffer !== "input") {
// 		// 	var index = this.getValue(["index"]) || 0;
// 		// 	if (buffer === "output") {
// 		// 		// this.store.max = this.store.index;
// 		// 		this.setValue(["max"], index);
// 		// 	}
// 		// 	if (this.lastFlux !== flux && flux) {
// 		// 		if (!this.isEmpty(["undos", index])) {
// 		// 		// if (index === 0 || !this.contain(["input"], ["undos", index, "output"])) {
// 		// 			index++;
// 		//
// 		// 			this.setValue(["index"], index);
// 		// 			this.setValue(["max"], index);
// 		//
// 		//
// 		// 			// this.store.undos[this.store.index] = {};
// 		//
// 		// 			// console.log(this.store.index);
// 		// 		}
// 		// 		// this.store.undos[this.store.index] = {}
// 		// 		this.lastFlux = flux;
// 		// 	}
// 		//
// 		// 	// console.log(value, this.getValue(["input", ...path]));
// 		//
// 		// 	var prev = this.getValue(["undos", index-1]);
// 		//
// 		//
// 		//
// 		// 	if (prev) {
// 		// 		var reverseValue = this.read(buffer, path, null);
// 		//
// 		// 			console.log("prev", buffer, path, value, reverseValue);
// 		//
// 		// 		this.setValue(["undos", index-1, buffer, ...path], reverseValue, true);
// 		// 	}
// 		// 	this.setValue(["undos", index, buffer, ...path], KarmaFieldsAlpha.Object.clone(value));
// 		//
// 		//
// 		// 	// if (this.contain(["input"], ["undos", index, "output"])) {
// 		// 	//
// 		// 	// 	index = Math.max(0, index-1);
// 		// 	//
// 		// 	// 	this.setValue(["index"], index);
// 		// 	// 	this.setValue(["max"], index);
// 		// 	//
// 		// 	// 	this.lastFlux = "xx";
// 		// 	//
// 		// 	// }
// 		//
// 		//
// 		// }
// 		// KarmaFieldsAlpha.Object.setValue(this.store, [buffer, ...path], value);
//
//
// 		// console.log([buffer, ...path], value, KarmaFieldsAlpha.Object.clone(value));
//
// 		this.setValue([buffer, ...path], KarmaFieldsAlpha.Object.clone(value));
//
// 		// console.log(this.store.output);
//
// 	};
//
// 	history.save = function(path, value, flux, prevValue) {
// 		if (value !== undefined && value !== prevValue) {
// 			var index = this.getValue(["index"]) || 0;
// 			if (flux && this.lastFlux !== flux) {
// 				if (!this.isEmpty(["undos", index])) {
// 					index++;
// 					this.setValue(["undos", index], {});
// 					this.setValue(["index"], index);
// 					this.setValue(["max"], index);
// 				}
// 				this.lastFlux = flux;
// 			}
// 			if (index > 0) {
// 				this.setValue(["undos", index-1, ...path], prevValue, true);
// 			}
// 			this.setValue(["undos", index, ...path], KarmaFieldsAlpha.Object.clone(value));
// 		}
//
// 		this.setValue(path, KarmaFieldsAlpha.Object.clone(value));
//
// 		// console.log("save", path, value);
// 		// console.trace();
// 	};
//
// 	history.merge = function(buffer, path, value, underDeprecated) {
// 		if (value && typeof value === "object") {
// 			var object = this.getValue([buffer, ...path]);
// 			if (!object || typeof object !== "object") {
// 				object = {};
// 				this.setValue([buffer, ...path], object);
// 			}
// 			KarmaFieldsAlpha.Object.merge(object, value, underDeprecated);
// 		} else if (value !== undefined) {
// 			this.setValue([buffer, ...path], value, underDeprecated);
// 		}
// 	};
//
// 	history.read = function(buffer, path, defaultValue) {
//
// 		var value = this.getValue([buffer, ...path]);
// 		// if (value === undefined && buffer === "output") {
// 		// 	value = this.getValue(["input", ...path]);
// 		// }
// 		if (value === undefined) {
// 			return defaultValue;
// 		}
// 		return KarmaFieldsAlpha.Object.clone(value);
// 	};
//
// 	history.request = function(...paths) {
// 		var value;
// 		var i = 0;
// 		while (i < paths.length && value === undefined) {
// 			value = this.getValue(paths[i]);
// 			i++;
// 		}
// 		return KarmaFieldsAlpha.Object.clone(value);
// 	};
//
// 	history.undo = function(callback) {
// 		// if (this.hasUndo()) {
// 			// var temp =  this.store.undos[this.store.index];
// 			// this.store.undos[this.store.index] = this.store.undos[--this.store.index];
// 			// KarmaFieldsAlpha.Object.merge(this.store, temp);
// 			var index = this.getValue(["index"]);
// 			var prev = this.getValue(["undos", index-1]);
// 			if (prev) {
// 				// console.log("prev", prev);
// 				// prev = KarmaFieldsAlpha.Object.clone(prev);
// 				KarmaFieldsAlpha.Object.merge(this.store, prev);
//
// 				this.setValue(["index"], index-1);
// 			}
// 		// }
// 	};
// 	history.redo = function(callback) {
// 		// if (this.hasRedo()) {
// 			// var temp =  this.store.undos[this.store.index];
// 			// this.store.undos[this.store.index] = this.store.undos[++this.store.index];
// 			// KarmaFieldsAlpha.Object.merge(this.store, temp);
// 			var index = this.getValue(["index"]) || 0;
// 			// var current = this.getValue(["undos", index]);
// 			var next = this.getValue(["undos", index+1]);
//
// 			if (next) {
// 				// this.setValue(["undos", index+1], current);
// 				// this.setValue(["undos", index], next);
// 				// console.log("next", next);
// 				// next = KarmaFieldsAlpha.Object.clone(next);
//
// 				KarmaFieldsAlpha.Object.merge(this.store, next);
// 				this.setValue(["index"], index+1);
// 			}
// 		// }
// 	};
// 	history.hasUndo = function(callback) {
// 		var index = this.getValue(["index"]) || 0;
// 		var min = this.getValue(["min"]) || 0;
// 		return index > min;
// 	};
// 	history.hasRedo = function(callback) {
// 		var index = this.getValue(["index"]) || 0;
// 		var max = this.getValue(["max"]) || 0;
// 		return index < max;
// 	};
//
// 	history.diff = function(path1, path2) {
// 		var obj1 = this.getValue(path1) || {};
// 		var obj2 = this.getValue(path2) || {};
//
// 		// console.log(obj1, obj2);
// 		return KarmaFieldsAlpha.Object.diff(obj1, obj2);
// 	};
// 	history.isModified = function(buffer, path) {
// 		if (buffer === "output") {
// 			return !this.contain(["input", ...path], ["output", ...path]);
// 		}
// 	};
// 	history.contain = function(path1, path2) {
// 		var obj1 = this.getValue(path1) || {};
// 		var obj2 = this.getValue(path2) || {};
//
// 		// console.log(obj1, obj2, KarmaFieldsAlpha.Object.compare(obj1, obj2));
// 		// console.log("history.contain", path1, path2, obj1, obj2, KarmaFieldsAlpha.Object.contain(obj1, obj2));
// 		return KarmaFieldsAlpha.Object.compare(obj1, obj2);
// 	};
//
// 	history.createFieldManager = function(resource) {
// 		var manager = {
// 			resource: resource,
// 			history: history,
// 			events: {},
// 			data: {}, // -> store custom values for fields
// 			build: function() {
// 				if (manager.resource.label) {
// 					return [
// 						{
// 							tag: "label",
// 							init: function(label) {
// 								this.element.htmlFor = manager.getId();
// 								this.element.innerText = manager.resource.label;
// 							}
// 						},
// 						KarmaFieldsAlpha.fields[manager.resource.name || manager.resource.field || "group"](manager)
// 					];
// 				} else {
// 					return [
// 						KarmaFieldsAlpha.fields[manager.resource.name || manager.resource.field || "group"](manager)
// 					];
// 				}
// 			},
// 			buildSingle: function() {
// 				return KarmaFieldsAlpha.fields[manager.resource.name || manager.resource.field || "group"](manager);
// 			},
// 			createChild: function(resource) {
// 				var child = history.createFieldManager(resource);
// 				child.parent = this;
// 				// child.fieldId = child.path.join("-");
// 				return child;
// 			},
// 			trigger: function(eventName) {
// 				if (this.events[eventName]) {
// 					this.events[eventName]();
// 				} else if (this.parent) {
// 					this.parent.trigger(eventName);
// 				}
// 			},
// 			getAttribute: function(attr) {
// 				if (this[attr] !== undefined) {
// 					return this[attr];
// 				} else if (manager.resource[attr] !== undefined) {
// 					return manager.resource[attr];
// 				} else if (this.parent) {
// 					return this.parent.getAttribute(attr);
// 				}
// 			},
// 			getId: function() {
// 				var childKeys = this.getAttribute("child_keys") || [];
// 				return this.getFullPath().concat(childKeys).join("-");
// 			},
// 			getPath: function() {
// 				var path = [];
// 				var driver = this.getAttribute("driver");
// 				var uri = this.getAttribute("uri");
// 				var key = this.getAttribute("key");
// 				if (driver) {
// 					path.push(driver);
// 				}
// 				if (uri) {
// 					path.push(uri);
// 				}
// 				if (key) {
// 					path.push(key);
// 				}
// 				return path;
// 			},
// 			getFullPath: function(bufferName) {
// 				var path = [];
// 				var buffer = this.getAttribute(bufferName || "buffer");
// 				var driver = this.getAttribute("driver");
// 				var uri = this.getAttribute("uri");
// 				var key = this.getAttribute("key");
// 				if (buffer) {
// 					path.push(buffer);
// 				}
// 				if (driver) {
// 					path.push(driver);
// 				}
// 				if (uri) {
// 					path.push(uri);
// 				}
// 				if (key) {
// 					path.push(key);
// 				}
// 				return path;
// 			},
//
// 			getValue: function() {
// 				var buffer = this.getAttribute("buffer");
// 				var outputBuffer = this.getAttribute("outputBuffer");
// 				var path = this.getPath();
// 				var value;
// 				if (outputBuffer) {
// 					value = history.read(outputBuffer, path);
// 				}
// 				if (value === undefined && buffer) {
// 					value = history.read(buffer, path);
// 				}
// 				var childKeys = this.getAttribute("child_keys");
// 				if (childKeys && value && typeof value === "object") {
// 					value = KarmaFieldsAlpha.Object.getValue(value, childKeys);
// 				}
// 				return value;
// 			},
// 			setValue: function(value, context) {
// 				var id = this.getId();
//
// 				this.write(value, id);
//
// 				var multiedit = this.getAttribute("multiedit");
// 				var selection = this.getAttribute("selection");
//
// 				if (multiedit && selection) {
// 					selection.onMultiEdit(this, value, id);
// 				}
//
//
//
// 				this.trigger("update");
// 				this.trigger("modify");
// 				if (context && manager.resource.submit_mode === context) {
// 					this.trigger("submit");
// 				}
// 			},
// 			write: function(value, id) {
// 				var buffer = this.getAttribute("buffer");
// 				var outputBuffer = this.getAttribute("outputBuffer");
// 				var childKeys = this.getAttribute("child_keys");
// 				var path = this.getPath();
// 				var currentValue = history.request([outputBuffer, ...path], [buffer, ...path]);
//
// 				if (childKeys) {
// 					var parentValue = currentValue && KarmaFieldsAlpha.Object.clone(currentValue) || {};
// 					KarmaFieldsAlpha.Object.setValue(parentValue, childKeys, value);
//
// 					// console.log(parentValue);
// 					value = KarmaFieldsAlpha.Object.clean(parentValue);
// 				}
//
// 				if (outputBuffer) {
// 					history.removeUndos();
// 					history.save([outputBuffer, ...path], value, id, currentValue);
// 				} else {
// 					history.save([buffer, ...path], value, id, currentValue);
// 				}
//
//
// 			},
// 			isModified: function() {
// 				let buffer = this.getAttribute("buffer");
// 				let outputBuffer = this.getAttribute("outputBuffer");
// 				if (buffer && outputBuffer) {
// 					let path = this.getPath();
// 					let outputObj = history.getValue([outputBuffer, ...path]);
// 					if (outputObj !== undefined) {
// 						let inputObj = history.getValue([buffer, ...path]);
// 						return KarmaFieldsAlpha.Object.clean(outputObj) !== KarmaFieldsAlpha.Object.clean(inputObj);
// 					}
// 				}
// 				return false;
//
//
// 				// let obj1 = history.getValue([buffer, ...path]);
// 				// let obj2 = history.getValue([outputBuffer, ...path]);
// 				//
// 				// console.log(path, KarmaFieldsAlpha.Object.clean(obj1), KarmaFieldsAlpha.Object.clean(obj2));
// 				//
// 				// return buffer && outputBuffer && KarmaFieldsAlpha.Object.clean(history.getValue([buffer, ...path])) !== KarmaFieldsAlpha.Object.clean(history.getValue([outputBuffer, ...path]));
// 			},
// 			fetchValue: function(forceReload) {
// 				var childKeys = manager.getAttribute("child_keys");
// 				var value = this.getValue();
// 				if (!forceReload && value !== undefined) {
// 					return Promise.resolve(value);
// 				} else {
// 					var promise = this.getPromise();
// 					if (promise) {
// 						return promise.then(function(value) {
//
//
// 							if (childKeys) {
//
// 								return KarmaFieldsAlpha.Object.getValue(value, childKeys);
// 							}
//
// 							return value;
// 						});
// 					} else {
// 						if (manager.resource.default !== undefined) {
// 							// var outputBuffer = this.getAttribute("outputBuffer");
// 							manager.write(manager.resource.default);
// 						}
// 						return Promise.resolve(manager.resource.default);
// 					}
// 				}
// 			},
// 			getPromise: function() {
//
//
//
// 				if (manager.resource.key) {
// 					var driver = this.getAttribute("driver");
// 					var uri = this.getAttribute("uri");
//
// 					if (driver && uri) {
// 						if (!this.promise) {
// 							this.promise = KarmaFieldsAlpha.Transfer.get(driver, uri, manager.resource.key, manager.resource.cache).then(function(value) {
// 								// var buffer = manager.getAttribute("buffer");
// 								var path = manager.getFullPath();
//
// 								history.setValue(path, value);
//
// 								return value;
// 							});
// 						}
// 						return this.promise;
// 					}
// 				} else if (this.parent) {
// 					return this.parent.getPromise();
// 				}
// 			},
// 			fetchOptions: function(params) {
// 				var driver = this.getAttribute("fetch_driver") || this.getAttribute("driver");
// 				var key = this.getAttribute("fetch_key") || this.getAttribute("key");
// 				if (key && driver) {
// 					if (!params) {
// 						params = {};
// 					}
// 					params.filters = this.getAttribute("fetch_filters") || history.read("filters", []);
//
//
// 					return KarmaFieldsAlpha.Transfer.fetch(driver, key, params);
// 				} else {
// 					return Promise.resolve();
// 				}
// 	    },
// 			query: function(params) { // -> moved from table-manager
// 				var driver = this.getAttribute("query_driver") || this.getAttribute("driver");
// 				return KarmaFieldsAlpha.Transfer.query(driver, params);
// 			},
// 			sync: function(params) { // -> moved from table-manager
// 				var driver = this.getAttribute("sync_driver") || this.getAttribute("driver");
// 				return KarmaFieldsAlpha.Transfer.update(driver, params);
// 			},
// 			add: function(params) { // -> moved from table-manager
// 				var driver = this.getAttribute("sync_driver") || this.getAttribute("driver");
// 				var children = this.getAttribute("children") || [];
// 				params.fields = children.reduce(function(obj, child) {
// 					if (child.key && child.default !== undefined) {
// 						obj[child.key] = child.default;
// 					}
// 					return obj;
// 				}, {});
// 				return KarmaFieldsAlpha.Transfer.add(driver, params);
// 			}
// 		};
// 		return manager;
// 	};
//
//
// 	return history;
// };
