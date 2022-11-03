KarmaFieldsAlpha.fields.output = function(field) {
	return {
		tag: "input",
		class: "text",
		init: function(input) {
			this.element.type = "hidden";
			this.element.name = field.resource.name || "";

			// field.events.update = function(currentField) {
			// 	input.value = JSON.stringify(this.parent.getValue());
			// }
			field.parent.events.change = function(currentField) {
				// this.update();
				input.value = JSON.stringify(field.parent.getValue());
				return Promise.resolve(true);
			}

		}
	};
}
