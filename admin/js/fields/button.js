KarmaFieldsAlpha.field.button = class extends KarmaFieldsAlpha.field.text {

	build() {
		return {
			tag: "button",
			class: "karma-button karma-field",
			child: {
				tag: "span",
				update: async span => {
					if (this.resource.dashicon) {
						span.element.className = "dashicons dashicons-"+this.resource.dashicon;
						span.element.textContent = this.resource.text || "";
					} else {
						span.element.className = "text";
						span.element.textContent = await this.parse(this.resource.text || this.resource.title || "");
					}

				}
			},
			update: async button => {

				if (this.resource.primary) {
					button.element.classList.add("primary");
				}


				button.element.onclick = async event => {
					event.preventDefault(); // -> prevent submitting form in post-edit

					if (!button.element.classList.contains("editing")) {
						button.element.classList.add("editing");

						// const [action = this.resource.action, value = this.resource.value, ...path] = this.resource.request


						setTimeout(async () => {
							// if (this.resource.request) {
							// 	await this.parent.request(...this.resource.request);
							// } else {
							//
							// }

							// const action = await this.parse(this.resource.action || this.resource.state || "submit");
							// const value = await this.parse(this.resource.value || {});

							await this.parent.request(this.resource.action, this.resource.value, ...(this.resource.path || []));

							button.element.classList.remove("editing");
							button.element.blur();
						}, 50);

					}

				}

				if (this.resource.disabled) {
					button.element.disabled = Boolean(await this.parse(this.resource.disabled));
				}

				if (this.resource.active) {
					const active = await this.parse(this.resource.active);
					button.element.classList.toggle("active", Boolean(active));
				}

				if (this.resource.test) {
					console.log(await this.parse(this.resource.test));
				}

			}
		};

	}

	// getModal() {
	// 	return this.resource.modal && this.createChild(this.resource.modal);
	// }


}
