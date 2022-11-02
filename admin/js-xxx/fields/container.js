KarmaFieldsAlpha.field.container = class extends KarmaFieldsAlpha.field {

	getKeys() {

		let keys = new Set();

		if (this.resource.children) {

		  for (let resource of this.resource.children) {

				keys = new Set([...keys, ...this.createChild(resource).getKeys()]);

			}

		}

		return keys;
	}

	async getDefault() {

		let defaults = {};

		for (let index in this.resource.children) {

			const child = this.createChild(this.resource.children[index]);

			defaults = {
				...defaults,
				...await child.getDefault()
			};

		}

		return defaults;
	}

	async export(keys = []) {

		let object = {};

		if (this.resource.children) {

			for (let resource of this.resource.children) {

				const child = this.createChild(resource);

				object = {
					...object,
					...await child.export(keys)
				};

			}

		}

		return object;
	}

	async import(object) {

		if (this.resource.children) {

			for (let resource of this.resource.children) {

				const child = this.createChild(resource);

				await child.import(object);

			}

		}

	}

	getChildren() {
		return this.resource.children || [];
	}

	buildChildren(field) {
		const children = [];

		if (field.resource.label) {

			children.push({
				tag: "label",
				update: label => {
					if (field.resource.label) {
						label.element.htmlFor = field.getId();
						label.element.textContent = field.getLabel();
					}
				}
			});

		}

		if (field.build) { // -> not separators

			children.push(field.build());

		}

		return children;
	}

	build() {
		return {
			class: "karma-field karma-field-container display-"+(this.resource.display || "block"),
			init: group => {
				if (this.resource.container && this.resource.container.style) {
					group.element.style = this.resource.container.style;
				}
				if (this.resource.class) {
					group.element.classList.add(this.resource.class);
				}
			},
			update: async group => {
				this.render = group.render;
				group.children = this.getChildren().map((child, index) => {

					const field = this.createChild(child);

					return {
						class: "karma-field-frame karma-field-"+field.resource.type,
						init: (container) => {
							if (field.resource.style) {
								container.element.style = field.resource.style;
							}
							if (field.resource.class) {
								field.resource.class.split(" ").forEach(name => container.element.classList.add(name));
							}
							if (field.resource.flex) {
								container.element.style.flex = field.resource.flex;
							}
						},
						update: async (container) => {
							container.children = [];

							const hidden = field.resource.hidden && await this.parse(field.resource.hidden)
								|| field.resource.visible && !await this.parse(field.resource.visible);

							container.element.classList.toggle("hidden", Boolean(hidden));

							if (!hidden) {

								container.children = this.buildChildren(field);

							}

						}
					}
				});

			}

		};
	}

}
