KarmaFieldsAlpha.fields.group = function(field) {
	return {
		class: "karma-field-group-container display-"+(field.resource.display || "flex"),
		init: function(group) {
			if (field.resource.display) {
				this.element.style.display = field.resource.display;
			}
			// field.events.update = function() {
			// 	group.element.classList.toggle("loading", field.data.loading || false);
			// 	group.element.classList.toggle("modified", field.value !== field.originalValue);
			// };
			// field.events.render = function() {
			// 	group.render();
			// };


		},
		update: function(group) {
			this.children = [];

			field.children.map(function(child) {

				if (KarmaFieldsAlpha.fields[child.resource.type || "group"]) {

					group.children.push({
						class: "karma-field-"+child.resource.type || "group",
						init: function(item) {
							child.trigger("init", child);
							if (child.resource.style) {
								this.element.style = child.resource.style;
							}
							child.events.update = function() {
								item.element.classList.toggle("loading", child.data.loading ? true : false);
								item.element.classList.toggle("modified", child.value !== child.originalValue);
							};
							child.events.render = function() {
								item.render();
							};
						},
						update: function(item) {
							// if (child.resource.style) {
							// 	this.element.style = child.resource.style;
							// }
							// child.events.update = function() {
							// 	item.element.classList.toggle("loading", child.data.loading ? true : false);
							// 	item.element.classList.toggle("modified", child.value !== child.originalValue);
							// };
							// child.events.render = function() {
							// 	item.render();
							// };

							child.events.update();

							this.children = [
								KarmaFieldsAlpha.fields[child.resource.type || "group"](child),
								{
									class: "karma-field-spinner"
								}
							];
							if (child.resource.label) {
								this.children.unshift({
									tag: "label",
									init: function(label) {
										this.element.htmlFor = child.getId();
										this.element.textContent = child.resource.label;
									}
								});
							}
						}
					});
				} else if (child.resource.type !== "hidden") {
					console.error("Resource type does not exist!", child.resource.type);
				}

			});

			// (field.resource.children || []).map(function(resource) {
			//
			// 	let child = field.createChild(resource);
			//
			// 	if (KarmaFieldsAlpha.fields[resource.type || "group"]) {
			//
			// 		group.children.push({
			// 			class: "karma-field-"+resource.type || "group",
			// 			update: function(item) {
			// 				if (resource.style) {
			// 					this.element.style = resource.style;
			// 				}
			// 				child.events.update = function() {
			// 					item.element.classList.toggle("loading", child.data.loading ? true : false);
			// 					item.element.classList.toggle("modified", child.value !== child.originalValue);
			// 				};
			// 				child.events.render = function() {
			// 					item.render();
			// 				};
			// 				// child.events.change = function(...args) {
			// 				// 	return field.trigger("change", ...args);
			// 				// };
			// 				// child.events.fetch = function(...args) {
			// 				// 	return field.trigger("fetch", ...args);
			// 				// };
			// 				// child.events.get = function(...args) {
			// 				// 	return field.trigger("get", ...args);
			// 				// };
			//
			// 				child.events.update();
			//
			// 				this.children = [
			// 					KarmaFieldsAlpha.fields[resource.type || "group"](child),
			// 					{
			// 						class: "karma-field-spinner"
			// 					}
			// 				];
			// 				if (resource.label) {
			// 					this.children.unshift({
			// 						tag: "label",
			// 						init: function(label) {
			// 							this.element.htmlFor = child.getId();
			// 							this.element.textContent = resource.label;
			// 						}
			// 					});
			// 				}
			// 			}
			// 		});
			// 	} else if (resource.type !== "hidden") {
			// 		console.error("Resource type does not exist!", resource.type);
			// 	}
			// });

		}
	};
}
