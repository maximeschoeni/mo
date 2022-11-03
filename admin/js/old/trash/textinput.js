KarmaFieldsAlpha.fields.textinput = function(field) {
	return this.input(field);
	// return {
	// 	tag: "input",
	// 	class: "text",
	// 	init: function(input) {
	// 		this.element.type = field.resource.input_type || "text";
	// 		this.element.id = field.getId();
	// 		this.element.addEventListener("input", function(event) {
	// 			field.setValue(this.value, "change");
	// 		});
	//
	// 		if (field.resource.input) {
	// 			Object.assign(this.element, field.resource.input);
	// 		}
	// 
	// 		// if (field.getResource("disabled")) {
	// 		// 	this.element.disabled = true;
	// 		// } else if (field.resource.readonly) {
	// 		// 	this.element.readOnly = true;
	// 		// } else {
	// 		// 	this.element.addEventListener("input", function(event) {
	// 		// 		field.setValue(this.value, "change");
	// 		// 	});
	// 		// 	// this.element.addEventListener("keyup", function(event) {
	// 		// 	// 	if (event.key === "Enter") {
	// 		// 	// 		field.trigger("submit");
	// 		// 	// 	}
	// 		// 	// });
	// 		// }
	// 		// if (field.resource.width) {
	// 		// 	this.element.style.width = field.resource.width;
	// 		// }
	// 		// if (field.resource.style) {
	// 		// 	this.element.style = field.resource.style;
	// 		// }
	// 	},
	// 	update: function() {
	// 		if (field.getResourceAttribute("disabled")) {
	// 			this.element.disabled = true;
	// 		} else if (field.getResourceAttribute("readonly")) {
	// 			this.element.readOnly = true;
	// 		}
	// 		this.element.value = field.value || "";
	// 	}
	// };
}
