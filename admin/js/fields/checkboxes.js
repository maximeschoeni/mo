
KarmaFieldsAlpha.field.checkboxes = class extends KarmaFieldsAlpha.field {

	async getDefault() {

		if (this.resource.default) {

			const key = this.getKey();
			const value = await this.parse(this.resource.default);
			const values = KarmaFieldsAlpha.Type.toArray(defaultValue);

			return {
				[key]: values
			}

		}

		return [];
	}

	// async dispatch(event) {
	//
	// 	switch (event.action) {
	//
	// 		case "get": {
	//
	// 			const [key] = event.path;
	//
	// 			const set = await super.dispatch({
	// 				action: "get",
	// 				type: "array"
	// 			}).then(request => new Set(KarmaFieldsAlpha.Type.toArray(request.data)));
	//
	// 			event.data = set.has(key);
	// 			break;
	// 		}
	//
	// 		case "set": {
	// 			// const key = event.path[0];
	// 			// if (event.getValue()) {
	// 			// 	await this.add(key);
	// 			// } else {
	// 			// 	await this.remove(key);
	// 			// }
	// 			// break;
	// 			// const key = event.path[0];
	// 			// const array = await this.getArray();
	// 			// if (event.getValue()) {
	// 			// 	array.push(key);
	// 			// } else {
	// 			// 	const index = array.indexOf(key);
	// 			// 	if (index > -1) {
	// 			// 		array.splice(index, 1);
	// 			// 	}
	// 			// }
	// 			// const options = await this.fetchOptions(this.resource.driver);
	// 			// await this.setArray(options.map(option => option.key).filter(key => array.indexOf(key) > -1));
	// 			// break;
	//
	// 			const [key] = event.path;
	// 			// const options = await this.parse(this.resource.options);
	// 			const set = await super.dispatch({
	// 				action: "get",
	// 				type: "array"
	// 			}).then(request => new Set(KarmaFieldsAlpha.Type.toArray(request.data)));
	//
	// 			if (event.data && !set.has(key)) {
	// 				set.add(key);
	// 			} else if (!event.data && set.has(key)) {
	// 				set.delete(key);
	// 			}
	//
	// 			await super.dispatch({
	// 				action: "set",
	// 				data: [...set]
	// 			})
	//
	// 		}
	//
	// 	}
	//
	// 	return event;
	// }

	async request(subject, content = {}, ...path) {

		switch (subject) {

			case "get": {

				const [childKey] = path;

				const response = await this.parent.request("get", {}, this.getKey());
				const array = KarmaFieldsAlpha.Type.toArray(response);

				return array.includes(childKey) ? "1" : "";
			}

			case "set": {

				const [childKey] = path;
				const response = await this.parent.request("get", {}, this.getKey());
				const array = KarmaFieldsAlpha.Type.toArray(response);
				const set = new Set([...array]);

				if (content.data && !set.has(childKey)) {
					set.add(childKey);
				} else if (!content.data && set.has(childKey)) {
					set.delete(childKey);
				}

				await this.parent.request("set", {data: [...set]}, this.getKey());

				break;
			}

			default: {
				await this.parent.request(subject, content, this.getKey());
			}

		}

	}


	async export(keys = []) {

		const key = this.getKey();
		const defaults = {};

		if (keys.length === 0 || keys.includes(key)) {

			const response = await this.parent.request("get", {}, this.getKey());
			const array = KarmaFieldsAlpha.Type.toArray(response);
			defaults[key] = array.join(",");

		}

		return defaults;
	}

	async import(object) {

		const key = this.getKey();
    const string = KarmaFieldsAlpha.Type.toString(object[key]);
    const array = string.split(",").map(item => item.trim());

		await this.parent.request("set", {data: value}, this.getKey());
	}

	build() {
		return {
			class: "karma-field checkboxes",
			update: async dropdown => {
				dropdown.element.classList.add("loading");

				const options = await this.parse(this.resource.options);

				if (!Array.isArray(options)) {
					console.error("options is not an array");
				}

				dropdown.child = {
					tag: "ul",
					update: ul => {
						ul.children = options.map((option, index) => {

							const checkboxField = this.createChild({
								type: "checkbox",
								key: option.id,
								text: option.name,
								tag: "li",
								false: "",
								true: "1",
								id: option.id
							});
							return checkboxField.build();
						});
					}
				};
				dropdown.element.classList.remove("loading");
			}
		};
	}
}
