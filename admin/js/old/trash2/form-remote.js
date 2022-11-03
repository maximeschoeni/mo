
KarmaFieldsAlpha.fields.form = class extends KarmaFieldsAlpha.fields.formHistory {

	constructor(...args) {
		super(...args);

		this.buffer = new KarmaFieldsAlpha.DeepObject();

	}

	async submit() {
		await this.save();
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

	async fetchValue(expectedType, ...path) {

		// let value = super.fetchValue(null, ...path);
		//
		// if (value === undefined) {
		//
		// 	value = await this.getRemoteValue(...path);
		//
		// }
		//
		// return value;

		// return super.fetchValue(null, ...path) || await this.getRemoteValue(...path);
		return this.delta.get(...path) || await this.getRemoteValue(...path);
  }

	async isModified(...path) {

		// const delta = await super.fetchValue(null, ...path);
		// const delta = super.fetchValue(null, ...path);
		const delta = this.delta.get(...path);

		// if (delta !== undefined) {

			return delta && KarmaFieldsAlpha.DeepObjectAsync.some(delta, async (object, ...path) => {
				const original = await this.getRemoteValue(...path);
				return !KarmaFieldsAlpha.DeepObject.equal(object, original);
	    }, ...path) || false;

		// }

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

		// const delta = await super.fetchValue();
		const delta = this.delta.get();

		if (delta) {

			await KarmaFieldsAlpha.Gateway.update(driver, delta);

			this.reset();

			this.removeDeltaValue();

		}

	}


	async saveValue(value, ...path) {

		if (typeof value === "string") {
			console.warn("Value is a string!");
		}

		const driver = this.resource.driver || this.resource.key;
		let delta = {};

		KarmaFieldsAlpha.DeepObject.assign(delta, value, ...path);


		this.buffer.set(value, ...path);

		this.writeHistory(value, ...path);

		await KarmaFieldsAlpha.Gateway.update(driver, delta);

  }


	async saveField(...fields) {

		const driver = this.resource.driver || this.resource.key;

		if (!driver) {
			console.error("Resource driver not set");
		}

		let delta = {};

		for (let field of fields) {
			const path = field.getPath();
			// const value = await super.fetchValue(null, ...path);
			const value = this.delta.get(...path);
			KarmaFieldsAlpha.DeepObject.assign(delta, value, ...path);
			// this.removeDeltaValue(...path);
			this.delta.remove(...path);
			this.buffer.set(value, ...path);
		}

		if (KarmaFieldsAlpha.DeepObject.some(delta, () => true)) {

			await KarmaFieldsAlpha.Gateway.update(driver, delta);

		}

	}

};
