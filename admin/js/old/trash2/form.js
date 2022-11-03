
/*
Cache handling:


caches.open("x").then(cache => {
	cache.put("/aa/bb", new Response("asdfasdfasdf", {
		status: 200,
		headers: {
			"Content-Type": "application/json"
		}
	}));
});

caches.open("x").then(cache => {
	return cache.match("/aa/bb").then(r => r.text())
})


*/

// KarmaFieldsAlpha.cache = {};
KarmaFieldsAlpha.forms = {};

KarmaFieldsAlpha.fields.form = class extends KarmaFieldsAlpha.fields.group {

	constructor(resource, parent, form) {
		super(resource, parent);

		this.prefix = "karma";

		// this.useCache = resource.use_cache ?? true;
		// this.useLocalStorage = resource.useLocalStorage ?? true;

		// this.delta = {};
		// this.original = {};
		// this.types = {};


		// this.historyIndex = 0;
		// this.historyMax = 0;
		// this.history = {};

		// this.initHistory(); -> moved in table


		// this.delta = new KarmaFieldsAlpha.Delta();

		// debug
		KarmaFieldsAlpha.forms[resource.driver || resource.key] = this;



		this.buffer = new KarmaFieldsAlpha.DeepObject();

	}


	registerType(type, ...path) {
    // const path = this.getKeyPath(keys).join("/");

		console.error("deprecated registerType");
		KarmaFieldsAlpha.Type.register(type, this.resource.driver, ...path);
  }

	registerValue(value, ...path) {
    // const path = this.getKeyPath(keys).join("/");
    // KarmaFieldsAlpha.Gateway.setOriginal(value, path);

		console.warning("probably deprecated registerValue");

		KarmaFieldsAlpha.Gateway.setOriginal(value, this.resource.driver, ...path);
  }

	// build() {
	// 	return {
	// 		class: "karma-field-form",
	// 		child: super.build()
	// 	};
	// }

	// initField() {
	// 	const field = this;
	// 	// this.events.change = function(currentField, value) {
	// 	// 	// return field.bubble("submit"); //
	// 	// 	field.submit();
	// 	// };
	//
	// 	this.events.submit = async function() {
	// 		console.error("Deprecated event submit");
	// 		// let values = await field.getModifiedValue();
	// 		//
	// 		// if (values) {
	// 		// 	// KarmaFieldsAlpha.Form.cache = {};
	// 		// 	return this.save(values);
	// 		// 	// return KarmaFieldsAlpha.Form.update(resource.driver, values).then(function(results) {
	// 		// 	// 	// field.updateOriginal();
	// 		// 	// 	field.setValue(values, "set"); // -> unmodify fields
	// 		// 	// 	// field.setValue(results, "set"); // -> update value (false or true -> no effect)
	// 		// 	// 	// field.triggerEvent("modify");
	// 		// 	// 	// field.triggerEvent("set");
	// 		// 	// 	return results;
	// 		// 	// });
	// 		// }
	// 		return this.save();
	// 	};
	// }

	edit() {
		// console.warn("edit() should be catched before arriving to Form");


		// return this.bubble("change");
	}

	async submit() {
		await this.save();
	}

	getForm() {
    return this;
  }

	// getCache(type, driver, key) {
	// 	if (this.useCache && KarmaFieldsAlpha.cache[type] && KarmaFieldsAlpha.cache[type][driver]) {
	// 		return KarmaFieldsAlpha.cache[type][driver][key];
	// 	}
	// }

	// getCache(type, key) {
	// 	if (this.useCache && KarmaFieldsAlpha.cache[type] && KarmaFieldsAlpha.cache[type]) {
	// 		return KarmaFieldsAlpha.cache[type][key];
	// 	}
	// }
	//
	// // updateCache(type, driver, key, promise) {
	// // 	if (this.useCache && promise) {
	// // 		if (!KarmaFieldsAlpha.cache[type]) {
	// // 			KarmaFieldsAlpha.cache[type] = {};
	// // 		}
	// // 		if (!KarmaFieldsAlpha.cache[type][driver]) {
	// // 			KarmaFieldsAlpha.cache[type][driver] = {};
	// // 		}
	// // 		if (!KarmaFieldsAlpha.cache[type][driver][key]) {
	// // 			KarmaFieldsAlpha.cache[type][driver][key] = promise;
	// // 		}
	// // 	}
	// // }
	//
	// updateCache(type, key, promise) {
	// 	if (this.useCache && promise) {
	// 		if (!KarmaFieldsAlpha.cache[type]) {
	// 			KarmaFieldsAlpha.cache[type] = {};
	// 		}
	// 		if (!KarmaFieldsAlpha.cache[type][key]) {
	// 			KarmaFieldsAlpha.cache[type][key] = promise;
	// 		}
	// 	}
	// }

	getRemoteOptions(queryString, driver) {
		console.log("Deprecated getRemoteOptions");

		return KarmaFieldsAlpha.Gateway.getOptions((driver || this.resource.driver || "nodriver")+"?"+queryString);

		// driver = driver || this.resource.driver || "nodriver";
		//
		// const promise = KarmaFieldsAlpha.Cache.get("options", driver+"?"+queryString) ?? KarmaFieldsAlpha.Form.fetch2(driver, queryString);
		//
		// KarmaFieldsAlpha.Cache.update("options", driver+"?"+queryString, promise);
		//
		// return promise;


		// if (!KarmaFieldsAlpha.cache.options) {
		// 	KarmaFieldsAlpha.cache.options = {};
		// }
		// if (!KarmaFieldsAlpha.cache.options[driver]) {
		// 	KarmaFieldsAlpha.cache.options[driver] = {};
		// }
		// if (!KarmaFieldsAlpha.cache.options[driver][queryString]) {
		// 	KarmaFieldsAlpha.cache.options[driver][queryString] = KarmaFieldsAlpha.Form.fetch2(driver, queryString);
		// }
		// return KarmaFieldsAlpha.cache.options[driver][queryString];

		// return KarmaFieldsAlpha.Form.fetch2(driver || this.resource.driver, queryString);
  }
	//
	// async getRemoteTable(queryString, driver, rowName) {
	// 	if (!driver) {
	// 		driver = this.resource.driver || "nodriver";
	// 	}
	// 	const promise = KarmaFieldsAlpha.Cache.get("tables", driver+"?"+queryString) ?? KarmaFieldsAlpha.Form.query(driver, queryString);
	// 	KarmaFieldsAlpha.Cache.update("tables", driver+"?"+queryString, promise);
	//
	// 	const results = await promise;
	//
	// 	const ids = (results.items || results || []).map((row, index) => {
	// 		const id = row[rowName || "id"].toString();
	// 		for (let key in row) {
	// 			const path = driver+"/"+id+"/"+key;
	// 			// let value = row[key];
	// 			// if (typeof value === "number") {
	// 			// 	value = value.toString();
	// 			// } else if (typeof value !== "string") {
	// 			// 	this.types[path] = "json";
	// 			// 	value = JSON.stringify(value);
	// 			// }
	// 			// this.original[path] = value;
	//
	// 			// this.original[path] = this.sanitize(row[key], path);
	//
	// 			let value = row[key];
	// 			value = this.sanitize(value, path);
	// 			KarmaFieldsAlpha.History.setOriginalValue(value, path);
	//
	// 		}
	// 		return id;
	// 	});
	//
	//
	// 	return {
	// 		ids: ids,
	// 		count: Number(results.count) || 0,
	// 		rowName: rowName || "id"
	// 	};
	//
	// }

	// stringifyTable(table) {
	// 	table.forEach((row, index) => {
	// 		for (let key in row) {
	// 			if (typeof row[key] === "number") {
	// 				row[key] = row[key].toString();
	// 			} else if (typeof row[key] !== "string") {
	// 				this.types[index+"/"+key] = "json";
	// 				row[key] = JSON.stringify(row[key]);
	// 			}
	// 		}
	// 	});
	//
	// }

	// getDriver() {
	// 	console.warn("Deprecated function getDriver");
	// 	return this;
	// }

	getPath() {
		return [];
	}

	// readPath(keys) {
	// 	console.error("Deprecated function readPath");
	// 	return this.domain.readPath(keys.join("/"));
	// }
	//
	// writePath(keys, rawValue) {
	// 	console.error("Deprecated function writePath");
	// 	this.domain.writePath(keys.join("/"), rawValue);
	// }
	//
	// getFromPath(keys) {
	// 	console.error("Deprecated function getFromPath");
	// 	return KarmaFieldsAlpha.Form.get(this.resource.driver, keys.join("/"));
	// }

	// async addRemoteItem(num, driver) {
	// 	if (!driver) {
	// 		driver = this.resource.driver;
	// 	}
	//   const results = await KarmaFieldsAlpha.Form.add(driver, {num: num || 1});
	// 	let ids = [];
	// 	if (Array.isArray(results)) {
	// 		ids = results.map(item => {
	// 			const id = (item.id || item).toString();
	// 			KarmaFieldsAlpha.History.setOriginalValue("1", driver+"/"+id+"/trash");
	// 			return id;
	// 		});
	// 	} else if (results.id || results) {
	// 		ids = [results.id || results];
	// 	}
	// 	return ids;
	// }
	//
	// async getRemoteValue(path, expectedType) {
	// 	// const path = keys.join("/");
	// 	// if (!driver) {
	// 	// 	driver = this.resource.driver || "nodriver";
	// 	// }
	//
	// 	const promise = KarmaFieldsAlpha.Cache.get("values", path) ?? KarmaFieldsAlpha.Form.get(path);
	// 	KarmaFieldsAlpha.Cache.update("values", path, promise);
	//
	// 	let value = await promise || [];
	//
	// 	if (expectedType !== "array" && Array.isArray(value)) {
	// 		value = value[0];
	// 	}
	// 	// if (value) {
	// 	// 	value = this.sanitize(value, path);
	// 	// 	this.original[path] = value;
	// 	// }
	//
	// 	value = this.sanitize(value, path);
	// 	// this.original[path] = value || "";
	//
	// 	KarmaFieldsAlpha.History.setOriginalValue(path, value || "");
	//
	//
	// 	// Object.assign(this.original, KarmaFieldsAlpha.toFlatObject(results, path));
	// 	// KarmaFieldsAlpha.FlatObject.assign(this.original, results, path);
	//
	// 	return value;
	// }
	//
	// async getRemoteArray(path) {
	// 	// const path = keys.join("/");
	// 	// if (!driver) {
	// 	// 	driver = this.resource.driver || "nodriver";
	// 	// }
	// 	//
	// 	// const promise = this.getCache("values", driver, path) ?? KarmaFieldsAlpha.Form.get(driver, path);
	// 	// this.updateCache("values", driver, path, promise);
	// 	//
	// 	// let value = await promise;
	// 	//
	// 	// const string = JSON.stringify(value);
	// 	//
	// 	// this.original[path] = string;
	// 	// this.types[path] = "json";
	// 	//
	// 	// return string;
	//
	// 	return this.getRemoteValue(path, "array");
	// }

	// getCache(keys) {
	// 	const path = keys.join("/");
	// 	return KarmaFieldsAlpha.cache[this.resource.driver] && KarmaFieldsAlpha.cache[this.resource.driver][path];
	// }

	// setCache(value, keys) {
	// 	const path = keys.join("/");
	// 	// if (!driver) {
	// 	// 	driver = this.resource.driver || "nodriver";
	// 	// }
	// 	if (!KarmaFieldsAlpha.cache.values) {
	// 		KarmaFieldsAlpha.cache.values = {};
	// 	}
	// 	// if (!KarmaFieldsAlpha.cache.values[driver]) {
	// 	// 	KarmaFieldsAlpha.cache.values[driver] = {};
	// 	// }
	// 	// if (!KarmaFieldsAlpha.cache.values[driver][path]) {
	// 	// 	KarmaFieldsAlpha.cache.values[driver][path] = Promise.resolve(value);
	// 	// }
	//
	// 	if (!KarmaFieldsAlpha.cache.values[path]) {
	// 		KarmaFieldsAlpha.cache.values[path] = Promise.resolve(value);
	// 	}
  // }

	// async setRemoteValue(rawValue, keys) {
  //   // let value = await this.get();
  //   // value = this.prepare(value);
  //   // this.initValue(value);
	//
	// 	const path = keys.join("/");
	//
	// 	if (!KarmaFieldsAlpha.cache[this.resource.driver]) {
	// 		KarmaFieldsAlpha.cache[this.resource.driver] = {};
	// 	}
	//
  //   KarmaFieldsAlpha.cache[this.resource.driver][path] = rawValue;
  // }

	// sanitize(value, path) {
	// 	if (typeof value === "number") {
	// 		value = value.toString();
	// 	} else if (value && typeof value !== "string") {
	// 		value = JSON.stringify(value);
	// 		KarmaFieldsAlpha.fields.form.types[path] = "json";
	// 	}
	// 	return value;
	// }
	//
	// parse(value, path) {
	// 	if (KarmaFieldsAlpha.fields.form.types[path] === "json") {
	// 		value = value && JSON.parse(value) || null;
	// 	}
	// 	return value;
	// }
	//
	// sanitizeObject(flatObject) {
	// 	const obj = {};
	// 	for (let path in flatObject) {
	// 		obj[path] = this.sanitize(flatObject[path], path);
	// 	}
	// 	return obj;
	// }
	//
	// parseObject(flatObject) {
	// 	const obj = {};
	// 	for (let path in flatObject) {
	// 		obj[path] = this.parse(flatObject[path], path);
	// 	}
	// 	return obj;
	// }

	// getOriginalValue(path) {
	// 	return this.original[path];
  // }
	//
	// removeOriginalValue(path) {
  //   delete this.original[path];
  // }
	//
  // setOriginalValue(value, path) {
	// 	this.original[path] = value;
  // }
	//
	// getDeltaValue(path) {
	// 	let value = localStorage.getItem(this.resource.driver+"/"+path) ?? undefined;
	// 	return value;
  // }
	//
	// setDeltaValue(value, path) { // overrided with async by arrays
	// 	if (this.original[path] !== value && value !== undefined) {
	// 		localStorage.setItem(this.resource.driver+"/"+path, value);
	// 	} else {
	// 		localStorage.removeItem(this.resource.driver+"/"+path);
	// 	}
  // }
	//
	// removeDeltaValue(path) {
	// 	localStorage.removeItem(this.resource.driver+"/"+path);
  // }
	//
	// getDeltaObject() {
	// 	const flatObject = {};
	// 	const dir = this.resource.driver+"/";
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			flatObject[path.slice(dir.length)] = localStorage.getItem(path);
	// 		}
  // 	}
	// 	return flatObject;
  // }
	//
	//
	// emptyDelta() {
	// 	const dir = this.resource.driver+"/";
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			localStorage.removeItem(path);
	// 		}
  // 	}
  // }
	//
	// hasDelta() {
	// 	const dir = this.resource.driver+"/";
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			return true;
	// 		}
  // 	}
	// 	return false;
  // }

	getKeyPath(keys = []) {
		console.log("DEPRECATED getKeyPath");
    if (this.resource.driver) {
      keys.unshift(this.resource.driver);
    }
    return keys;
  }

	queryValue(...path) {
		if (!this.valuePromises) {
			this.valuePromises = {};
		}
		const key = path.join("/");
		if (!this.valuePromises[key]) {
			this.valuePromises[key] = KarmaFieldsAlpha.Gateway.getValue(this.resource.driver || this.resource.key, ...path);
		}
		return this.valuePromises[key];
	}


	async getRemoteValue(...path) {

		let value = this.buffer.get(...path);

		if (!value) {
			value = await this.queryValue(...path);

			if (!Array.isArray(value)) {
				value = [value];
			}

			this.buffer.set(value, ...path);
		}

		return value;
	}

	// async getRemoteValue(...path) {
	//
	// 	if (!this.valuePromises) {
	// 		this.valuePromises = {};
	// 	}
	//
	// 	const key = path.join("/");
	//
	// 	if (!this.valuePromises[key]) {
	// 		this.valuePromises[key] = KarmaFieldsAlpha.Gateway.getValue(this.resource.driver || this.resource.key, ...path);
	//
	// 		if (!Array.isArray(value)) {
	// 			this.valuePromises[key] = [this.valuePromises[key]];
	// 		}
	// 	}
	//
	// 	return this.valuePromises[key];
	//
	// }

	async fetchValue(expectedType, ...path) {



		let value = this.getDeltaValue(...path);

		if (this.resource.fetch !== false) {


			if (value === undefined) {

				value = await this.getRemoteValue(...path);

			}

		}

		// value = this.format(value, expectedType);

		return value || [];
  }

	/**
	 * used by table::duplicate
	 */
	async getValue(...path) {

		let value = this.getDeltaValue(...path);

		if (value === undefined) {

			value = await this.getRemoteValue(...path);

		}

		return value;
	}

  // setValue(value, keys) {
	setValue(type, value, ...path) {

		if (!value || value.constructor !== Array) {
			console.error("Value must be an array!");
		}

		// if (value === undefined) {
		// 	console.error("Cannot set undefined value!");
		// }
		//
		// // value = KarmaFieldsAlpha.Type.sanitize(value, this.resource.driver, ...path);
		//
		// if (value === null) {
		// 	value = [];
		// } else if (value.constructor !== Array) {
		// 	value = [value];
		// }



		// if (value !== undefined && value !== null && (this.resource.fetch === false || KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver, ...path) !== value)) {
		// -> bug when cut-past on same cells of the grid

		// if (value !== undefined && value !== null) {
		// 	this.setDeltaValue(value, ...path);
		// } else {
		// 	this.removeDeltaValue(...path);
		// }

		this.setDeltaValue(value, ...path);

		this.writeHistory(value, ...path);
  }

	// write(keys) {
	async write(...path) {
		// const path = this.getKeyPath(keys).join("/");

		if (this.resource.history !== false) {
			// let currentValue = this.getDeltaValue(path);
			let currentValue = this.getDeltaValue(...path);

			if (currentValue === undefined && this.resource.fetch !== false) {

				// currentValue = KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver, ...path);
				currentValue = await this.getRemoteValue(...path);

			}

			if (currentValue === undefined) {

				currentValue = null;

			}

			// this.writeHistory(path, currentValue);
			this.writeHistory(currentValue, ...path);
		}
	}



	// removeValue(keys) {
	removeValue(...path) {

		const delta = this.getDeltaValue(...path);

		// KarmaFieldsAlpha.DeepObject.forEach(delta, (value, ...subpath) => {
		// 	this.writeHistory(null, ...path, ...subpath);
		// });

		this.writeHistory(null, ...path);


		this.removeDeltaValue(...path);

		// this.writeHistory(null, ...path);
  }

	// async fetchArray(keys) {
	async fetchArray(...path) {

		// return await this.fetchValue(keys, "array", "json") || [];
		return await this.fetchValue("array", ...path) || [];
	}

	getOriginal(...path) {
		return KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver || this.resource.key, ...path);
	}

	// getRelationValue(...path) {
	// 	return KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver || this.resource.key, ...path);
	// }

	// fetchOriginal(...path) {
	// 	let value = KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver || this.resource.key, ...path);
	//
	// 	if (value === undefined && expectedType === "array") {
	// 		value = await KarmaFieldsAlpha.Gateway.getArrayValue(this.resource.driver || this.resource.key, ...path);
	// 	}
	//
	// 	if (value === undefined) {
	// 		value = await KarmaFieldsAlpha.Gateway.getValue(expectedType, this.resource.driver || this.resource.key, ...path);
	// 	}
	// }

	getMask(...path) {
		// noop
	}

	getExtra(...path) {
		console.error("deprecated");
		return KarmaFieldsAlpha.Delta.get("extra", this.resource.driver || this.resource.key, ...path);
	}

	setExtra(value, ...path) {
		console.error("deprecated");
		KarmaFieldsAlpha.Delta.set(value, "extra", this.resource.driver || this.resource.key, ...path);
	}
	removeExtra(...path) {
		console.error("deprecated");
		KarmaFieldsAlpha.Delta.remove("extra", this.resource.driver || this.resource.key, ...path);
	}

	writeExtra(value, ...path) {
		console.error("deprecated");
		KarmaFieldsAlpha.History.write(value, "extra", this.resource.driver || this.resource.key, ...path);

		// const value = this.getExtra(...path);
		// if (value === undefined) {
		// 	value = null;
		// }

	}






	async isModified(...path) {


		if (this.resource.fetch === false) {
			return false;
		}

		// const original = KarmaFieldsAlpha.DeepObject.clone(this.getOriginal(...path), this.getExtra(...path));
		//
		// return KarmaFieldsAlpha.DeepObject.some(this.getDeltaValue(...path), (object, ...path) => {
    //   // return (typeof object === "string") && object !== this.getOriginal(...path);
		//
		//
		//
		// 	return (typeof object === "string") && object !== KarmaFieldsAlpha.DeepObject.get(object, ...path);
		//
		//
		// 	// if (typeof object === "string") {
		// 	// 	let original = this.getOriginal(...path);
		// 	// 	if (original === undefined) {
		// 	// 		original = this.getMask(...path);
		// 	// 	}
		// 	// 	return object !== original;
		// 	// }
    // });

		// return KarmaFieldsAlpha.DeepObject.some(this.getDeltaValue(), (object, ...path) => {
		// 	return (typeof object === "string") && object !== (this.getOriginal(...path) ?? this.getExtra(...path));
    // }, ...path);


		// const value = this.getDeltaValue(...path);
		//
		// return value !== undefined && KarmaFieldsAlpha.DeepObject.some(value, () => true) && (!path.length || this.resource.fetch !== false && value !== KarmaFieldsAlpha.Gateway.getOriginal(this.resource.driver || this.resource.key, ...path));



		// return KarmaFieldsAlpha.DeepObject.some(this.getDeltaValue(), (object, ...path) => {
		// 	// return typeof object !== "object" && object !== this.getOriginal(...path);
		// 	return KarmaFieldsAlpha.DeepObject.differ(object, this.getOriginal(...path));
    // }, ...path);

		const delta = this.getDeltaValue(...path);

		// if (delta) {
		// 	const original = await this.getRemoteValue(...path);
		//
		// 	return KarmaFieldsAlpha.DeepObject.some(delta, (object, ...path) => {
		// 		return KarmaFieldsAlpha.DeepObject.differ(object, KarmaFieldsAlpha.DeepObject.get(original, ...path));
	  //   });
		// }

		if (delta) {
			// const original = await this.getRemoteValue(...path);

			return KarmaFieldsAlpha.DeepObjectAsync.some(delta, async (object, ...path) => {
				const original = await this.getRemoteValue(...path);
				return !KarmaFieldsAlpha.DeepObject.equal(object, original);
	    }, ...path);
		}


	}




	writeHistory(value, ...path) {
		if (this.resource.history !== false) {

			// -> write history data in browser history:
			// KarmaFieldsAlpha.History.writeHistory(value, this.resource.driver || this.resource.key, ...path);


			// -> write history data in localStorage:
			// const location = KarmaFieldsAlpha.Nav.getParamString();
			// const index = KarmaFieldsAlpha.Delta.get("history", location, "index") || 0;
			// KarmaFieldsAlpha.Delta.set(value, "history", location, index, this.resource.driver || this.resource.key, ...path);

			KarmaFieldsAlpha.History.write(value, this.resource.driver || this.resource.key, ...path);


		}
	}

	initValue(value, ...path) {
		console.error("deprecated");
		this.writeHistory(null, ...path);
		this.setDeltaValue(value, ...path);

		// this.setValue(value, ...path);
	}

	getDeltaValue(...path) {
		return (this.delta || KarmaFieldsAlpha.Delta).get(this.resource.driver || this.resource.key, ...path);

		// return KarmaFieldsAlpha.DeepObject.get(this.getDelta() || {}, (this.resource.driver || this.resource.key), ...path);
	}

	setDeltaValue(value, ...path) {
		(this.delta || KarmaFieldsAlpha.Delta).set(value, this.resource.driver || this.resource.key, ...path);


		// const delta = this.getDelta() || {};
		// KarmaFieldsAlpha.DeepObject.assign(delta, value, (this.resource.driver || this.resource.key), ...path);
		// this.setDelta(delta);
	}

	removeDeltaValue(...path) {
		(this.delta || KarmaFieldsAlpha.Delta).remove(this.resource.driver || this.resource.key, ...path);

		// const delta = this.getDelta();
		// if (delta) {
		// 	KarmaFieldsAlpha.DeepObject.remove(delta, (this.resource.driver || this.resource.key), ...path);
		// 	this.setDelta(delta);
		// }
	}

	getDelta() {
		console.error("deprecated");
		return KarmaFieldsAlpha.Delta.get();
		// if (!this.deltaCache) {
		// 	const delta = localStorage.getItem(this.prefix);
		// 	this.deltaCache = delta && JSON.parse(delta) || {};
		// }
		// return this.deltaCache;
	}

	setDelta(delta) {
			console.error("deprecated");
		//
		// // const prefix = this.prefix+"/"+(this.resource.driver || this.resource.key);
		//
		// delta = KarmaFieldsAlpha.DeepObject.filter(delta, value => value !== null && value !== undefined);
		//
		// localStorage.setItem(this.prefix, JSON.stringify(delta));
		//
		// // if (delta) {
		// // 	localStorage.setItem(prefix, JSON.stringify(delta));
		// // } else {
		// // 	localStorage.removeItem(prefix);
		// // }
		//
		// this.deltaCache = delta;

		KarmaFieldsAlpha.Delta.set(delta);
	}

	hasDeltaEntry() {
		console.error("deprecated");

		return this.getDeltaValue();


		// return KarmaFieldsAlpha.DeepObject.some(this.getDelta(), (value, ...path) => {
		// 	const type = KarmaFieldsAlpha.Type.get(...path);
		// 	if (type === "json") {
		// 		return value && value !== "{}";
		// 	} else {
		// 		return value !== undefined;
		// 	}
		// }, this.resource.driver || this.resource.key);

	}

	emptyDeltaEntries() {
		console.error("deprecated");
		// path = this.join(this.resource.prefix, this.resource.driver);
		// this.getBuffer().empty(path+"/");
		// this.setDelta();
		this.removeDeltaValue();
	}

	reset() {
		this.buffer.empty();
		this.valuePromises = {};
	}


	async save() {

		const driver = this.resource.driver || this.resource.key;

		if (!driver) {
			console.error("Resource driver not set");
		}

		const delta = this.getDeltaValue();

		if (delta && this.resource.fetch !== false) {

			// const parseDelta = KarmaFieldsAlpha.Type.parse(delta, driver);

			await KarmaFieldsAlpha.Gateway.update(driver, delta);

			// this.buffer.empty();
			// this.tablePromise = null;
			// this.relationPromise = null;
			// this.valuePromises = {};

			this.reset();

			// KarmaFieldsAlpha.Gateway.mergeOriginal(delta, driver);
			//
			this.removeDeltaValue();



			// KarmaFieldsAlpha.Gateway.clearCache("get/"+driver);
	    // KarmaFieldsAlpha.Gateway.clearCache("fetch/"+driver);
	    // KarmaFieldsAlpha.Gateway.clearCache("query/"+driver);


			// KarmaFieldsAlpha.Gateway.clearCache(new RegExp("^(get|fetch|query)/"+driver+"([/?].*)?$"));

		}

	}


	async saveValue(value, ...path) {

		if (!value || value.constructor !== Array) {
			console.error("Value must be an array!");
		}

		const driver = this.resource.driver || this.resource.key;
		const delta = {};

		KarmaFieldsAlpha.DeepObject.assign(delta, value, ...path);

		this.buffer.set(value, ...path);

		this.writeHistory(value, ...path);

		await KarmaFieldsAlpha.Gateway.update(driver, delta);

  }

	// hasModifiedValue() {
	// 	console.error("deprecated hasModifiedValue");
	// 	return this.hasDelta();
	// }
	//
	// // probably deprecated...
	// getModifiedValue() {
	// 	console.error("deprecated getModifiedValue");
	// 	let flatObject = this.getDeltaObject();
	// 	flatObject = parseObject(flatObject);
	// 	return KarmaFieldsAlpha.FlatObject.toDeep(flatObject);
	// }

	getState() {
    return this.state || "";
  }





	// /**
	//  * At start set an history step if there is unsaved changes
	//  */
	// initHistory() {
	// 	// const pathes = this.getDeltaPathes();
	// 	// if (pathes.length) {
	// 	// 	this.backup("init");
	// 	// 	pathes.forEach(path => {
	// 	// 		const relativePath = path.slice(this.resource.driver.length+1);
	// 	// 		const value = localStorage.getItem(path);
	// 	// 		this.writeHistory(relativePath, value);
	// 	// 	});
	// 	// }
	//
	// 	const flatObject = this.getDeltaObject();
	// 	if (Object.values(flatObject).length) {
	// 		this.backup("init");
	// 		for (let path in flatObject) {
	// 			// const relativePath = path.slice(this.resource.driver.length+1);
	// 			// const value = ;
	// 			this.writeHistory(path, flatObject[path]);
	// 		}
	// 	}
	// }


	// backupPath(path) {
	// 	const path = this.getKeyPath(keys).join("/");
	// 	const delta = this.getDelta();
	// 	let currentValue = delta && delta.getValue(path);
	//
	// 	if (currentValue === undefined) {
	// 		currentValue = null;
	// 	}
	//
	// 	KarmaFieldsAlpha.History.writeHistory(path, currentValue);
	// }

	// backup(keys) {
	async backup(...path) {

		// const id = path.join("/");
		//
		// if (id !== this.historyId) {
		//
		// 	this.historyId = id;
		//
		// 	this.write(...path);
		//
		// 	// -> write history data in browser history:
		// 	// KarmaFieldsAlpha.History.backup();
		//
		//
		//
		// 	// -> write history data in localStorage:
		// 	const location = KarmaFieldsAlpha.History.getParamString();
		// 	const index = (KarmaFieldsAlpha.Delta.get("history", location, "index") || 0) + 1;
		// 	KarmaFieldsAlpha.Delta.set({index: index, max: index}, "history", location);
		//
		// 	// erase history forward
		// 	if (KarmaFieldsAlpha.Delta.has("history", location, index)) {
		// 		KarmaFieldsAlpha.Delta.remove("history", location, index);
		// 	}
		//
		// }


		const id = path.join("/");

		if (id !== KarmaFieldsAlpha.History.id) {

			KarmaFieldsAlpha.History.id = id;

			await this.write(...path);

			KarmaFieldsAlpha.History.backup();

			// const location = KarmaFieldsAlpha.Nav.getParamString();
			//
			// // -> increase index and max
			// const index = (KarmaFieldsAlpha.Delta.get("history", location, "index") || 0) + 1;
			// KarmaFieldsAlpha.Delta.set({index: index, max: index}, "history", location);
			//
			// // erase history forward
			// if (KarmaFieldsAlpha.Delta.has("history", location, index)) {
			// 	KarmaFieldsAlpha.Delta.remove("history", location, index);
			// }

		}
	}



	// isHistoryIndexEmpty(index) {
	// 	console.error("Deprecated");
	// 	for (let path in this.history[index]) {
	// 		if (this.getLastEntry(path) !== undefined) {
	// 			return false;
	// 		}
	// 	}
	// 	return true;
	// }
	//
	// hasUndo() {
	// 	return this.historyIndex > 0;
	// }
	// hasRedo() {
	// 	return this.historyIndex < this.historyMax;
	// }
	// countUndo() {
	// 	return this.historyIndex;
	// }
	// countRedo() {
	// 	return this.historyMax - this.historyIndex;
	// }
	//
	// setHistoryIndex(index) {
	// 	while (this.historyIndex > index && this.hasUndo()) {
	// 		this.undo();
	// 	}
	// 	while (this.historyIndex < index && this.hasRedo()) {
	// 		this.redo();
	// 	}
	// }
	//
	// updateHistory() {
	// 	// for (let path in this.history[this.historyIndex]) {
	// 	// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
	// 	// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
	// 	// 	}
	// 	// }
	//
	// 	if (history.state && history.state[this.resource.driver]) {
	// 		for (let path in history.state[this.resource.driver]) {
	// 			this.setDeltaValue(history.state[this.resource.driver][path], path);
	// 		}
	// 	}
	// }
	//
	// // changeHistory(dir) {
	// // 	// if (this.historyIndex + dir >= 0 && this.historyIndex + dir < this.historyMax) {
	// // 		this.historyIndex += dir;
	// // 		for (let path in this.history[this.historyIndex]) {
	// // 			if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
	// // 				this.setDeltaValue(this.history[this.historyIndex][path], path);
	// // 			}
	// // 		}
	// // 		this.historyId = undefined;
	// // 	// }
	// // }
	//
	// undo() {
	//
	// 	if (this.historyIndex > 0) {
	// 		this.historyIndex--;
	// 		this.updateHistory();
	// 		// for (let path in this.history[this.historyIndex]) {
	// 		// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
	// 		// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
	// 		// 	}
	// 		// }
	// 		this.historyId = undefined;
	//
	//
	//
	// 		// for (let path in this.history[this.historyIndex]) {
	// 		// 	const value = this.getLastEntry(path);
	// 		// 	this.setDeltaValue(value, path);
	// 		//
	// 		// }
	// 		//
	// 		// this.historyIndex--;
	// 		// this.historyId = undefined;
	// 	}
	// }
	//
	// getLastEntry(path) {
	// 	console.error("Deprecated");
	// 	let index = this.historyIndex-1;
	// 	while (index > 0 && (!this.history[index] || this.history[index][path] === undefined)) {
	// 		index--;
	// 	}
	// 	return this.history[index] && this.history[index][path] || this.original[path];
	// }
	//
	// redo(field) {
	// 	if (this.historyIndex < this.historyMax) {
	//
	// 		this.historyIndex++;
	// 		this.updateHistory();
	// 		// for (let path in this.history[this.historyIndex]) {
	// 		// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
	// 		// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
	// 		// 	}
	// 		// }
	// 		this.historyId = undefined;
	// 	}
	// }
	//
	// writeHistory(path, rawValue) {
	// 	// if (!this.history[this.historyIndex]) {
	// 	// 	this.history[this.historyIndex] = {};
	// 	// }
	// 	// this.history[this.historyIndex][path] = rawValue;
	//
	// 	const state = history.state || {};
	//
	// 	if (!state[this.resource.driver]) {
	// 		state[this.resource.driver] = {};
	// 	}
	//
	// 	state[this.resource.driver][path] = rawValue;
	//
	// 	history.replaceState(state, null);
	// }



};

// KarmaFieldsAlpha.fields.form.types = {};



//
// KarmaFieldsAlpha.fields.form.getForm = function(driverName) {
// 	if (!KarmaFieldsAlpha.forms[driverName]) {
// 		KarmaFieldsAlpha.forms[driverName] = new KarmaFieldsAlpha.fields.form({
// 			driver: driverName
// 		});
// 	}
// 	return KarmaFieldsAlpha.forms[driverName];
// }
