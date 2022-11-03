
KarmaFieldsAlpha.Delta = class {

	static getObject(...path) {

		if (!this.deltaCache) {

			const delta = localStorage.getItem(this.prefix);

			this.deltaCache = delta && JSON.parse(delta) || {};
		}

		return this.deltaCache;

	}

	static get(...path) {

		// if (!this.deltaCache) {
		//
		// 	const delta = localStorage.getItem(this.prefix);
		//
		// 	this.deltaCache = delta && JSON.parse(delta) || {};
		// }
		//
		// // return this.deltaCache;
		//
		// return KarmaFieldsAlpha.DeepObject.get(this.deltaCache, ...path);


		return KarmaFieldsAlpha.DeepObject.get(this.getObject(), ...path);

	}

	static setObject(delta) {

		// delta = KarmaFieldsAlpha.DeepObject.filter(delta, (value, ...path) => value !== null && value !== undefined && value !== KarmaFieldsAlpha.Gateway.getOriginal(...path));

		// if (delta) {
		//
		// 	localStorage.setItem(this.prefix, JSON.stringify(delta));
		//
		// } else {
		//
		// 	localStorage.removeItem(this.prefix);
		//
		// }


		localStorage.setItem(this.prefix, JSON.stringify(delta));

		this.deltaCache = delta;
	}

	static deleteObject() {

		localStorage.removeItem(this.prefix);

		this.deltaCache = {};
	}

	static set(value, ...path) {

		const delta = this.getObject();

		KarmaFieldsAlpha.DeepObject.assign(delta, value, ...path);

		this.setObject(delta);

	}

	// static set(value, ...path) {
	//
	// 	const delta = this.get();
	//
	// 	KarmaFieldsAlpha.DeepObject.assign(delta, value, ...path);
	//
	// 	delta = KarmaFieldsAlpha.DeepObject.filter(delta, value => value !== null && value !== undefined);
	//
	// 	if (delta) {
	//
	// 		localStorage.setItem(this.prefix, JSON.stringify(delta));
	//
	// 	} else {
	//
	// 		localStorage.removeItem(this.prefix);
	//
	// 	}
	//
	// 	this.deltaCache = delta;
	// }

	static remove(...path) {

		const delta = this.getObject();

		if (delta) {

			KarmaFieldsAlpha.DeepObject.remove(delta, ...path);

			if (KarmaFieldsAlpha.DeepObject.some(delta, () => true)) {

				this.setObject(delta);

			} else {  // -> empty object

				this.deleteObject();

			}

		}

	}

	static has(...path) {
		return KarmaFieldsAlpha.DeepObject.has(this.getObject(), ...path);
	}

	static merge(data) {

		// KarmaFieldsAlpha.DeepObject.forEach(data, (value, ...path) => {
		// 	if (value === null || value === KarmaFieldsAlpha.Gateway.getOriginal(...path)) {
		// 		this.remove(...path);
		// 	} else if (value !== undefined) {
		// 		this.set(value, ...path);
		// 	}
		// });
		//
		// this.clean();

		const delta = this.getObject();

		KarmaFieldsAlpha.DeepObject.merge(delta, data);

		// delta = KarmaFieldsAlpha.DeepObject.some(delta, () => true) || null; // -> set empty object to null
		//
		// this.setObject(delta);

		if (KarmaFieldsAlpha.DeepObject.some(delta, () => true)) {

			this.setObject(delta);

		} else {  // -> empty object

			this.deleteObject();

		}

	}

	// static clean() {
	//
	// 	let delta = this.get();
	//
	// 	delta = KarmaFieldsAlpha.DeepObject.filter(delta, value => value !== null && value !== undefined);
	//
	// 	if (delta) {
	//
	// 		localStorage.setItem(this.prefix, JSON.stringify(delta));
	//
	// 	} else {
	//
	// 		localStorage.removeItem(this.prefix);
	//
	// 	}
	//
	// 	this.deltaCache = delta;
	//
	// }

}

KarmaFieldsAlpha.Delta.prefix = "karma";
