KarmaFieldsAlpha.fields.button = {};

KarmaFieldsAlpha.fields.button.create = function(resource) {
	let field = KarmaFieldsAlpha.Field(resource);
	field.data.setIcon = function(iconName) {

		if (field.data.currentIcon !== iconName) {
			field.data.currentIcon = iconName;
			KarmaFieldsAlpha.getAsset(KarmaFieldsAlpha.icons_url+"/"+iconName+".svg").then(function(result) {
				field.data.icon = result;
				field.triggerEvent("render");
				// requestAnimationFrame(function() {
				// 	field.triggerEvent("render");
				// });
			});
		}
	}
	if (resource.icon) {
		field.data.setIcon(resource.icon);
	}
	return field;
}

KarmaFieldsAlpha.fields.button.build = function(field) {
	return {
		tag: "button",
		init: function() {
			this.element.id = field.getId();
			this.element.onclick = function(event) {
				event.preventDefault();
				field.triggerEvent("click", true);
			}
		},
		render: function(clean) {
			this.element.innerHTML = (field.data.icon || "") + (field.resource.text || "");



			// if (field.data.icon) {
			// 	this.element.innerHTML = field.data.icon;
			// }
			// if (field.resource.text !== undefined) {
			// 	this.element.textContent = field.resource.text;
			// }
			this.element.disabled = field.getAttribute("disabled") || field.resource.disabled;
			this.element.hidden = field.getAttribute("hidden");
		}
	};
}
