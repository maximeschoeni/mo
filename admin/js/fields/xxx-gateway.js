
KarmaFieldsAlpha.field.gateway = class extends KarmaFieldsAlpha.field {

	constructor(...args) {
		super(...args);

		this.buffer = new KarmaFieldsAlpha.Buffer("gateway", this.resource.driver);
		this.store = new KarmaFieldsAlpha.Store(this.resource.driver, this.resource.joins);

		this.trashBuffer = new KarmaFieldsAlpha.Buffer("trash", this.resource.driver);

	}

	async getValue(...path) {

		let value = await this.store.getValue(...path);

		if (!value) {

			value = this.trashBuffer.get(...path);

		}

		return value;
	}

	async request(subject, content, ...path) {

		switch (subject) {

			case "get": {
				return this.getValue(...path);
			}

			case "set": {
				// -> autosave
        // const [id, key] = path;

				const value = KarmaFieldsAlpha.Type.toArray(content.data);
				const data = KarmaFieldsAlpha.DeepObject.create(value, ...path);

				return this.send(data); // -> data is an object of arrays
			}

			case "send": {
				// -> form submit
				await this.send(content.data);
				this.store.empty();
				this.render();
			}

			case "modified": {
				// const originalValue = this.buffer.get(...path);
				const originalValue = await this.getValue(...path);
				return KarmaFieldsAlpha.DeepObject.differ(content.data, originalValue);
			}

			case "query": {
				const paramString = KarmaFieldsAlpha.Params.stringify(content || {});
				const results = await this.server.store.query(paramString);
				return results.map(item => item.id);
			}

			case "count": {
				const paramString = KarmaFieldsAlpha.Params.stringify(content || {});
				return this.server.store.count(paramString);
			}

			case "trash": {
				this.trashBuffer.set(content.data, id);
				break;
			}



			case "edit":
				// return this.render();

			default:
				return this.parent.request(subject, content, ...path);

		}

	}

	async send(data) {

		// const mask = KarmaFieldsAlpha.DeepObject.mask(data, this.buffer.get());
		//
		// this.trashBuffer.merge(mask);

		// -> for history, to be able to restore deleted things
		// if (!this.trashBuffer.has()) {
		//
		// 	this.trashBuffer.set(this.buffer.get());
		//
		// }

		this.buffer.merge(data); // -> needed for autosave

		for (let id in data) {

			await KarmaFieldsAlpha.Gateway.post(`update/${this.resource.driver}/${id}`, data[id]);

		}





		// this.store.empty();

		// await KarmaFieldsAlpha.Gateway.post("update/"+path.join("/"), value);

  }


	build() {
		return this.createChild({
			type: "form",
			...this.resource.form
		}).build();
	}


};
