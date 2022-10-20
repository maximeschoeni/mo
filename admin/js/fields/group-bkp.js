KarmaFieldsAlpha.field.group = class extends KarmaFieldsAlpha.field {

	async request(subject, content, ...path) {

		const key = this.getKey();

		if (key) {

			path = [key, ...path];

		}

		return this.parent.request(subject, content, ...path);

	}

	getKeys() {

		const key = this.getKey();
		let keys = new Set();

		if (key) {

			keys.add(key);

		} else if (this.resource.children) {

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

		const key = this.getKey();

		if (key) {

			return {[key]: defaults};

		}

		return defaults;
	}

	async export(keys = []) {

		const key = this.getKey();
		let object = {};

		if (key) {

			const response = await this.request("get", {}, key);
			const value = KarmaFieldsAlpha.Type.toObject(response);
			object[key] = JSON.stringify(value || {});

		} else if (this.resource.children) {

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

		const key = this.getKey();

		if (key) {

			if (object[key] !== undefined) {

				const value = JSON.parse(object[key] || "{}");

				await this.parent.request("set", {data: value}, key);

			}

		} else if (this.resource.children) {

			for (let resource of this.resource.children) {

				const child = this.createChild(resource);

				await child.import(object);

			}

		}

	}

	buildLabel(field) {
		return {
			tag: "label",
			init: label => {
				if (field.resource.label) {
					label.element.htmlFor = field.getId();
					label.element.textContent = field.getLabel();
				}
			}
		};
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
				group.children = (this.resource.children || []).map((child, index) => {

					const field = this.createChild(child, index.toString());

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

							if (field.resource.fold) {
								container.children = [this.buildFoldable(field)];
							} else {

								if (!hidden) {

									if (field.resource.label) {
										container.children.push(this.buildLabel(field));
									}
									if (field.build) { // -> not separators
										container.children.push(field.build());
									}

								}

							}

						}
					}
				});

			}

		};
	}

	buildFoldable(field) {
		return {
			class: "foldable",
			init: foldable => {
				let open = false;
				foldable.children = [
					{
						tag: "label",
						children: [
							{
								tag: "span",
								update: span => {
									if (open) {
										span.element.className = "dashicons dashicons-arrow-down";
									} else {
										span.element.className = "dashicons dashicons-arrow-right";
									}
								}
							},
							{
								tag: "span",
								init: span => {
									span.element.htmlFor = field.getId();
									span.element.textContent = field.resource.label || "";
								}
							}
						],
						init: label => {
							label.element.style.display = "flex";
							label.element.style.alignItems = "center";
							label.element.onclick = event => {
								const content = label.element.nextElementSibling;
								content.style.height = content.children[0].clientHeight.toFixed()+"px";
								if (open) {
									requestAnimationFrame(() => {
										content.style.height = "0";
									});
									open = false;
								} else {
									open = true;
								}
								label.render();
							};
						}
					},
					{
						class: "group-fold-content",
						init: content => {
							content.element.style.overflow = "hidden";
							content.element.style.height = "0";
							content.element.style.transition = "height 200ms";
							content.element.style.display = "flex";
							content.element.style.alignItems = "flex-end";
							content.element.ontransitionend = () => {
								content.element.style.height = open ? "auto" : "0";
							};
						},
						child: field.build()
					}
				];
			}
		}
	}

}
