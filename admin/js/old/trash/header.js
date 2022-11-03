KarmaFieldsAlpha.fields.header = class extends KarmaFieldsAlpha.fields.field {
	build() {
		const field = this;
		return {
			tag: field.resource.level || "h3",
			init: function() {
				this.element.textContent = field.resource.title;
			}
		};
	}

	setValue() {}
	getValue() {}
};
