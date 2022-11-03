KarmaFieldsAlpha.field.dropdown = class extends KarmaFieldsAlpha.field.input {

	// constructor(resource) {
	// 	super(resource);
	// 	this.cache = new KarmaFieldsAlpha.Buffer("expressions");
	// }
	// async exportValue() {
	// 	const value = await this.getValue();
	// 	const options = await this.fetchOptions();
	// 	const option = value.length && options.find(option => option.id === value.toString());
	// 	return option && option.name || value;
  // }
	//
	// async importValue(value) {
	// 	const options = await this.fetchOptions();
	// 	const option = options.find(option => option.name === value) || options[0];
	// 	if (option) {
	// 		await this.setValue(option.key);
	// 	}
  // }

	async exportValue() {
		const key = this.getKey();
		const value = await this.get("string");
		const options = await this.fetchOptions();
		const option = options.find(option => option.id === value);

		if (option) {
			return option.name;
		}

		return "";
	}

	async importValue(value) {
		const key = this.getKey();
		const options = await this.fetchOptions();
		const option = options.find(option => option.name === value);

		if (option) {
			await this.parent.request("set", {data: option.id}, key);
		}
	}

	async export(keys = []) {

		const key = this.getKey();
		const defaults = {};

		if (keys.length === 0 || keys.includes(key)) {

			const value = await this.getString();
			const options = await this.fetchOptions();
			const option = options.find(option => option.id === value);

			if (option) {
				defaults[key] = option.name;
			}

		}

		return defaults;
  }

	async import(object) {

		const key = this.getKey();

		if (object[key]) {

			const options = await this.fetchOptions();
			const option = options.find(option => option.name === object[key]);

			if (option) {
				await this.parent.request("set", {data: option.id}, key);
			} else {
				const defaults = await this.getDefault();
				console.log(defaults);
				await this.parent.request("set", {data: defaults[key]}, key);
			}

		}

  }


	async getDefault() {

		const options = await this.fetchOptions();
		const defaults = {};
		const key = this.getKey();

		if (key) {

			if (this.resource.default !== undefined) {

				defaults[key] = await this.parse(this.resource.default);

			} else if (options.length > 0) {

				defaults[key] = options[0].id;

			}

		}

		return defaults;

	}

	async getOptions(driver, paramString = "", nameField = "name", joins = []) {

    driver = await this.parse(driver);
    paramString = await this.parse(paramString);

    const store = new KarmaFieldsAlpha.Store(driver, joins);

    const ids = await store.queryIds(paramString);
    const options = [];

    for (let id of ids) {
      options.push({
        id: id,
        name: await store.getValue(id, nameField)
      });
    }

    return options;
  }

	async fetchOptions() {

		// return this.parse(this.resource.options) || [];

		let options = [];

		if (this.resource.options) {

			options = [
				...await this.parse(this.resource.options)
			];

		}

		if (this.resource.driver) {

	    // const store = new KarmaFieldsAlpha.Store(this.resource.driver, this.resource.joins);
	    // const ids = await store.queryIds(this.resource.paramString || "");
			//
	    // for (let id of ids) {
	    //   options.push({
	    //     id: id,
	    //     name: await store.getValue(id, this.resource.nameField || "name")
	    //   });
	    // }

			const form = new KarmaFieldsAlpha.field.form({
				driver: this.resource.driver,
				joins: this.resource.joins
			});

	    const results = await form.query(this.resource.params || {});

			for (let item of results) {
				options.push({
					id: item.id,
					name: item[this.resource.nameField || "name"] || await form.getInitial(item.id, this.resource.nameField || "name")
				});
			}

		} else if (this.resource.table) {

			const table = await this.request("table", {id: this.resource.table});

			// const paramString = KarmaFieldsAlpha.Params.stringify({
			// 	...table.resource.params,
			// 	...this.resource.params,
			// 	ppp: 999
			// });

			// const results = await table.server.store.query(paramString);
			//
			// for (let item of results) {
			// 	options.push({
			// 		id: item.id,
			// 		name: item[this.resource.nameField || "name"] || await table.server.store.getValue(item.id, this.resource.nameField || "name")
			// 	});
			// }

			const results = await table.query({...table.resource.params, ...this.resource.params});

			for (let item of results) {
				options.push({
					id: item.id,
					name: item[this.resource.nameField || "name"] || await table.getInitial(item.id, this.resource.nameField || "name")
				});
			}

		}

		return options;


		// const expressionKey = JSON.stringify(this.resource.options);
		//
    // let promise = this.expressionCache.get(expressionKey);
		//
    // if (!promise) {
		//
    //   promise = this.parse(this.resource.options) || [];;
		//
    //   this.expressionCache.set(promise, expressionKey);
		//
    // }
		//
    // return promise;

	}


	// hasOptgroups(options) {
	// 	return options.some(function(item) {
	// 		return item.group;
	// 	});
	// }
	//
	// getOptgroups(options) {
	//
	// 	return options.reduce(function(obj, item) {
	// 		let group = obj.find(function(group) {
	// 			return group.name === (item.group || "default");
	// 		});
	// 		if (!group) {
	// 			group = {
	// 				name: item.group || "default",
	// 				children: []
	// 			};
	// 			obj.push(group);
	// 		}
	// 		group.children.push(item);
	// 		return obj;
	// 	}, []);
	// }
	//
	// buildOptions(options, value) {
	// 	const field = this;
	//
	// 	if (field.hasOptgroups(options)) {
	//
	// 		return field.getOptgroups(options).map(function(optgroup) {
	// 			return {
	// 				tag: "optgroup",
	// 				update: function() {
	// 					this.element.label = optgroup.name;
	// 					this.children = optgroup.children.map(function(option) {
	// 						return {
	// 							tag: "option",
	// 							update: function() {
	// 								if (option.count && field.resource.count) {
	// 									this.element.textContent = option.name + " ("+option.count+")";
	// 								} else {
	// 									this.element.textContent = option.name;
	// 								}
	// 								this.element.value = option.key;
	//
	// 								if (value === option.key) {
	// 									this.element.selected = true;
	// 								}
	// 							}
	// 						};
	// 					})
	// 				}
	// 			};
	// 		});
	//
	// 	} else {
	//
	// 		return options.map(option => {
	// 			return {
	// 				tag: "option",
	// 				update: node => {
	// 					node.element.textContent = option.name;
	// 					node.element.value = option.key;
	// 					if (value === option.key) {
	// 						node.element.selected = true;
	// 					}
	// 				}
	// 			};
	// 		});
	//
	// 	}
	// }
	//
	// async createDropdown(onChange) {
	//
	// 	const dropdown = document.createElement("select");
	//
	// 	const options = await this.fetchOptions();
	// 	let value = await this.getValue();
	//
	// 	options.forEach(option => {
	// 		dropdown.add(new Option(option.name, option.id, false, value === option.id));
	// 	});
	//
	// 	dropdown.onchange = async event => onChange(dropdown.value);
	//
	// 	return dropdown;
	//
	// }

	build() {

		return {
			tag: "select",
			class: "dropdown karma-field",
			init: dropdown => {
				// if (this.resource.label) {
				// 	this.id = "karma-fields-"+this.getUniqueId();
				// 	dropdown.element.id = this.id;
				// }
				//
				// dropdown.element.tabIndex = -1;
				//
				// this.render = dropdown.render;
			},
			update: async dropdown => {
				dropdown.element.classList.add("loading");

				const key = this.getKey();
				const options = await this.fetchOptions();
				const response = await this.parent.request("get", {}, key);
				const value = KarmaFieldsAlpha.Type.toString(response);

				if (this.resource.lazy) {

					// -> set default
					let currentOption = options.find(option => option.id == value);

					const currentOptions = [...dropdown.element.options];

					if (options.length && !currentOptions.some(option => option.value == value)) {

						let option = options.find(option => option.id == value) || options[0];

						// if (this.resource.map) {
						// 	[option] = await KarmaFieldsAlpha.Expression.map(this, [option], this.resource.map);
						// }

						dropdown.element.length = 0;

						dropdown.element.add(new Option(option.name, option.id, false, value === option.id));

					}

					dropdown.element.value = value;

					dropdown.element.onfocus = async event => {

						if (currentOptions.length !== options.length) {

							// let mappedOptions;
							//
							// if (this.resource.map) {
							// 	mappedOptions = await KarmaFieldsAlpha.Expression.map(this, options, this.resource.map);
							// } else {
							// 	mappedOptions = options;
							// }
							//
							dropdown.element.length = 0;
							//
							// mappedOptions.forEach(option => {
							// 	dropdown.element.add(new Option(option.name, option.id, false, value === option.id));
							// });

							options.forEach(option => {
								dropdown.element.add(new Option(option.name, option.id, false, value === option.id));
							});

							if (options.some(option => option.options)) {
								// -> groups



							}



						}

					}

				} else {

					dropdown.element.length = 0;

					options.forEach(option => {
						dropdown.element.add(new Option(option.name, option.id, false, value === option.id));
					});

				}




				dropdown.element.onchange = async event => {
					dropdown.element.classList.add("editing");

					KarmaFieldsAlpha.History.save();

					await this.parent.request("set", {data: dropdown.element.value}, key);

					if (this.resource.onchange) {
						await this.parse(this.resource.onchange);
					}

					await this.parent.request("edit");

					dropdown.element.classList.remove("editing");
				}

				if (this.resource.disabled) {
					dropdown.element.disabled = Boolean(await this.parent.parse(this.resource.disabled));
				}

				dropdown.element.parentNode.classList.toggle("modified", await this.isModified());

				dropdown.element.classList.remove("loading");

				// if (!currentOption && options.length) {
				//
				// 	currentOption = options[0];
				//
				// 	// await this.parent.request("set", {data: currentOption.id});
				// 	// this.parent.request("edit");
				//
				// }

			}

		};
	}

}
