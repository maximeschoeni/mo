KarmaFieldsAlpha.field.text = class extends KarmaFieldsAlpha.field {

	async getContent() {
		if (this.resource.value) {
			return this.parse(this.resource.value);
		}
		if (this.resource.key) {
			return this.request("get", {}, this.resource.key).then(response => KarmaFieldsAlpha.Type.toString(response));
		}
		return "";
	}

	async exportValue() {
		return this.parse(this.resource.export || this.resource.value);
	}


	build() {
		return {
			tag: this.resource.tag,
			class: "text karma-field",
			init: node => {
				if (this.resource.classes) {
					node.element.classList.add(...this.resource.classes);
				}
				node.element.tabIndex = -1;
			},
			update: async node => {
				// node.element.classList.add("loading");

				node.element.innerHTML = await this.getContent();

				if (this.resource.highlight) {
					const highlight = await this.parse(this.resource.highlight);
					node.element.classList.toggle("highlight", Boolean(highlight));
				}

				if (this.resource.disabled) {
					node.element.classList.add("disabled");
					const disabled = await this.parse(this.resource.disabled);
					node.element.classList.toggle("disabled", disabled);
				}

				// node.element.classList.remove("loading");

			}
		};
	}


}
