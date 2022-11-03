KarmaFieldsAlpha.fields.input_datalist = class extends KarmaFieldsAlpha.fields.field {

	constructor(resource, domain) {
		super(resource, domain);

		this.loading = 0;

		if (this.resource.driver) {
			const driver = this.resource.driver;
			this.events.fetch = function(field, params) {
				return field.queryOptions(driver, params);
			};
		}

	}

	build() {
		const field = this;

		return {
			class: "karma-field-input-datalist",
			init: function(container) {

				// field.events.set = function() {
				// 	container.render(); // -> when field value is changed by outside
				// }

				if (field.resource.style) {
					this.element.style = field.resource.style;
				}


			},
			children: [
				// {
				// 	tag: "label",
				// 	init: function(label) {
				// 		if (field.resource.label) {
				// 			this.element.htmlFor = field.getId();
				// 			this.element.textContent = field.resource.label;
				// 		}
				// 	}
				// },
				{
					tag: "input",
					class: "text",
					init: function(input) {
						this.element.type = "text";
						this.element.setAttribute("list", field.getId()+"-list");
						if (field.resource.label) {
							this.element.id = field.getId();
						}

						if (!field.hasValue()) {
							field.startLoad();
							field.fetchValue().then(function(value) {
								field.endLoad();
								field.triggerEvent("set");
								field.triggerEvent("modify");
							});
						}


						this.element.addEventListener("input", function(event) {
							field.triggerEvent("history");
							field.setValue(this.value);
							let promise = field.triggerEvent("change", true);

							if (promise) {
								field.startLoad();
								promise.then(function() {
									field.endLoad();
									field.triggerEvent("modify");
								});
							}
							field.triggerEvent("modify");
						});
						this.element.addEventListener("focus", function() {
							field.triggerEvent("focus");
						});
						if (field.resource.input) {
							Object.assign(this.element, field.resource.input);
						}
					},
					update: function(input) {

						field.events.modify = function() {
							input.element.classList.toggle("modified", field.isModified());
						}
						field.events.load = function() {
							input.element.classList.toggle("loading", field.loading > 0);
						}
						field.events.set = function() {
							input.element.value = field.getValue();
						}

						field.triggerEvent("load");
						field.triggerEvent("set");
						field.triggerEvent("modify");

					}
				},
				{
					tag: "datalist",
					init: function(dropdown) {
						this.element.id = field.getId()+"-list";
						if (!field.hasOptions()) {
							field.startLoad();
							field.fetchOptions({key: field.resource.key}).then(function(value) {
								field.endLoad();
								dropdown.children = field.getOptions().map(function(option) {
									return {
										tag: "option",
										update: function() {
											this.element.textContent = option.name;
										}
									};
								});
								dropdown.render();
							});
						}
					},
					update: function(dropdown) {
						dropdown.skipRender = true;
					}
				}
			]
			// update: function() {
			// 	this.children = [
			// 		// {
			// 		// 	tag: "label",
			// 		// 	init: function(label) {
			// 		// 		if (field.resource.label) {
			// 		// 			this.element.htmlFor = field.getId();
			// 		// 			this.element.textContent = field.resource.label;
			// 		// 		}
			// 		// 	}
			// 		// },
			// 		{
			// 			class: "karma-field-item",
			// 			children: [
			// 				{
			// 					tag: "input",
			// 					class: "text",
			// 					init: function(input) {
			// 						this.element.type = "text";
			// 						this.element.setAttribute("list", field.getId()+"-list");
			// 						if (field.resource.label) {
			// 							this.element.id = field.getId();
			// 						}
			//
			// 						if (!field.hasValue()) {
			// 							field.startLoad();
			// 							field.fetchValue().then(function(value) {
			// 								field.endLoad();
			// 								field.triggerEvent("set");
			// 								field.triggerEvent("modify");
			// 							});
			// 						}
			//
			//
			// 						this.element.addEventListener("input", function(event) {
			// 							field.triggerEvent("history");
			// 							field.setValue(this.value);
			// 							let promise = field.triggerEvent("change", true);
			//
			// 							if (promise) {
			// 								field.startLoad();
			// 								promise.then(function() {
			// 									field.endLoad();
			// 									field.triggerEvent("modify");
			// 								});
			// 							}
			// 							field.triggerEvent("modify");
			// 						});
			// 						this.element.addEventListener("focus", function() {
			// 							field.triggerEvent("focus");
			// 						});
			// 						if (field.resource.input) {
			// 							Object.assign(this.element, field.resource.input);
			// 						}
			// 					},
			// 					update: function(input) {
			//
			// 						field.events.modify = function() {
			// 							input.element.classList.toggle("modified", field.isModified());
			// 						}
			// 						field.events.load = function() {
			// 							input.element.classList.toggle("loading", field.loading > 0);
			// 						}
			// 						field.events.set = function() {
			// 							input.element.value = field.getValue();
			// 						}
			//
			// 						field.triggerEvent("load");
			// 						field.triggerEvent("set");
			// 						field.triggerEvent("modify");
			//
			// 					}
			// 				}
			// 				// {
			// 				// 	class: "karma-field-spinner"
			// 				// }
			// 			]
			// 		},
			// 		{
			// 			tag: "datalist",
			// 			init: function(dropdown) {
			// 				this.element.id = field.getId()+"-list";
			// 				if (!field.hasOptions()) {
			// 					field.startLoad();
			// 					field.fetchOptions({key: field.resource.key}).then(function(value) {
			// 						field.endLoad();
			// 						dropdown.children = field.getOptions().map(function(option) {
			// 							return {
			// 								tag: "option",
			// 								update: function() {
			// 									this.element.textContent = option.name;
			// 								}
			// 							};
			// 						});
			// 						dropdown.render();
			// 					});
			// 				}
			// 			},
			// 			update: function(dropdown) {
			// 				dropdown.skipRender = true;
			// 			}
			// 		}
			// 	];
			// }
		};
	}

}


// KarmaFieldsAlpha.fields.input_datalist = {};
// KarmaFieldsAlpha.fields.input_datalist.create = function(resource) {
// 	const field = KarmaFieldsAlpha.Field(resource);
//
// 	field.data.fetch = function() {
// 		field.data.loading = true;
// 		field.triggerEvent("update");
//
// 		if (field.resource.options) {
// 			return Promise.resolve(field.resource.options);
// 		} else {
// 			return field.fetch().then(function(results) {
// 				field.data.loading = false;
// 				return results.items || results || [];
// 			});
// 		}
// 	}
//
// 	return field;
// }
//
// KarmaFieldsAlpha.fields.input_datalist.build = function(field) {
// 	return {
// 		class: "datalist-input",
// 		update: function(container) {
// 			this.children = [
// 				{
// 					tag: "input",
// 					class: "text",
// 					init: function(input) {
// 						this.element.type = field.resource.input_type || "text";
// 						this.element.id = field.getId();
// 						this.element.setAttribute("list", "datalist-"+field.getId());
// 						this.element.addEventListener("input", function(event) {
// 							field.setValue(this.value, "change");
// 						});
// 						this.element.addEventListener("focus", function() {
// 							field.trigger("focus");
// 						});
// 						if (field.resource.input) {
// 							Object.assign(this.element, field.resource.input);
// 						}
// 					},
// 					update: function() {
// 						if (field.getResourceAttribute("disabled")) {
// 							this.element.disabled = true;
// 						} else if (field.getResourceAttribute("readonly")) {
// 							this.element.readOnly = true;
// 						}
// 						this.element.value = field.value || "";
// 					}
// 				},
// 				{
// 					tag: "datalist",
// 					class: "dropdown",
// 					init: function(container) {
// 						this.element.id = "datalist-"+field.getId();
// 					},
// 					update: function(dropdown) {
// 						field.data.fetch().then(function(items) {
//
// 							let hasOptgroups = items.some(function(item) {
// 								return item.group;
// 							});
//
// 							if (hasOptgroups) {
//
// 								let optgroups = items.reduce(function(obj, item) {
// 									let group = obj.find(function(group) {
// 										return group.name === (item.group || "default");
// 									});
// 									if (!group) {
// 										group = {
// 											name: item.group || "default",
// 											children: []
// 										};
// 										obj.push(group);
// 									}
// 									group.children.push(item);
// 									return obj;
// 								}, []);
//
// 								dropdown.children = optgroups.map(function(optgroup) {
// 									return {
// 										tag: "optgroup",
// 										update: function() {
// 											this.element.label = optgroup.name;
// 											this.children = optgroup.children.map(function(option) {
// 												return {
// 													tag: "option",
// 													update: function() {
// 														this.element.textContent = option.name;
// 													}
// 												};
// 											})
// 										}
// 									};
// 								});
//
// 							} else {
//
// 								dropdown.children = items.map(function(option) {
// 									return {
// 										tag: "option",
// 										update: function() {
// 											this.element.textContent = option.name;
// 										}
// 									};
// 								});
//
// 							}
//
// 							dropdown.render();
// 							field.data.loading = false;
// 							field.triggerEvent("update");
// 						});
// 					}
// 				}
// 			];
// 		}
// 	};
// }
