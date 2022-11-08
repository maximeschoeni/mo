KarmaFieldsAlpha.field.input = class extends KarmaFieldsAlpha.field {

	async getDefault() {

		const defaults = {};

		const key = this.getKey();

		if (key && this.resource.default !== null) {

			defaults[key] = await this.parse(this.resource.default || "");

		}

		return defaults;
	}

	async exportValue() {
		const key = this.getKey();
		return this.get("string");
	}

	async importValue(value) {
		const key = this.getKey();
		await this.parent.request("set", {data: value}, key);
	}

	async export(keys = []) {
		const key = this.getKey();
		const defaults = {};
		if (keys.length === 0 || keys.includes(key)) {
			// defaults[key] = await this.get("string");
			defaults[key] = await this.parent.request("get", {}, key).then(response => KarmaFieldsAlpha.Type.toString(response));
		}
		return defaults;
	}

	async import(object) {
		const key = this.getKey();
		if (object[key] !== undefined) {
			await this.parent.request("set", {data: object[key]}, key);
		}
	}

	async set(value) {

		if (!this.isBusy()) {
			KarmaFieldsAlpha.History.save();
		}

		const key = this.getKey();

		await this.parent.request("set", {
			autosave: this.resource.autosave,
			data: value
		}, key);

		await this.parent.request("edit");

	}

	isBusy(duration = 3000) {
		if (!this.busy) {
			setTimeout(() => {
				this.busy = false;
			}, duration);
			this.busy = true;
			return false;
		}
		return true;
	}

	async enqueue(callback) {
		this.queueNext = callback;
		if (this.queue) {
			await this.queue;
		}
		if (this.queueNext === callback) {
			this.queue = this.queueNext();
			await this.queue;
			return true;
		}
		return false;
	}

	throttle(callback, interval = 200) {
		if (this.throttleTimer) {
			clearTimeout(this.throttleTimer);
		}
		this.throttleTimer = setTimeout(callback, interval);
	}

	getPlaceholder() {
		return this.parse(this.resource.placeholder || "");
	}

	buildInput() {
		return {
			tag: "input",
			class: "text-input karma-field",
			init: input => {
				input.element.type = "text";
				if (this.resource.label) {
					input.element.id = this.getId();
				}
				if (this.resource.input) {
					Object.assign(input.element, this.resource.input);
				}
				if (this.resource.readonly) {
					input.element.readOnly = true;
				}
				if (this.resource.options) {
					// input.element.list = "list-"+this.getId()
					input.element.setAttribute("list", "list-"+this.getId());
				}


			},
			update: async input => {

				input.element.classList.add("loading");

				const key = this.getKey();

				// const response = await this.parent.request("get", {}, key);
				// const array = KarmaFieldsAlpha.Type.toArray(response);

				const state = await this.parent.request("state", {}, key);



				input.element.classList.toggle("multi", Boolean(state.multi));
				input.element.readOnly = Boolean(state.multi);

				const value = state.multi && "[Multiple Values]" || KarmaFieldsAlpha.Type.toString(state.value);

				// if (state.multi && !state.alike) {
				// 	state.value = "-- Multiple Values --";
				// }

				// if (state.multi) {
				// 	if (state.alike) {
				// 		state.value = `[${state.value}]`;
				// 	} else {
				// 		state.value = "[Multiple Values]";
				// 	}
				// }

				// if (state.multi) {
				// 	state.value = "[Multiple Values]";
				// }


				if (document.activeElement !== input.element) { // -> prevent changing value while editing (e.g search field)

					if (value !== input.element.value) {

						input.element.value = value;

					}

					// const isModified = await this.isModified();

					input.element.parentNode.classList.toggle("modified", Boolean(state.modified));

					input.element.placeholder = await this.getPlaceholder();

				}


				input.element.classList.remove("loading");

				input.element.onkeyup = async event => {
					if (event.key === "Enter") {
						await this.parent.request("submit");
					}
				}

				input.element.oninput = async event => {

					if (this.resource.throttle) {

						this.throttle(async () => {
							input.element.classList.add("editing");
							await this.set(input.element.value.normalize());
							input.element.classList.remove("editing");
						}, this.resource.throttle);

					} else {

						input.element.classList.add("editing");
						await this.set(input.element.value.normalize());
						input.element.classList.remove("editing");

					}

				}

				input.element.oncopy = event => {
					if (state.multi) {
						event.preventDefault();
						const dataArray = state.values.map(value => KarmaFieldsAlpha.Type.toArray(value));
						const string = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
						event.clipboardData.setData("text/plain", string.normalize());
					}
				};

				input.element.onpaste = async event => {
					if (state.multi) {
						event.preventDefault();
						const string = event.clipboardData.getData("text").normalize()
						const dataArray = KarmaFieldsAlpha.Clipboard.parse(string);
						const jsonData = dataArray.map(value => KarmaFieldsAlpha.Type.toString(value));

						KarmaFieldsAlpha.History.save();

						await this.parent.request("set", {multi: true, values: jsonData}, key);
						await this.parent.request("render");
					}
				};

				input.element.oncut = async event => {
					if (state.multi) {
						event.preventDefault();
						const dataArray = state.values.map(value => KarmaFieldsAlpha.Type.toArray(value));
						const string = KarmaFieldsAlpha.Clipboard.unparse(dataArray);
						event.clipboardData.setData("text/plain", string.normalize());

						KarmaFieldsAlpha.History.save();

						await this.parent.request("set", {multi: true, values: [""]}, key);
						await this.parent.request("render");
					}
				};

				if (this.resource.disabled) {
					const disabled = await this.parent.parse(this.resource.disabled);
					input.element.disabled = Boolean(disabled);
				}

				if (this.resource.active) {
					const active = await this.parent.parse(this.resource.active);
					input.element.classList.toggle("active", Boolean(active));
				}

			}
		};
	}

	buildDataListInput() {

		return {
			classs: "karma-datalist-input",
			children: [
				this.buildInput(),
				{
					tag: "datalist",
					init: datalist => {
						datalist.element.id = "list-"+this.getId();
					},
					// update: datalist => {
					// 	this.parse(this.resource.options).then(options => {
					// 		datalist.children = [];
					// 		options.forEach(option => {
					// 			datalist.children
					// 			datalist.element.add(new Option(option.name, option.id));
					// 		});
					// 	});
					// }
					update: async datalist => {
						const options = await this.parse(this.resource.options);
						// options.forEach(option => {
						// 	datalist.element.appendChild(new Option(option.name, option.name));
						// });
						console.log(options);
						datalist.children = options.map(option => {
							return {
								tag: "option",
								init: node => {
									node.element.value = option.name;
								}
							};
						});
					}
				}
			]
		};

	}


	build() {

		if (this.resource.options) {

			return this.buildDataListInput();

		} else {

			return this.buildInput();

		}

	}




}
