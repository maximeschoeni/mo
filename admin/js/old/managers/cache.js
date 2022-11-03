
KarmaFieldsAlpha.Cache = class {

	static get(type, key) {
		if (this.cache[type] && this.cache[type]) {
			return this.cache[type][key];
		}
	}

	static update(type, key, promise) {
		if (promise) {
			if (!this.cache[type]) {
				this.cache[type] = {};
			}
			if (!this.cache[type][key]) {
				this.cache[type][key] = promise;
			}
		}
	}

}

KarmaFieldsAlpha.Cache.cache = {};
