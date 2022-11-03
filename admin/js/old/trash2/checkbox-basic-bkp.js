
KarmaFieldsAlpha.fields.checkbox_basic = KarmaFieldsAlpha.fields.checkbox = class extends KarmaFieldsAlpha.fields.field {

	true() {
		return this.resource.true || "1";
	}

	false() {
		return this.resource.false || "";
	}

	async fetchValue() {
		let value = await super.fetchValue();
		if (value !== this.true() && value !== this.false()) {
			value = this.false();
			if (!this.resource.readonly) {
				await this.setValue(value);
			}
		}
		return value;
	}


	build() {
		return {
			tag: "input",
			init: checkbox => {
				checkbox.element.type = "checkbox";
				checkbox.element.id = this.getId();
			},
			update: async checkbox => {
				this.render = checkbox.render;
				checkbox.element.classList.add("loading");
				const value = await this.fetchValue();
				// let modified = this.isModified();

				// checkbox.element.onchange = async event => {
				// 	this.backup();
				// 	checkbox.element.classList.add("editing");
				// 	await this.editValue(checkbox.element.checked ? this.true() : this.false());
				// 	modified = this.isModified();
				//
				// 	checkbox.element.classList.toggle("modified", modified);
				// 	checkbox.element.classList.remove("editing");
				// }



				checkbox.element.onmousemove = async event => {
					console.log("onmousemove");

					if (KarmaFieldsAlpha.fields.checkbox.mousedown && !KarmaFieldsAlpha.fields.checkbox.selected.include(this)) {
						checkbox.element.checked = !checkbox.element.checked;
						KarmaFieldsAlpha.fields.checkbox.selected.push(this);
					}
				}

				checkbox.element.onmousedown = async event => {

					console.log("mousedown");

					KarmaFieldsAlpha.fields.checkbox.mousedown = true;
					KarmaFieldsAlpha.fields.checkbox.state = checkbox.element.checked ? this.true() : this.false();
					KarmaFieldsAlpha.fields.checkbox.selected = [this];

					checkbox.element.checked = !checkbox.element.checked;

					let mouseup = event => {
						KarmaFieldsAlpha.fields.checkbox.mousedown = false;
						KarmaFieldsAlpha.fields.checkbox.selected.forEach(field => {
							field.write();
							field.setValue(KarmaFieldsAlpha.fields.checkbox.state);
						});
						KarmaFieldsAlpha.fields.checkbox.selected = [];
						KarmaFieldsAlpha.History.backup();
						this.edit();
						window.removeEventListener("mouseup", mouseup);
					}

					window.addEventListener("mouseup", mouseup);
				}

				checkbox.element.checked = value === this.true();
				// checkbox.element.classList.toggle("modified", modified);
				checkbox.element.classList.remove("loading");
			}
		};
	}

}
