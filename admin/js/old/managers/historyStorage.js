
KarmaFieldsAlpha.History = class {





	static backup() {
		const paramString = location.hash.slice(1);
		const state = history.state || {};

		history.pushState({}, null, "#"+paramString);
	}

	// static writeDelta(delta) {
	// 	if (history.state) {
	// 		for (let path in history.state) {
	// 			delta.setValue(history.state[path], path);
	// 		}
	// 	}
	// }


	// static update() {
	// 	if (history.state) {
	// 		for (let path in history.state) {
	// 			this.setDeltaValue(history.state[path], path);
	// 		}
	// 	}
	// }

	static writeHistory(path, rawValue, prefix) { // rawValue may be null
		const state = history.state || {};

		if (prefix) {
			if (!state[prefix]) {
				state[prefix] = {}
			}
			state[prefix][path] = rawValue;
		} else {
			state[path] = rawValue;
		}



		// console.log("writeHistory", path, rawValue, state);

		history.replaceState(state, null);
	}

	static eraseHistory(suffix) {
		const state = history.state || {};

		const pathes = [];

		for (let path in state) {
			if (suffix && path.startsWith(suffix)) {
				pathes.push(suffix);
			}
		}

		if (pathes.length) {
			pathes.forEach(path => {
				delete state[path];
			});

			history.replaceState(state, null);
		}
	}

	// /**
	//  * At start set an history step if there is unsaved changes
	//  */
	// static init() {
	//
	// 	if (this.hasDelta()) {
	// 		const flatObject = this.getDelta();
	// 		for (let path in flatObject) {
	// 			this.writeHistory(path, null);
	// 		}
	// 		this.backup();
	//
	// 		for (let path in flatObject) {
	// 			this.writeHistory(path, flatObject[path]);
	// 		}
	// 	}
	//
	// }


	// static getSuffix(path = "") {
	// 	return "karma/" + path;
	// }

	// static getOriginalValue(path) {
	// 	return this.original[path];
	// }
	//
	// static removeOriginalValue(path) {
	// 	delete this.original[path];
	// }
	//
	// static setOriginalValue(value, path) {
	// 	this.original[path] = value;
	// }

	// static getDeltaValue(path) {
	// 	path = this.getSuffix(path);
	// 	let value = localStorage.getItem(path) ?? undefined;
	// 	return value;
	// }
	//
	// static setDeltaValue(value, path) { // overrided with async by arrays
	// 	path = this.getSuffix(path);
	// 	if (this.original[path] !== value && value !== undefined && value !== null) {
	// 		localStorage.setItem(path, value);
	// 	} else {
	// 		localStorage.removeItem(path);
	// 	}
	// }
	//
	// static removeDeltaValue(path) {
	// 	path = this.getSuffix(path);
	// 	localStorage.removeItem(path);
	// }
	//
	// static getDelta() {
	// 	const flatObject = {};
	// 	const dir = this.getSuffix();
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			flatObject[path.slice(dir.length)] = localStorage.getItem(path);
	// 		}
	// 	}
	// 	return flatObject;
	// }
	//
	// static hasDelta() {
	// 	const dir = this.getSuffix();
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }
	//
	// static emptyDelta() {
	// 	const dir = this.getSuffix();
	// 	for (let i = 0; i < localStorage.length; i++) {
	// 		let path = localStorage.key(i);
	// 		if (path.startsWith(dir)) {
	// 			localStorage.removeItem(path);
	// 		}
	// 	}
	// }



	static getParam(key) {
		return this.getParamsObject().get(key);
	}

	static hasParam(key) {
		return this.getParamsObject().has(key);
	}

	static setParam(key, value) {
		const params = this.getParamsObject();

		if (value && params.get(key) !== value || !value && params.has(key)) {

			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}

			params.sort();

			this.setParamsObject(params);
		}

	}

	static removeParam(key) {
		const params = this.getParamsObject();

		if (params.has(key)) {
			params.delete(key);
			this.setParamsObject(params);
		}
	}

	static setParams(params) {
		const paramsObject = this.getParamsObject();

		let paramString = paramsObject.toString();

		for (let key in params) {

			const value = params[key];

			if (value) {
				paramsObject.set(key, value);
			} else {
				paramsObject.delete(key);
			}

		}

		paramsObject.sort();

		if (paramsObject.toString() !== paramString) {
			this.setParamsObject(paramsObject);
		}
	}

	static editParam(clean) {
		return this.parent && this.parent.editParam(clean);
	}

	static getParamsObject() {
		return new URLSearchParams(this.getParamString());
	}

	static setParamsObject(params) {
		return this.setParamString(params.toString());
	}

	static getParamString() {
		return location.hash.slice(1);
	}

	static setParamString(paramString) {
		const state = history.state || {};

		// console.log("setParamString", paramString);


		history.replaceState(state, null, "#"+paramString);
	}






}
