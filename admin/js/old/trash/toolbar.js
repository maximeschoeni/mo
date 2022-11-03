KarmaFieldsAlpha.fields.toolbar = {};

KarmaFieldsAlpha.fields.toolbar.create = function(resource) {
	let field = KarmaFieldsAlpha.Field(resource);
	field.events.toggle = function(currentField) {
		field.data.current = currentField === field.data.current ? null : currentField;
		field.triggerEvent("render");
	}
	addEventListener("click", function(event) {
		if (field.data.current) {
			field.triggerEvent("clickOut", false, field, event.target);
		}
	}, true);

	return field;
}

KarmaFieldsAlpha.fields.toolbarGroup = {};
KarmaFieldsAlpha.fields.toolbarDropdown = {};
// KarmaFieldsAlpha.fields.toolbarGroup.create = function(resource) {
// 	return KarmaFieldsAlpha.Field(resource);
// }



KarmaFieldsAlpha.fields.toolbarGroup.build = function(field) {
	return {
		class: "toolbar-group",
		children: field.children.map(function(child) {
			return child.build();
		})
	};
};
KarmaFieldsAlpha.fields.toolbarDropdown.create = function(resource) {
	let field = KarmaFieldsAlpha.Field(resource);
	field.data.button = KarmaFieldsAlpha.createField({
		type: "button",
		icon: resource.icon
	});
	field.data.button.events.click = function() {



		// const toolbar = field.getClosest("toolbar");
		//
		// toolbar.data.current = toolbar.data.current === field ? null : field;


		field.triggerEvent("toggle", true);

	}
	return field;
}
KarmaFieldsAlpha.fields.toolbarDropdown.build = function(field) {
	return {
		class: "toolbar-dropdown",
		update: function(dropdown) {

			this.children = [
				field.data.button.build()
			];
			let toolbar = field.getClosest("toolbar");

			if (toolbar && toolbar.data.current === field) {
				this.children.push({
					tag: "ul",
					init: function(popup) {
						// close popup when click outside

						// field.trigger("popup", true);

						// let onClickAnywhere = function(event) {
						// 	if (!dropdown.element.contains(event.target)) {
						// 		removeEventListener("click", onClickAnywhere);
						// 		toolbar.data.current = null;
						// 		dropdown.parent.render();
						// 	}
						// }
						// requestAnimationFrame(function() {
						// 	addEventListener("click", onClickAnywhere);
						// });
					},
					children: field.children.map(function(child) {
						return {
							tag: "li",
							child: child.build()
						};
					})
				});
			}


		}
	};
};
KarmaFieldsAlpha.fields.toolbar.build = function(field) {
	return {
		class: "karma-fields-toolbar",
		init: function(toolbar) {
			field.events.render = function() {
				toolbar.render();
			};
			field.events.clickOut = function(field, target) {
				if (!toolbar.element.contains(target)) {
					field.data.current = null;
					toolbar.render();
				}
			}
		},
		children: field.children.map(function(child) {
			return child.build();
		})
	};
}
