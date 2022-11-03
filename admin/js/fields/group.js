KarmaFieldsAlpha.field.group = class extends KarmaFieldsAlpha.field.container {

	async request(subject, content, ...path) {

		const key = this.getKey();

		if (key) {

			// path = [key, ...path];

			switch (subject) {

				case "get": {
					const response = await this.parent.request("get", {}, key);
					const value = KarmaFieldsAlpha.Type.toObject(response);
					return KarmaFieldsAlpha.DeepObject.get(value, ...path);
				}

				case "state": {
					const state = await this.parent.request("state", {}, key);
					const value = KarmaFieldsAlpha.Type.toObject(state.value);
					return {
						...state,
						value: KarmaFieldsAlpha.DeepObject.get(value, ...path)
					};
				}

				case "set": {
					const response = await this.parent.request("get", {}, key);
					const value = KarmaFieldsAlpha.Type.toObject(response);
					const clone = KarmaFieldsAlpha.DeepObject.clone(value);
					KarmaFieldsAlpha.DeepObject.assign(clone, content.data, ...path);
					await this.parent.request("set", {data: clone}, key);
					break;
				}

				// case "fetch": {
				// 	return this.parent.request(subject, content, key, ...path); // for transfer record value
				// }


				default:
					return this.parent.request(subject, content, key);

			}

		} else {

			return this.parent.request(subject, content, ...path);

		}

	}

	getKeys() {

		const key = this.getKey();

		if (key) {

			return new Set([key]);

		} else {

			return super.getKeys();

		}

	}

	async getDefault() {

		const defaults = await super.getDefault();
		const key = this.getKey();

		if (key) {

			return {[key]: defaults};

		}

		return defaults;
	}

	async export(keys = []) {

		const key = this.getKey();

		if (key) {

			const object = {};
			const response = await this.parent.request("get", {}, key);
			const value = KarmaFieldsAlpha.Type.toObject(response);
			object[key] = JSON.stringify(value || {});

			return object;

		} else {

			return super.export(keys);

		}

	}

	async import(object) {

		const key = this.getKey();

		if (key) {

			if (object[key] !== undefined) {

				const value = JSON.parse(object[key] || "{}");

				await this.parent.request("set", {data: value}, key);

			}

		} else {

			await super.import(object);

		}

	}

}

KarmaFieldsAlpha.field.foldableGroup = class extends KarmaFieldsAlpha.field.group {

	buildChildren() {

		return [
			{
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
		];

	}

}
