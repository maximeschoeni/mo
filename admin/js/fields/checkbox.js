
KarmaFieldsAlpha.field.checkbox = class extends KarmaFieldsAlpha.field {

	static mousedown = false;
	static state = false;
	static selected = [];

	true() {
		return this.resource.true || "1";
	}

	false() {
		return this.resource.false || "";
	}

	async getDefault() {

		const object = {};

		if (this.resource.key && this.resource.default !== null) {

			const value = await this.parse(this.resource.default || "") ? this.true() : this.false();

			object[this.resource.key] = value;

		}

		return object;
	}

	async exportValue() {
		const key = this.getKey();
		const response = await this.parent.request("get", {}, key);
		return KarmaFieldsAlpha.Type.toString(response);
	}

	async importValue(value) {
		const key = this.getKey();
		await this.parent.request("set", {data: value}, key);
	}


	async export() {
		const key = this.getKey();
		const response = await this.parent.request("get", {}, key);
		const value = KarmaFieldsAlpha.Type.toString(response);
    return {[key]: value};
	}

	async import(object) {
		const key = this.getKey();
    const value = KarmaFieldsAlpha.Type.toBoolean(object[key]);
		if (object[key] !== undefined) {
			await this.parent.request("set", {data: object[key]}, key);
		}

	}

	async setMultipleFields(checked, fields) {

		KarmaFieldsAlpha.History.save();

		for (let field of fields) {

			const value = checked ? field.true() : field.false();

			// await field.dispatch({
			// 	action: "set",
			// 	// backup: "pack",
			// 	data: value,
			// 	autosave: this.resource.autosave
			// 	// default: field.getDefault
			// });

			// console.log(checked, value);


			await field.parent.request("set", {
				data: value,
				autosave: this.resource.autosave
			}, field.getKey());

		}

		await this.parent.request("edit");

	}

	build() {

		return {
			tag: this.resource.tag || "div",
			class: "checkbox-container",
			update: async container => {
				this.render = container.render;

				container.children = [
					{
						tag: "input",
						init: checkbox => {
							checkbox.element.type = "checkbox";
							checkbox.element.id = this.getId();
						},
						update: async checkbox => {

							this.edit = async editing => {
								checkbox.element.blur();
								container.element.parentNode.classList.toggle("editing", editing);
							}

							container.element.onmousemove = async event => {
								if (this.constructor.mousedown && !this.constructor.selected.includes(this)) {
									checkbox.element.checked = this.constructor.state;
									this.constructor.selected.push(this);
								}
							}

							container.element.onmouseup = async event => {
								event.preventDefault();
							}
							container.element.onclick = async event => {
								event.preventDefault();
							}

							container.element.onmousedown = async event => {

								checkbox.element.checked = !checkbox.element.checked;

								this.constructor.mousedown = true;
								this.constructor.state = checkbox.element.checked ? true : false;
								this.constructor.selected = [this];

								let mouseup = async event => {

									window.removeEventListener("mouseup", mouseup);

									event.preventDefault();
									this.constructor.mousedown = false;

									this.setMultipleFields(this.constructor.state, this.constructor.selected);

									this.constructor.selected = [];

								}

								window.addEventListener("mouseup", mouseup);
							}

							// checkbox.element.checked = await this.dispatch({
							// 	action: "get",
							// 	type: "boolean"
							// }).then(request => KarmaFieldsAlpha.Type.toBoolean(request.data));

							const response = await this.parent.request("get", {}, this.getKey());
							checkbox.element.checked = KarmaFieldsAlpha.Type.toString(response) === this.true();

						}
					},
					{
						tag: "label",
						class: "checkbox-text",
						init: label => {
							label.element.htmlFor = this.getId();
						},
						update: label => {
							label.element.innerHTML = this.resource.text || "";
						}
					}
				];
			}

		};
	}

}
