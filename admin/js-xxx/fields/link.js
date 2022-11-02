KarmaFieldsAlpha.field.link = class extends KarmaFieldsAlpha.field.text {

	build() {
		return {
			tag: "a",
			class: "karma-link",

			update: async a => {

				a.element.innerHTML = await this.getContent();

				if (this.resource.href) {
					a.element.href = this.resource.href;
				} else if (this.resource.action) {
					a.element.onclick = async event => {
						if (!a.element.classList.contains("editing")) {
							a.element.classList.add("editing");
							setTimeout(async () => {
								await this.parent.request(this.resource.action, this.resource.params || {});
								a.element.classList.remove("editing");
							}, 50);
						}
					}
				}

				if (this.resource.active) {
					const isActive = await this.parse(this.resource.active);
					a.element.classList.toggle("active", Boolean(isActive));
				}

			}
		};

	}

}
