
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
		KarmaFieldsAlpha.forms[resource.driver] = this;

	}


	registerType(type, keys) {
    const path = this.getKeyPath(keys).join("/");
		KarmaFieldsAlpha.Type.register(type, path);
  }

	registerValue(value, keys) {
    const path = this.getKeyPath(keys).join("/");
    KarmaFieldsAlpha.Gateway.setOriginal(value, path);
  }

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
		console.warn("edit() should be catched before arriving to Form");


		// return this.bubble("change");
	}

	async submit() {
		await this.save();
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
    if (this.resource.driver) {
      keys.unshift(this.resource.driver);
    }
    return keys;
  }

	async fetchValue(keys, expectedType) {
		// const path = this.getKeyPath(keys).join("/");
		// const delta = this.getDelta();
		//
		// let originalValue = KarmaFieldsAlpha.Gateway.getOriginal(path);
		//
		// if (originalValue === undefined || originalValue === null) {
		// 	originalValue = await KarmaFieldsAlpha.Gateway.getValue(path, expectedType);
		// }
		//
		// let value = delta && delta.getValue(path);
		//
		// if (value === undefined || value === null) {
		// 	value = originalValue;
		// }
		//
		// return KarmaFieldsAlpha.Gateway.parse(value, path);


		const path = this.getKeyPath(keys).join("/");
		const delta = this.getDelta();

		let value = delta.getValue(path);

		if (value === undefined || value === null) {
			value = KarmaFieldsAlpha.Gateway.getOriginal(path);

			if (value === undefined || value === null) {
				value = await KarmaFieldsAlpha.Gateway.getValue(path, expectedType);

			}
		}

		value = KarmaFieldsAlpha.Type.parse(value, path);

		// if (value && type === "json") {
		// 	value = JSON.parse(value);
		// }

		// return KarmaFieldsAlpha.Gateway.parse(value, path);
		return value;

		// if (!KarmaFieldsAlpha.Gateway.hasValue(path)) {
		// 	await KarmaFieldsAlpha.Gateway.getValue(path, expectedType);
		// }
		//
		// return this.getValue(keys);
  }

	getValue(keys) {
		const path = this.getKeyPath(keys).join("/");
		// const path = keys.join("/");
		const delta = this.getDelta();

		let value = delta.getValue(path);

		if (value === undefined || value === null) {
			value = KarmaFieldsAlpha.Gateway.getOriginal(path);
		}

		// if (value !== undefined && value !== null) {
		// 	const type = KarmaFieldsAlpha.Gateway.types[path];
		// 	value = KarmaFieldsAlpha.Gateway.parseValue(value, type);
		// }

		// if (type) {
		// 	value = KarmaFieldsAlpha.Gateway.parseValue(value, type);
		// }
		// if (value && type === "json") {
		// 	value = JSON.parse(value);
		// }

		value = KarmaFieldsAlpha.Type.parse(value, path);

		// return KarmaFieldsAlpha.Gateway.parse(value, path);
		return value;
	}

  setValue(value, keys) {
		const path = this.getKeyPath(keys).join("/");
		const delta = this.getDelta();
		// const path = keys.join("/");

		// if (value !== undefined && value !== null) {
		// 	const type = KarmaFieldsAlpha.Gateway.types[path];
		// 	value = KarmaFieldsAlpha.Gateway.sanitizeValue(value, type);
		// }

		// if (type) {
		// 	value = KarmaFieldsAlpha.Gateway.sanitizeValue(value, type);
		// }

		// if (value && type === "json") {
		// 	value = JSON.stringify(value);
		// }
		value = KarmaFieldsAlpha.Type.sanitize(value, path);

		// delta && delta.setValue(value, path);

		if (value !== undefined && value !== null && KarmaFieldsAlpha.Gateway.getOriginal(path) !== value) {
			delta.setValue(value, path);
			// localStorage.setItem(this.suffix+path, value);
		} else {
			delta.removeValue(path);
			// localStorage.removeItem(this.suffix+path);
		}

		delta.writeHistory(path, value);

		// KarmaFieldsAlpha.History.writeHistory(path, value);

  }

	write(keys) {
		const path = this.getKeyPath(keys).join("/");
		const delta = this.getDelta();
		let value = delta.getValue(path);

		// KarmaFieldsAlpha.History.writeHistory(path, value);
		delta.writeHistory(path, value);
	}

	removeValue(keys) {
		const path = this.getKeyPath(keys).join("/");
		const delta = this.getDelta();

		delta.removeValue(path);
		// KarmaFieldsAlpha.History.writeHistory(path, null);
		delta.writeHistory(path, null);


		// const path = keys.join("/");
		// delta && delta.empty(path);
		// KarmaFieldsAlpha.History.eraseHistory(path);
  }

	async fetchArray(keys) {
		// const path = keys.join("/");
		// const originalValue = this.getOriginalValue(path) ?? await this.getRemoteArray(path, driver);
		// const value = this.getDeltaValue(path) ?? originalValue;
		// return value && JSON.parse(value) || [];

		return await this.fetchValue(keys, "array", "json") || [];
	}

	// setArray(value, keys) {
	// 	console.log("deprecated setArray");
	// 	value = JSON.stringify(value);
	// 	return this.setDeltaValue(value, keys);
  // }
	//
	// getArray(keys) {
	// 	console.log("deprecated getArray");
	// 	// const originalValue = this.getOriginalValue(keys) ?? await this.getRemoteArray(keys);
	// 	// const value = this.getDeltaValue(keys) ?? originalValue;
	// 	// return value && JSON.parse(value) || [];
	// 	let value = this.getDeltaValue(keys);
	// 	return value && JSON.parse(value) || [];
	// }
	//
	// removeArray(keys) {
	// 	console.log("deprecated removeArray");
	// 	return this.removeDeltaValue(keys);
  // }

	isModified(value, keys) {
		const path = this.getKeyPath(keys).join("/");
		// const path = keys.join("/");
		if (value === undefined) {
			value = this.getDelta().getValue(path);
		}

		return value && value !== KarmaFieldsAlpha.Gateway.getOriginal(path) || false;
	}




	// getDeltaPathes() {
	// 	return this.getDeltaSubpathes(this.resource.driver);
  // }
	//
	// getDeltaSubpathes(dirPath) {
	// 	const subpathes = [];
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dirPath+"/")) {
	// 			subpathes.push(path);
	// 		}
  // 	}
	// 	return subpathes;
  // }

	// /**
	//  * rootPath must have trailing slash
	//  * return flatObject
	//  */
	// sliceDelta(dirPath) { // need trailing slash
	// 	const flatObj = {};
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dirPath)) {
	// 			const subpath = path.slice(dirPath.length);
	// 			flatObj[subpath] = localStorage.getItem(path);
	// 		}
  // 	}
	// 	return flatObj;
  // }
	//
	// /**
	//  * merge flatObject to deltas
	//  */
	// assignDelta(flatObject, dirPath) { // need trailing slash
	// 	for (let path in flatObject) {
	// 		this.setDeltaValue(flatObject[path], dirPath && dirPath+path || path);
  // 	}
  // }
	//
	// /**
	//  * remove all delta whose path begins width dirPath
	//  */
	// removeDelta(dirPath) { // need trailing slash
	// 	const flatObj = this.sliceDelta(dirPath);
	// 	for (let subpath in flatObj) {
	// 		localStorage.removeItem(dirPath+subpath, flatObject[subpath]);
	// 	}
  // }

	// find(path) {
	// 	if (this.children.length && path.startsWith(this.resource.driver+"/")) {
	// 		path = path.slice(this.resource.driver.length+1);
	// 		return this.children.find(child => child.find(path));
	// 	}
	// }


	async save() {

		if (!this.resource.driver) {
			console.error("Resource driver not set");
		}

		const delta = this.getDelta();


		let flatObj = delta.getObject() || {};
		flatObj = KarmaFieldsAlpha.Type.parseObject(flatObj);

		// const parsedObject = {};

		// for (let path in flatObj) {
		// 	const field = this.find(path);
		// 	parsedObject[path] = flatObj[path];
		// 	if (field && field.getType() === "json") {
		// 		parsedObject[path] = JSON.parse(parsedObject[path]);
		// 	}
		// }

		const values = KarmaFieldsAlpha.FlatObject.toDeep(flatObj);


		if (values) {

			await Promise.all(Object.entries(values).map(entry => {
				const driver = entry[0];
				const value = entry[1]
				return KarmaFieldsAlpha.Gateway.update(driver, value);
			}));

			// for (let driver in values) {
			// 	KarmaFieldsAlpha.Gateway.update(driver, values[driver]);
			// }



			// const results = await KarmaFieldsAlpha.Form.update(this.resource.driver, values);
			// if (results) {
			// 	KarmaFieldsAlpha.FlatObject.assign(flatObj, results);
			// }
			// for (let path in flatObj) {
			// 	this.original[path] = this.sanitize(flatObj[path], path);
			// }
		}

		for (let path in flatObj) {
			KarmaFieldsAlpha.Gateway.setOriginal(flatObj[path], path);
		}

		delta && delta.empty();

		return values;
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

	backup(keys) {

		// keys = this.getKeyPath(keys);
		// const id = keys.join("/");

		const path = this.getKeyPath(keys).join("/");




		if (path !== this.historyId) {
			// this.historyIndex++;
			// this.historyMax = this.historyIndex;
			// this.history[this.historyIndex] = {};
			this.historyId = path;


			const delta = this.getDelta();

			let currentValue = delta && delta.getValue(path);

			if (currentValue === undefined) {
				currentValue = null;
			}

			// KarmaFieldsAlpha.History.writeHistory(path, currentValue);
			delta.writeHistory(path, currentValue);

			//super.backup(keys);

			KarmaFieldsAlpha.History.backup();
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
