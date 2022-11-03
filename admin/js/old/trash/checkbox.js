
KarmaFieldsAlpha.fields.checkbox = class extends KarmaFieldsAlpha.fields.field {

	build() {
		const field = this;

		return {
			class: "karma-field checkbox",
			init: function(dropdown) {
				field.init(this.element);
			},
			update: function(container) {
				this.children = [
					{
						tag: "input",
						init: function() {
							this.element.type = "checkbox";
							this.element.id = field.getId();
						},
						update: function(checkbox) {
							this.element.onchange = function() {
								field.changeValue(this.checked ? "1" : "");
							}
							field.onSet = function(value) {
								checkbox.element.checked = value ? true : false;
							}
						}
					}
				];
				if (field.resource.text) {
					this.children.push({
						tag: "label",
						init: function() {
							this.element.htmlFor = field.getId();
						},
						update: function() {
							this.element.innerHTML = field.resource.text;
						}
					});
				}
				field.onModified = function(modified) {
					container.element.classList.toggle("modified", modified);
				}
				field.onLoad = function(loading) {
					container.element.classList.toggle("loading", loading);
				}
				field.update();
			}
		};
	}

}

//
// KarmaFieldsAlpha.fields.checkbox = class extends KarmaFieldsAlpha.fields.field {
//
// 	build() {
// 		const field = this;
//
// 		return {
// 			class: "karma-field checkbox",
// 			init: function(dropdown) {
// 				if (!field.hasValue()) {
// 					field.fetchValue().then(function(value) {
//
// 					});
// 				}
// 				field.init(this.element);
// 			},
// 			update: function(container) {
// 				this.children = [
// 					{
// 						tag: "input",
// 						init: function() {
// 							this.element.type = "checkbox";
// 							this.element.id = field.getId();
// 						},
// 						update: function(checkbox) {
// 							this.element.onchange = function() {
// 								if (this.checked) {
// 									field.setValue(1);
// 								} else {
// 									field.setValue(field.getDefault());
// 								}
// 								field.triggerEvent("modified");
// 								field.triggerEvent("change", true);
// 							}
// 							field.events.set = function() {
// 								field.getValue()
// 								checkbox.element.checked = field.getValue() && true || false;
// 							}
// 							field.triggerEvent("set");
// 						}
// 					}
// 				];
// 				if (field.resource.text) {
// 					this.children.push({
// 						tag: "label",
// 						init: function() {
// 							this.element.htmlFor = field.getId();
// 						},
// 						update: function() {
// 							this.element.innerHTML = field.resource.text;
// 						}
// 					});
// 				}
// 				field.events.modify = function() {
// 					container.element.classList.toggle("modified", field.isModified());
// 				}
// 				field.events.load = function() {
// 					container.element.classList.toggle("loading", field.loading > 0);
// 				}
// 				field.triggerEvent("load");
// 				field.triggerEvent("modify");
// 			}
// 		};
// 	}
//
// }
