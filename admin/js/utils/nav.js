KarmaFieldsAlpha.Nav = class {

	static toString(object) {
		return Object.entries(object).map(entries => entries[0]+"="+entries[1]).join("&");
	}

	static toObject(string) {
		return Object.fromEntries(string.split("&").map(param => param.split("=").map(string => decodeURIComponent(string))));
	}

	static get(...path) {

		const [key] = path;

		if (key) {

			const params = this.params || {};

			return params[key];

		}

		return {...this.params};
	}

	static set(value, ...path) {

		if (path.length) {

			const params = {...this.params};
			const [key] = path;

			if (value) {

				params[key] = value;

			} else {

				delete params[key];

			}

			this.params = params;

		} else {

			this.params = value;

		}

		this.edit();
	}

	static remove(...path) {
		this.set("", ...path);
	}

	static has(...path) {
		const param = this.get(...path);
		return !KarmaFieldsAlpha.DeepObject.isEmpty(param);
	}

	static change(value, prevValue, ...path) {

		if (prevValue === undefined) {
			prevValue = this.get(...path);
		}

		KarmaFieldsAlpha.History.backup(value, prevValue, false, "nav", ...path);

		this.set(value, ...path);

	}

	static merge(object) {
		const params = {...this.get()};
		KarmaFieldsAlpha.DeepObject.merge(params, object);
		this.set(params);
		this.edit();
	}

	static edit() {
		const params = this.get();
		const hash = this.toString(params);
		window.history.replaceState({}, null, "#"+hash);
	}


}
