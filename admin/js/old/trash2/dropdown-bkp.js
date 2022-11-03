KarmaFieldsAlpha.fields.dropdown = class extends KarmaFieldsAlpha.fields.input {

	// constructor(resource, domain, parent) {
	// 	super(resource, domain, parent);
	// }


	// async getOptionsAsync() {
	// 	// if (this.resource.options) {
	// 	// 	return this.prepareOptions(this.resource.options)
	// 	// } else {
	// 	// 	return this.fetchOptions().then(options => {
	// 	// 		return this.prepareOptions(options);
	// 	// 	});
	// 	// }
	//
	// 	const options = this.fetchOptions();
	// 	return this.prepareOptions(options);
	// }

	// convert(value) {
	// 	if (this.resource.datatype === "number") {
	// 		return Number(value) || 0;
	// 	}
	// 	// else if (this.resource.datatype === "string") {
	// 	// 	return value && value.toString() || "";
	// 	// }
	// 	return value;
	// }

	// async updateOptions() {
	// 	// const field = this;
	// 	// return super.update().then(function(value) {
	// 	// 	if (field.resource.options) {
	// 	// 		let options = field.prepareOptions(field.resource.options);
	// 	// 		field.try("onOptions", options, value, "resource");
	// 	// 		return value;
  //   //   } else {
	// 	// 		return field.load(field.fetchOptions().then(function(options) {
	// 	// 			options = field.prepareOptions(options);
	// 	// 			let queryString = field.getOptionsParamString();
	// 	// 			field.try("onOptions", options, value, queryString);
	// 	// 			return value;
	// 	// 		}));
	// 	// 	}
	// 	// });
	//
	// 	// const value = await super.update();
	// 	const options = await this.fetchOptions();
	// 	const queryString = await this.getOptionsParamString();
	//
	// 	this.try("onOptions", options, value, queryString);
	//
	// 	// return super.update().then(function(value) {
	// 	// 	if (field.resource.options) {
	// 	// 		let options = field.prepareOptions(field.resource.options);
	// 	// 		field.try("onOptions", options, value, "resource");
	// 	// 		return value;
  //   //   } else {
	// 	// 		return field.load(field.fetchOptions().then(function(options) {
	// 	// 			options = field.prepareOptions(options);
	// 	// 			let queryString = field.getOptionsParamString();
	// 	// 			field.try("onOptions", options, value, queryString);
	// 	// 			return value;
	// 	// 		}));
	// 	// 	}
	// 	// });
  // }

	getRemoteOptions(queryString, driver) {
		console.log("Deprecated getRemoteOptions");
		// if (this.resource.driver) {
		// 	return KarmaFieldsAlpha.Form.fetch2(this.resource.driver, queryString);
		// } else {
		// 	return super.fetch(queryString);
		// }

		return super.getRemoteOptions(queryString, this.resource.driver);
  }



	// getDriver() {
	// 	return this.resource.driver || super.getDriver();
	// }



	// exportValue() {
	// 	const field = this;
	// 	return super.exportValue().then(function(value) {
	// 		return field.fetchOptions().then(function(options) {
	// 			const option = options.find(function(option) {
	// 				return option.key === value;
	// 			});
	// 			return option && option.name || value;
	// 		});
	// 	});
  // }

	async exportValue() {
		const value = await this.fetchValue();
		const options = await this.fetchOptions();
		const option = options.find(function(option) {
			return option.key === value;
		});
		return option && option.name || value;
  }

	getEmpty() {
		return "";
	}

  // importValue(value) {
	// 	const options = this.getOptions();
	// 	const option = options.find(function(option) {
	// 		return option.name === value;
	// 	});
	// 	if (option) {
	// 		this.setValue(option.key, context);
	// 	}
  // }

	async importValue(value) {
		const options = await this.fetchOptions();
		const option = options.find(function(option) {
			return option.name === value;
		});
		if (option) {
			this.setValue(option.key);
		}
  }

	// fetchDefault() {
	// 	const field = this;
	// 	return this.fetchOptions().then(function(options) {
	//
	// 		if (options.length) {
	// 			return options[0].key;
	// 		}
	// 	});
	// }

	async getDefault() {
		const options = await this.fetchOptions();
		if (this.resource.default !== undefined && options.some(option => option.key === this.resource.default)) {
			return this.resource.default;
		}
		const value = KarmaFieldsAlpha.Nav.getParam(this.resource.key);
		if (value && options.some(option => option.key === value)) {
			return value;
		}
		if (options.length) {
			return options[0].key;
		}
	}

	async setDefault() {
		const value = await this.getDefault();
    await this.initValue(value);
  }

	// async fetchValue() {
	// 	let value = await super.fetchValue();
	// 	const options = await this.fetchOptions();
	// 	if (options.length && !this.resource.readonly && !options.some(option => option.key === value)) {
	// 		value = options[0].key;
	// 		await this.setValue(value);
	// 	}
	// 	return value;
  // }

	// isEmpty() {
	// 	return value === "" || value === "0";
	// }

	// initField() {
	// 	if (this.resource.datatype) {
	// 		this.registerType(this.resource.datatype);
	// 	}
	// }
	//
	// parse(value) {
	// 	if (this.resource.datatype === "number") {
	// 		value = Number(value);
	// 	}
	// 	return value;
	// }
	//
	// stringify(value) {
	// 	if (this.resource.datatype === "number") {
	// 		value = value.toString();
	// 	}
	// 	return value;
	// }


	async validate(value) {
		if (value === "0") {
			value = "";
		}
		// const options = await this.fetchOptions();
		//
		// if (options.length && !this.resource.readonly && !options.some(option => option.key === value)) {
		// 	value = options[0].key;
		// 	await this.setValue(value);
		// }


		return value;
  }

	async fetchOptions() {
		let options = await super.fetchOptions();



	// }
	//
	// prepareOptions(options) {
		if (options.some(option => option.key === undefined)) {
			console.error("Missing key options");
		}



		if (this.resource.empty !== undefined) {
			options = [{
				key: this.resource.empty,
				name: this.resource.empty_option_name || "–"
			}].concat(options);

			// options.unshift({
			// 	key: this.convert(this.resource.empty),
			// 	name: this.resource.empty_option_name || "–"
			// });
		}

		// deprecated
		if (this.resource.novalue !== undefined) {
			// options.unshift({
			// 	key: this.getEmpty(),
			// 	name: this.resource.novalue === true && "-" || this.resource.novalue
			// });
			options = [{
				key: this.getEmpty(),
				name: this.resource.novalue === true && "-" || this.resource.novalue
			}].concat(options);
		}

		options.forEach(option => {
      option.key = option.key.toString();
    });

		return options;
	}

	hasOptgroups(options) {
		return options.some(function(item) {
			return item.group;
		});
	}

	getOptgroups(options) {

		return options.reduce(function(obj, item) {
			let group = obj.find(function(group) {
				return group.name === (item.group || "default");
			});
			if (!group) {
				group = {
					name: item.group || "default",
					children: []
				};
				obj.push(group);
			}
			group.children.push(item);
			return obj;
		}, []);
	}

	buildOptions(options, value) {
		const field = this;

		if (field.hasOptgroups(options)) {

			return field.getOptgroups(options).map(function(optgroup) {
				return {
					tag: "optgroup",
					update: function() {
						this.element.label = optgroup.name;
						this.children = optgroup.children.map(function(option) {
							return {
								tag: "option",
								update: function() {
									if (option.count && field.resource.count) {
										this.element.textContent = option.name + " ("+option.count+")";
									} else {
										this.element.textContent = option.name;
									}
									this.element.value = option.key;
									if (value === option.key) {
										this.element.selected = true;
									}
								}
							};
						})
					}
				};
			});

		} else {

			return options.map(function(option) {
				return {
					tag: "option",
					update: function() {
						this.element.textContent = option.name + (option.count && field.resource.count && " ("+option.count+")" || "");
						this.element.value = option.key;
						if (value === option.key) {
							this.element.selected = true;
						}
					}
				};
			});

		}
	}

	build() {

		return {
			tag: "select",
			class: "dropdown karma-field",
			init: dropdown => {
				if (this.resource.label) {
					dropdown.element.id = this.getId();
				}
				// this.init(dropdown.element);
			},
			update: async dropdown => {
				this.render = dropdown.render;


				// field.onOptions = function(options, value, queryString) {
				// 	if (queryString !== dropdown.element.getAttribute("querystring")) {
				// 		dropdown.children = field.buildOptions(options, value);
				// 		//dropdown.render(true);
				// 		dropdown.clean = true;
				// 		dropdown.element.setAttribute("querystring", queryString);
				// 	}
				// }
				// field.onLoad = function(loading) {
				// 	dropdown.element.classList.toggle("loading", loading);
				// }
				// field.onSet = function(value) {
				// 	dropdown.element.value = value;
				// }
				// field.onModified = function(isModified) {
				// 	dropdown.element.classList.toggle("modified", isModified);
				// }

				// console.log(this.getPath());
				// console.trace();

				dropdown.element.classList.add("loading");


				let value = await this.fetchValue();



				// value = await this.validate(value);




				let modified = this.isModified();
				const options = await this.fetchOptions();
				const queryString = await this.getOptionsParamString();


				if (value === undefined && options.length) {
					value = options[0].key;
					this.setValue(value);
				}

				if (queryString !== dropdown.element.getAttribute("querystring")) {
					// console.log("y", this.getPath());
					dropdown.children = this.buildOptions(options, value);
					dropdown.element.setAttribute("querystring", queryString);
					dropdown.clean = true;
				} else {
					// console.log("x", this.getPath(), dropdown.children, dropdown.child);
					// dropdown.children = undefined;
					dropdown.element.value = value;
					dropdown.clean = false;

				}


				if (this.resource.readonly) {
					dropdown.element.disabled = true;
				} else {
					dropdown.element.onchange = async() => {


						await this.backup();
						dropdown.element.classList.add("editing");

						// -> compat
						if (this.resource.retrodependencies) {
							console.warn("DEPRECATED retrodependencies");
							this.resource.retrodependencies.forEach(key => {
								this.parent && this.parent.removeValue([key]);
								// KarmaFieldsAlpha.History.removeParam(key);
							});
						}

						if (this.resource.unfilters) {
							this.resource.unfilters.forEach(filter => {
								KarmaFieldsAlpha.Nav.removeParam(filter);
							});
						}

						// custom script
						if (this.scriptFunction) {
							await this.scriptFunction(this, dropdown);
						}


						// await this.editValue(dropdown.element.value);
						this.setValue(dropdown.element.value);

						await this.edit(this.resource.forceRender);

						if (this.resource.submit === "auto") {
							await this.submit();
						}

						modified = await this.isModified();

						dropdown.element.classList.toggle("modified", modified);
						dropdown.element.classList.remove("editing");
					}
				}

				// if (this.resource.condition) {
				// 	const condition = await this.getRelatedValue(this.resource.condition.key)
				// 	dropdown.element.classList.toggle("hidden", condition !== this.resource.condition.value);
				// }



				dropdown.element.classList.toggle("modified", this.modified);
				dropdown.element.classList.remove("loading");






			}
		};
	}

}
