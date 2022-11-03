KarmaFieldsAlpha.fields.checkboxtest = function(field) {
	return {
		tag: "button",
		class: "on-off",
		init: function(button) {
			this.element.addEventListener("click", function() {
				var value = field.getValue();
				field.setValue(value === "1" ? "0" : "1");
				field.trigger("render");
			});
		},
		update: function() {
			this.child = KarmaFieldsAlpha.includes.icon({
				file: KarmaFieldsAlpha.icons_url+"/"+(field.getValue() === "1" ? "yes.svg" : "no-alt.svg")
			});
		}
	};
}
