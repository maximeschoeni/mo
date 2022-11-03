KarmaFieldsAlpha.field.textarea = class extends KarmaFieldsAlpha.field.input {

	build() {
		return {
			tag: "textarea",
			class: "karma-field",
			init: input => {
				if (this.resource.label) {
					input.element.id = this.getId();
				}
				if (this.resource.readonly) {
					input.element.readOnly = true;
				}
				if (this.resource.input) {
					Object.assign(input.element, this.resource.input);
				}
				if (this.resource.height) {
					input.element.style.height = this.resource.height;
				}
			},
			update: async input => {
				input.element.classList.add("loading");

				const key = this.getKey();

				const state = await this.parent.request("state", {}, key);

				input.element.classList.toggle("multi", Boolean(state.multi));
				input.element.readOnly = Boolean(state.multi);

				const value = state.multi && "[Multiple Values]" || KarmaFieldsAlpha.Type.toString(state.value);

				input.element.oninput = async event => {
					this.throttle(async () => {
						await this.set(input.element.value.normalize());
					});
				};

				// const response = await this.parent.request("get", {}, key);
				//
				// if (Array.isArray(response) && response.multivalue) {
				//
				// 	input.element.placeholder =  "— No Change —" || this.resource.placeholder || "";
				// 	input.element.value = "";
				//
				// } else {
				//
				// 	input.element.value = KarmaFieldsAlpha.Type.toString(response);
				//
				// }

				if (document.activeElement !== input.element) { // -> prevent changing value while editing (e.g search field)
					// const value = KarmaFieldsAlpha.Type.toString(state.value);
					if (value !== input.element.value) {
						input.element.value = value;
					}
					input.element.parentNode.classList.toggle("modified", Boolean(state.modified));
					input.element.placeholder = await this.getPlaceholder();
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

				// const modified = await this.isModified();

				// input.element.parentNode.classList.toggle("modified", modified);
				input.element.classList.remove("loading");
			}
		};
	}

}
