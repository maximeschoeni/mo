
KarmaFieldsAlpha.SessionStorage = class extends KarmaFieldsAlpha.LocalStorage {

	// static getObject(...path) {
	// 	const delta = sessionStorage.getItem(this.prefix);
	// 	return delta && JSON.parse(delta) || {};
	// }
	//
	// static setObject(delta) {
	// 	if (delta) {
	// 		sessionStorage.setItem(this.prefix, JSON.stringify(delta));
	// 	} else {
	// 		sessionStorage.removeItem(this.prefix);
	// 	}
	// }

	getObject() {

		if (!this.deltaCache) {

			const delta = sessionStorage.getItem(this.constructor.prefix);

			this.deltaCache = delta && JSON.parse(delta) || {};
		}

		return this.deltaCache;

	}

	setObject(delta) {

		sessionStorage.setItem(this.constructor.prefix, JSON.stringify(delta));

		this.deltaCache = delta;

	}

	empty() {

		sessionStorage.removeItem(this.constructor.prefix);

		this.deltaCache = {};

	}



}

KarmaFieldsAlpha.SessionStorage.prefix = "karma";
