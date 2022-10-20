

KarmaFieldsAlpha.Nav = class {

	static getSearchParams() {
		return new URLSearchParams(location.hash.slice(1));
	}

	static setSearchParams(urlSearchParams, replace = false) {
		const hash = urlSearchParams.toString();

		history.replaceState({}, "", "#"+hash);

		// if (replace) {
		// 	history.replaceState({}, "", "#"+hash);
		// } else {
		// 	history.pushState({}, "", "#"+hash);
		// }
	}

	static toString(object) {
		if (object) {
			return Object.entries(object).map(entries => entries[0]+"="+entries[1]).join("&");
		}
		return "";
	}

	static toObject(string) {
		if (string) {
			return Object.fromEntries(string.split("&").map(param => param.split("=").map(string => decodeURIComponent(string))));
		}
		return {};
	}

	static getObject() {
		const string = location.hash.slice(1);
		return this.toObject(string);
	}

	static setObject(object) {
		const hash = this.toString(object);
		history.replaceState({}, "", "#"+hash);
	}

	static update() {
		history.pushState({}, "", location.hash);
	}

	static empty() {
		this.setSearchParams(new URLSearchParams());
	}

	static get(key) {
		const value = this.getSearchParams().get(key) || "";
		return decodeURIComponent(value);
	}

	static has(key) {
		return this.getSearchParams().has(key);
	}

	static set(value, key, replace = false) { // replace = deprecated

		const urlSearchParams = this.getSearchParams();
		if (value) {
			value = encodeURIComponent(value);
			urlSearchParams.set(key, value);
		} else {
			urlSearchParams.delete(key);
		}
		this.setSearchParams(urlSearchParams, replace);
	}

	static remove(key, replace = false) {
		const urlSearchParams = this.getSearchParams();
		urlSearchParams.delete(key);
		this.setSearchParams(urlSearchParams, replace);
	}



	// used by undo/redo
	static merge(params, replace = false) {
		const urlSearchParams = this.getSearchParams();
		for (let key in params) {
			if (params[key]) {
				const value = decodeURIComponent(params[key]);
				urlSearchParams.set(key, value);
			} else {
				urlSearchParams.delete(key);
			}
		}
		this.setSearchParams(urlSearchParams, replace);
	}

	static init() {
		const params = this.getObject();
		for (let key in params) {
			KarmaFieldsAlpha.History.pack(params[key], "nav", key);
		}
	}


	// static backup(key) {
  //   const value = this.get(key) || "";
  //   KarmaFieldsAlpha.History.write(value, "nav", key);
  // }

	// static change(type, newValue, currentValue, key) {
	//
  //   // const currentValue = this.get(key) || "";
	//
	// 	newValue = encodeURIComponent(newValue);
	// 	// currentValue = encodeURIComponent(currentValue);
	//
	// 	if (KarmaFieldsAlpha.DeepObject.differ(newValue, currentValue)) {
	//
	// 		this.set(newValue, key);
	//
	// 		// if (type === "tie") {
	// 		//
	// 		// 	KarmaFieldsAlpha.History.tie(newValue, "nav", key);
	// 		//
	// 		// }
	// 		//
	// 		// KarmaFieldsAlpha.History.pack(newValue, "nav", key);
	//
	// 		KarmaFieldsAlpha.History.backup(newValue, currentValue, type === "tie", "nav", key);
	//
	// 	}
	//
  // }

	// static change(value, key) {
	//
	// 	value = encodeURIComponent(value);
	//
	// 	const current = this.get(key);
	//
	// 	if (value !== current) {
	//
	// 		KarmaFieldsAlpha.History.backup(value, current, false, "nav", key);
	//
	// 		this.set(value, key);
	//
	// 	}
	// }

	static change(value, prevValue, key) {

		console.warn("function redefinition!");

		if (!prevValue) {
			prevValue = this.get(key);
		}

		KarmaFieldsAlpha.History.backup(value, prevValue, false, "nav", key);

		this.set(value, key);

		// value = encodeURIComponent(value);
		//
		// const current = this.get(key);
		//
		// if (value !== current) {
		//
		// 	KarmaFieldsAlpha.History.backup(value, current, false, "nav", key);
		//
		// 	this.set(value, key);
		//
		// }
	}

	static compare(value, key) {
		const current = this.get(key);
		return current !== value;
	}

	static backup(value, key) {

		const current = this.get(key);

		KarmaFieldsAlpha.History.backup(value, current, false, "nav", key);
	}

	// static change(params, saveHistory = false) {
	//
	// 	if (saveHistory) {
	//
	// 		for (let key in params) {
	//
	// 			const value = params[key];
	// 			const current = this.get(key);
	//
	// 			if (value !== current) {
	// 				this.backup(key);
	// 			}
	//
	// 		}
	//
	// 		KarmaFieldsAlpha.History.save();
	// 	}
	//
	// 	for (let key in params) {
	//
	// 		const value = params[key];
	// 		const current = this.get(key);
	//
	// 		if (value !== current) {
	// 			this.set(value, key);
	// 			this.backup(key);
	// 		}
	//
	// 	}
	//
	// 	this.update();
	//
	// }


	static parse(string) {
		const [request, ...joins] = string.split("+");
		const [driver, paramString] = request.split("?");

		return {
			name: driver,
			params: this.toObject(paramString),
			joins: joins
		};

	}

}


// addEventListener("DOMContentLoaded", event => {
// 	// KarmaFieldsAlpha.Nav.init();
// 	const params = KarmaFieldsAlpha.Nav.getObject();
// 	for (let key in params) {
// 		KarmaFieldsAlpha.History.pack(params[key], null, "nav", key);
// 	}
// });
