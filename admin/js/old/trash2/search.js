KarmaFieldsAlpha.fields.search = function(fieldManager) {
	return {
		class: "search",
		tag: "input",
		init: function(input) {
			this.element.type = "search";
			this.element.id = fieldManager.getId();
			this.element.placeholder = fieldManager.resource.title || "Search";
			this.element.addEventListener("input", function(event) {
				if (this.value.length !== 1 && fieldManager.resource.auto) {
					fieldManager.setValue(this.value, "change");
				}
			});
			this.element.addEventListener("search", function() {
				fieldManager.setValue(this.value, "change");
			});

			// if (fieldManager.resource.style) {
			// 	this.element.style = fieldManager.resource.style;
			// }
		},
		update: function() {
			this.element.value = fieldManager.getValue() || "";
		}
	};
}

//
// KarmaFieldsAlpha.fields.input = class extends KarmaFieldsAlpha.fields.field {
//
// 	build() {
// 		const field = this;
//
// 		return {
// 			tag: "input",
// 			class: "text karma-field",
// 			init: function(input) {
// 				this.element.type = field.resource.input_type || "text"; // compat
// 				// field.triggerEvent("init", this.element);
// 				if (field.resource.label) {
// 					this.element.id = field.getId();
// 				}
//
// 				// not used yet
// 				this.element.addEventListener("focus", function() {
// 					field.triggerEvent("focus", true);
// 				});
// 				// not used yet
// 				this.element.addEventListener("focusout", function() {
// 					field.triggerEvent("focusout", true);
// 				});
//
// 				if (field.resource.input) {
// 					Object.assign(this.element, field.resource.input);
// 				}
//
// 				if (!field.hasValue()) {
// 					field.fetchValue().then(function(value) {
// 						// field.endLoad();
// 						field.triggerEvent("set");
// 						field.triggerEvent("modify");
// 						// input.value = value;
// 						// input.element.classList.remove("loading");
// 					});
// 				}
// 				field.init(this.element);
// 			},
// 			update: function(input) {
// 				// this.element.value = field.getValue();
// 				// if (field.disabled) {
// 				// 	this.element.disabled = true;
// 				// }
//
// 				if (field.resource.readonly) {
// 					this.element.readOnly = true;
// 				} else {
// 					this.element.oninput = function(event) {
// 						field.triggerEvent("history", true);
// 						field.setValue(this.value);
// 						let promise = field.triggerEvent("change", true);
// 						if (promise) {
// 							field.startLoad();
// 							// input.element.classList.add("loading");
// 							promise.then(function() {
// 								field.endLoad();
// 								field.triggerEvent("modify");
// 								// input.element.classList.remove("loading");
// 							});
// 						}
// 						field.triggerEvent("modify");
// 					};
// 				}
//
// 				field.events.modify = function() {
// 					input.element.classList.toggle("modified", field.isModified());
// 				}
// 				field.events.load = function() {
// 					input.element.classList.toggle("loading", field.loading > 0);
// 				}
// 				field.events.set = function() {
// 					input.element.value = field.getValue();
// 				}
//
// 				field.triggerEvent("load");
// 				field.triggerEvent("set");
// 				field.triggerEvent("modify");
//
// 				// this.element.classList.toggle("loading", field.loading > 0);
// 				// this.element.classList.toggle("modified", field.isModified());
// 			}
// 		};
// 	}
//
// }
