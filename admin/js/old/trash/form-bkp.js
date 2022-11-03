
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

KarmaFieldsAlpha.cache = {};
KarmaFieldsAlpha.forms = {};

KarmaFieldsAlpha.fields.form = class extends KarmaFieldsAlpha.fields.group {

	constructor(resource, parent, form) {
		super(resource, parent);

		this.useCache = resource.use_cache ?? true;
		this.useLocalStorage = resource.useLocalStorage ?? true;

		this.delta = {};
		this.original = {};
		this.types = {};


		this.historyIndex = 0;
		this.historyMax = 0;
		this.history = {};

		// this.initHistory(); -> moved in table

		// debug
		KarmaFieldsAlpha.forms[resource.driver] = this;

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

	getCache(type, driver, key) {
		if (this.useCache && KarmaFieldsAlpha.cache[type] && KarmaFieldsAlpha.cache[type][driver]) {
			return KarmaFieldsAlpha.cache[type][driver][key];
		}
	}

	updateCache(type, driver, key, promise) {
		if (this.useCache && promise) {
			if (!KarmaFieldsAlpha.cache[type]) {
				KarmaFieldsAlpha.cache[type] = {};
			}
			if (!KarmaFieldsAlpha.cache[type][driver]) {
				KarmaFieldsAlpha.cache[type][driver] = {};
			}
			if (!KarmaFieldsAlpha.cache[type][driver][key]) {
				KarmaFieldsAlpha.cache[type][driver][key] = promise;
			}
		}
	}

	getRemoteOptions(queryString, driver) {
		driver = driver || this.resource.driver || "nodriver";

		const promise = this.getCache("options", driver, queryString) ?? KarmaFieldsAlpha.Form.fetch2(driver, queryString);

		this.updateCache("options", driver, queryString, promise);

		return promise;


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

	async getRemoteTable(queryString, driver, rowName) {
		if (!driver) {
			driver = this.resource.driver || "nodriver";
		}
		const promise = this.getCache("tables", driver, queryString) ?? KarmaFieldsAlpha.Form.query(driver, queryString);
		this.updateCache("tables", driver, queryString, promise);

		const results = await promise;

		const ids = (results.items || results || []).map((row, index) => {
			const id = row[rowName || "id"].toString();
			for (let key in row) {
				const path = id+"/"+key;
				// let value = row[key];
				// if (typeof value === "number") {
				// 	value = value.toString();
				// } else if (typeof value !== "string") {
				// 	this.types[path] = "json";
				// 	value = JSON.stringify(value);
				// }
				// this.original[path] = value;

				this.original[path] = this.sanitize(row[key], path);
			}
			return id;
		});


		return {
			ids: ids,
			count: Number(results.count) || 0,
			rowName: rowName || "id"
		};

	}

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

	getDriver() {
		console.warn("Deprecated function getDriver");
		return this;
	}

	getPath() {
		return [];
	}

	readPath(keys) {
		console.error("Deprecated function readPath");
		return this.domain.readPath(keys.join("/"));
	}

	writePath(keys, rawValue) {
		console.error("Deprecated function writePath");
		this.domain.writePath(keys.join("/"), rawValue);
	}

	getFromPath(keys) {
		console.error("Deprecated function getFromPath");
		return KarmaFieldsAlpha.Form.get(this.resource.driver, keys.join("/"));
	}

	async addRemoteItem(num, driver) {
	  const results = await KarmaFieldsAlpha.Form.add(driver || this.resource.driver, {num: num || 1});
		let ids = [];
		if (Array.isArray(results)) {
			ids = results.map(item => {
				const id = (item.id || item).toString();
				this.setOriginalValue("1", id+"/trash");
				return id;
			});
		} else if (results.id || results) {
			ids = [results.id || results];
		}
		return ids;
	}

	async getRemoteValue(path, driver, expectedType) {
		// const path = keys.join("/");
		if (!driver) {
			driver = this.resource.driver || "nodriver";
		}

		const promise = this.getCache("values", driver, path) ?? KarmaFieldsAlpha.Form.get(driver, path);
		this.updateCache("values", driver, path, promise);

		let value = await promise || [];

		if (expectedType !== "array" && Array.isArray(value)) {
			value = value[0];
		}
		// if (value) {
		// 	value = this.sanitize(value, path);
		// 	this.original[path] = value;
		// }

		value = this.sanitize(value, path);
		this.original[path] = value || "";


		// Object.assign(this.original, KarmaFieldsAlpha.toFlatObject(results, path));
		// KarmaFieldsAlpha.FlatObject.assign(this.original, results, path);

		return value;
	}

	async getRemoteArray(path, driver) {
		// const path = keys.join("/");
		// if (!driver) {
		// 	driver = this.resource.driver || "nodriver";
		// }
		//
		// const promise = this.getCache("values", driver, path) ?? KarmaFieldsAlpha.Form.get(driver, path);
		// this.updateCache("values", driver, path, promise);
		//
		// let value = await promise;
		//
		// const string = JSON.stringify(value);
		//
		// this.original[path] = string;
		// this.types[path] = "json";
		//
		// return string;

		return this.getRemoteValue(path, driver, "array");
	}

	// getCache(keys) {
	// 	const path = keys.join("/");
	// 	return KarmaFieldsAlpha.cache[this.resource.driver] && KarmaFieldsAlpha.cache[this.resource.driver][path];
	// }

	setCache(value, keys, driver) {
		const path = keys.join("/");
		if (!driver) {
			driver = this.resource.driver || "nodriver";
		}
		if (!KarmaFieldsAlpha.cache.values) {
			KarmaFieldsAlpha.cache.values = {};
		}
		if (!KarmaFieldsAlpha.cache.values[driver]) {
			KarmaFieldsAlpha.cache.values[driver] = {};
		}
		if (!KarmaFieldsAlpha.cache.values[driver][path]) {
			KarmaFieldsAlpha.cache.values[driver][path] = Promise.resolve(value);
		}
  }

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

	sanitize(value, path) {
		if (typeof value === "number") {
			value = value.toString();
		} else if (value && typeof value !== "string") {
			value = JSON.stringify(value);
			this.types[path] = "json";
		}
		return value;
	}

	parse(value, path) {
		if (value && this.types[path] === "json") {
			value = JSON.parse(value);
		}
		return value;
	}

	sanitizeObject(flatObject) {
		const obj = {};
		for (let path in flatObject) {
			obj[path] = this.sanitize(flatObject[path], path);
		}
		return obj;
	}

	parseObject(flatObject) {
		const obj = {};
		for (let path in flatObject) {
			obj[path] = this.parse(flatObject[path], path);
		}
		return obj;
	}

	getOriginalValue(path) {
		return this.original[path];
  }

	removeOriginalValue(path) {
    delete this.original[path];
  }

  setOriginalValue(value, path) {
		this.original[path] = value;
  }

	getDeltaValue(path) {
		let value = localStorage.getItem(this.resource.driver+"/"+path) ?? undefined;
		return value;
  }

	setDeltaValue(value, path) { // overrided with async by arrays
		if (this.original[path] !== value && value !== undefined) {
			localStorage.setItem(this.resource.driver+"/"+path, value);
		} else {
			localStorage.removeItem(this.resource.driver+"/"+path);
		}
  }

	removeDeltaValue(path) {
		localStorage.removeItem(this.resource.driver+"/"+path);
  }

	getDeltaObject() {
		const flatObject = {};
		const dir = this.resource.driver+"/";
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (path.startsWith(dir)) {
				flatObject[path.slice(dir.length)] = localStorage.getItem(path);
			}
  	}
		return flatObject;
  }


	emptyDelta() {
		const dir = this.resource.driver+"/";
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (path.startsWith(dir)) {
				localStorage.removeItem(path);
			}
  	}
  }

	hasDelta() {
		const dir = this.resource.driver+"/";
		for (let i = 0; i < localStorage.length; i++) {
			let path = localStorage.key(i);
			if (path.startsWith(dir)) {
				return true;
			}
  	}
		return false;
  }

	async fetchValue(keys, driver, expectedType) {
		// const path = keys.join("/");
		const path = this.getKeyPath(keys).join("/");

		const originalValue = this.getOriginalValue(path) ?? await this.getRemoteValue(path, driver, expectedType);
		let value = this.getDeltaValue(path) ?? originalValue;
		return this.parse(value, path);
  }

	getValue(keys, driver) {
		const path = this.getKeyPath(keys).join("/");
		// const path = keys.join("/");
		let value = this.getDeltaValue(path); // ?? originalValue;
		return this.parse(value, path);
	}

  setValue(value, keys) {
		const path = this.getKeyPath(keys).join("/");
		// const path = keys.join("/");
		value = this.sanitize(value, path);
		this.setDeltaValue(value, path);
		this.writeHistory(path, value);
  }

	removeValue(keys) {
		const path = keys.join("/");
		this.removeDeltaValue(path);
		this.writeHistory(path, undefined);
  }

	async fetchArray(keys, driver) {
		// const path = keys.join("/");
		// const originalValue = this.getOriginalValue(path) ?? await this.getRemoteArray(path, driver);
		// const value = this.getDeltaValue(path) ?? originalValue;
		// return value && JSON.parse(value) || [];

		return await this.fetchValue(keys, driver, "array") || [];
	}

	setArray(value, keys) {
		console.log("deprecated setArray");
		value = JSON.stringify(value);
		return this.setDeltaValue(value, keys);
  }

	getArray(keys) {
		console.log("deprecated getArray");
		// const originalValue = this.getOriginalValue(keys) ?? await this.getRemoteArray(keys);
		// const value = this.getDeltaValue(keys) ?? originalValue;
		// return value && JSON.parse(value) || [];
		let value = this.getDeltaValue(keys);
		return value && JSON.parse(value) || [];
	}

	removeArray(keys) {
		console.log("deprecated removeArray");
		return this.removeDeltaValue(keys);
  }

	isModified(value, keys) {
		const path = keys.join("/");
		let delta = value ?? this.getDeltaValue(path);
		return delta && delta !== this.getOriginalValue(path) || false;
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



	async save() {

		const flatObj = this.getDeltaObject();
		const values = KarmaFieldsAlpha.FlatObject.toDeep(this.parseObject(flatObj));

		this.emptyDelta();

		if (!this.resource.driver) {
			console.error("Resource driver not set");
		} else if (values) {
			const results = await KarmaFieldsAlpha.Form.update(this.resource.driver, values);
			if (results) {
				KarmaFieldsAlpha.FlatObject.assign(flatObj, results);
			}
			for (let path in flatObj) {
				this.original[path] = this.sanitize(flatObj[path], path);
			}
		}

		return values;
	}

	hasModifiedValue() {
		console.error("deprecated hasModifiedValue");
		return this.hasDelta();
	}

	// probably deprecated...
	getModifiedValue() {
		let flatObject = this.getDeltaObject();
		flatObject = parseObject(flatObject);
		return KarmaFieldsAlpha.FlatObject.toDeep(flatObject);
	}

	getState() {
    return this.state || "";
  }





	/**
	 * At start set an history step if there is unsaved changes
	 */
	initHistory() {
		// const pathes = this.getDeltaPathes();
		// if (pathes.length) {
		// 	this.backup("init");
		// 	pathes.forEach(path => {
		// 		const relativePath = path.slice(this.resource.driver.length+1);
		// 		const value = localStorage.getItem(path);
		// 		this.writeHistory(relativePath, value);
		// 	});
		// }

		const flatObject = this.getDeltaObject();
		if (Object.values(flatObject).length) {
			this.backup("init");
			for (let path in flatObject) {
				// const relativePath = path.slice(this.resource.driver.length+1);
				// const value = ;
				this.writeHistory(path, flatObject[path]);
			}
		}
	}

	backup(keys) {

		keys = this.getKeyPath(keys);
		const id = keys.join("/");

		if (id !== this.historyId) {
			// this.historyIndex++;
			// this.historyMax = this.historyIndex;
			// this.history[this.historyIndex] = {};
			this.historyId = id;

			super.backup(keys);
		}
	}

	isHistoryIndexEmpty(index) {
		console.error("Deprecated");
		for (let path in this.history[index]) {
			if (this.getLastEntry(path) !== undefined) {
				return false;
			}
		}
		return true;
	}

	hasUndo() {
		return this.historyIndex > 0;
	}
	hasRedo() {
		return this.historyIndex < this.historyMax;
	}
	countUndo() {
		return this.historyIndex;
	}
	countRedo() {
		return this.historyMax - this.historyIndex;
	}

	setHistoryIndex(index) {
		while (this.historyIndex > index && this.hasUndo()) {
			this.undo();
		}
		while (this.historyIndex < index && this.hasRedo()) {
			this.redo();
		}
	}

	updateHistory() {
		// for (let path in this.history[this.historyIndex]) {
		// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
		// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
		// 	}
		// }

		if (history.state && history.state[this.resource.driver]) {
			for (let path in history.state[this.resource.driver]) {
				this.setDeltaValue(history.state[this.resource.driver][path], path);
			}
		}
	}

	// changeHistory(dir) {
	// 	// if (this.historyIndex + dir >= 0 && this.historyIndex + dir < this.historyMax) {
	// 		this.historyIndex += dir;
	// 		for (let path in this.history[this.historyIndex]) {
	// 			if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
	// 				this.setDeltaValue(this.history[this.historyIndex][path], path);
	// 			}
	// 		}
	// 		this.historyId = undefined;
	// 	// }
	// }

	undo() {

		if (this.historyIndex > 0) {
			this.historyIndex--;
			this.updateHistory();
			// for (let path in this.history[this.historyIndex]) {
			// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
			// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
			// 	}
			// }
			this.historyId = undefined;



			// for (let path in this.history[this.historyIndex]) {
			// 	const value = this.getLastEntry(path);
			// 	this.setDeltaValue(value, path);
			//
			// }
			//
			// this.historyIndex--;
			// this.historyId = undefined;
		}
	}

	getLastEntry(path) {
		console.error("Deprecated");
		let index = this.historyIndex-1;
		while (index > 0 && (!this.history[index] || this.history[index][path] === undefined)) {
			index--;
		}
		return this.history[index] && this.history[index][path] || this.original[path];
	}

	redo(field) {
		if (this.historyIndex < this.historyMax) {

			this.historyIndex++;
			this.updateHistory();
			// for (let path in this.history[this.historyIndex]) {
			// 	if (this.history[this.historyIndex] && this.history[this.historyIndex][path] !== undefined) {
			// 		this.setDeltaValue(this.history[this.historyIndex][path], path);
			// 	}
			// }
			this.historyId = undefined;
		}
	}

	writeHistory(path, rawValue) {
		// if (!this.history[this.historyIndex]) {
		// 	this.history[this.historyIndex] = {};
		// }
		// this.history[this.historyIndex][path] = rawValue;

		const state = history.state || {};

		if (!state[this.resource.driver]) {
			state[this.resource.driver] = {};
		}

		state[this.resource.driver][path] = rawValue;

		history.replaceState(state, null);
	}



};

KarmaFieldsAlpha.fields.form.getForm = function(driverName) {
	if (!KarmaFieldsAlpha.forms[driverName]) {
		KarmaFieldsAlpha.forms[driverName] = new KarmaFieldsAlpha.fields.form({
			driver: driverName
		});
	}
	return KarmaFieldsAlpha.forms[driverName];
}
