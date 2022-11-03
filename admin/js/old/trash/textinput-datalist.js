KarmaFieldsAlpha.fields.textinput_datalist = class extends KarmaFieldsAlpha.fields.dropdown {

	build() {
		const field = this;

		return {
			class: "karma-field-"+field.resource.type,
			init: function(container) {

				field.events.set = function() {
					container.render(); // -> when field value is changed by outside
				}

				if (field.resource.style) {
					this.element.style = field.resource.style;
				}

				if (!field.hasValue()) {
					field.loading++;
					field.fetchValue().then(function(value) {
						field.loading--;
						container.render();
					});
					container.render();
				}

				if (!field.hasOptions()) {
					field.loading++;
					field.fetchOptions({key: field.resource.key}).then(function(value) {
						field.loading--;
						container.render();
					});
					container.render();
				}
			},
			update: function() {
				this.children = [
					{
						tag: "label",
						init: function(label) {
							if (field.resource.label) {
								this.element.htmlFor = field.getId();
								this.element.textContent = field.resource.label;
							}
						}
					},
					{
						tag: "input",
						class: "text",
						init: function(input) {
							this.element.setAttribute("list", field.getId()+"-list");
							if (field.resource.label) {
								this.element.id = field.getId();
							}
							this.element.addEventListener("input", function(event) {
								let promise = field.setValue(this.value, "change");
								if (promise) {
									field.loading++;
									promise.then(function() {
										field.loading--;
										container.render();
									});
									container.render();
								}
							});
							this.element.addEventListener("focus", function() {
								field.triggerEvent("focus");
							});
							if (field.resource.input) {
								Object.assign(this.element, field.resource.input);
							}

							// field.getValue().then(function(value) {
							// 	input.value = value;
							// });

							if (field.hasValue()) {
								input.value = field.getValue();
							} else {
								input.element.classList.add("loading");
								field.fetchValue().then(function(value) {
									input.value = value;
									input.element.classList.remove("loading");
								});
							}

						},
						update: function() {
							this.element.value = field.getValue();
							if (field.disabled) {
								this.element.disabled = true;
							}
							this.element.classList.toggle("loading", field.loading > 0);
							this.element.classList.toggle("modified", field.isModified());
						}
					},
					{
						tag: "datalist",
						init: function(datalist) {
							this.element.id = field.getId()+"-list";
						},
						update: function(dropdown) {
							this.element.classList.toggle("loading", field.loading > 0);
							this.element.classList.toggle("modified", field.isModified());

							const value = field.getValue();

							dropdown.children = field.getOptions().map(function(option) {
								return {
									tag: "option",
									update: function() {
										this.element.textContent = option.name;
										this.element.value = option.key;
										this.element.selected = value == option.key;
									}
								};
							});
						}
					},
					{
						class: "karma-field-spinner"
					}
				];
			}
		};
	}

}


//
// KarmaFieldsAlpha.fields.textinput_datalist = function(field) {
// 	return {
// 		class: "field-datalist-input",
// 		update: function() {
// 			this.children = [
// 				{
// 					tag: "input",
// 					class: "text",
// 					init: function(input) {
// 						this.element.type = field.resource.type || "text";
// 						this.element.id = field.getId();
// 						// this.element.htmlList = field.getId()+"-list";
// 						this.element.setAttribute("list", field.getId()+"-list");
// 						if (field.resource.readonly) {
// 							this.element.readOnly = true;
// 						} else {
// 							this.element.addEventListener("input", function(event) {
// 								field.setValue(this.value, "input");
// 							});
//
// 							this.element.addEventListener("keyup", function(event) {
// 								if (event.key === "Enter") {
// 									field.setValue(this.value, "enter");
// 								}
// 							});
// 						}
// 						if (field.resource.width) {
// 							this.element.style.width = field.resource.width;
// 						}
// 						if (field.resource.style) {
// 							this.element.style = field.resource.style;
// 						}
//
// 						field.fetchValue().then(function(value) { // -> maybe undefined
// 							input.update(input);
// 						});
// 					},
// 					update: function(input) {
// 						var value = field.getValue();
// 						var isModified = field.isModified();
// 						this.element.value = value || "";
// 						this.element.classList.toggle("modified", isModified);
// 					}
// 				},
// 				{
// 					tag: "datalist",
// 					init: function(datalist) {
// 						this.element.id = field.getId()+"-list";
// 						Promise.resolve(field.resource.options || field.fetchOptions()).then(function(results) {
// 							datalist.children = results.items.map(function(item) {
// 								return {
// 									tag: "option",
// 									init: function() {
// 										this.element.value = item.name;
// 									}
// 								}
// 							});
// 							datalist.render();
// 						});
// 					}
// 				}
// 			];
// 		}
// 	};
// }
