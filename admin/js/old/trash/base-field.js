// KarmaFieldsAlpha.fields.baseField = {};
// KarmaFieldsAlpha.fields.baseField.create = function(resource) {
// 	return KarmaFieldsAlpha.Field(resource);
// };
// KarmaFieldsAlpha.fields.baseField.build = function(field) {
// 	return {
// 		class: "karma-field-"+field.resource.type,
// 		init: function(container) {
// 			field.init();
// 			field.events.render = function() {
// 				container.render();
// 			}
// 			if (field.resource.style) {
// 				this.element.style = field.resource.style;
// 			}
// 		},
// 		children: [
// 			{
// 				tag: "label",
// 				init: function(label) {
// 					if (field.resource.label) {
// 						this.element.htmlFor = field.getId();
// 						this.element.textContent = field.resource.label;
// 					}
// 				}
// 			},
// 			KarmaFieldsAlpha.fields.baseField.buildContent && KarmaFieldsAlpha.fields.input.buildField(field, container) || {},
// 			{
// 				class: "karma-field-spinner"
// 			}
// 		]
// 	};
// }



// KarmaFieldsAlpha.fields.input = {};
// KarmaFieldsAlpha.fields.input.create = function(resource) {
// 	let field = KarmaFieldsAlpha.Field(resource);
// 	if (resource.input && resource.input.type === "number") {
// 		field.datatype = "number";
// 	}
// 	return field;
// };
// KarmaFieldsAlpha.fields.input.build = function(field) {
// 	return {
// 		tag: "input",
// 		class: "text",
// 		init: function(input) {
// 			this.element.type = field.resource.input_type || "text";
// 			this.element.id = field.getId();
// 			this.element.addEventListener("input", function(event) {
// 				field.setValue(this.value, "change");
// 			});
// 			this.element.addEventListener("focus", function() {
// 				field.trigger("focus");
// 			});
// 			if (field.resource.input) {
// 				Object.assign(this.element, field.resource.input);
// 			}
// 			field.events.update = function() {
// 				input.element.classList.toggle("loading", field.loading > 0);
// 				input.element.classList.toggle("modified", field.isModified());
// 			}
// 			field.init();
// 		},
// 		update: function() {
// 			// if (field.getResourceAttribute("disabled")) {
// 			// 	this.element.disabled = true;
// 			// } else if (field.getResourceAttribute("readonly")) {
// 			// 	this.element.readOnly = true;
// 			// }
// 			this.element.value = field.getValue();
// 			field.triggerEvent("update");
// 		}
// 	};
// }
