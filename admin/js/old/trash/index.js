KarmaFieldsAlpha.fields.index = function(field) {
	return KarmaFieldsAlpha.build({
		class: "index",
		text: function(input) {
			return (field.rowIndex || 0) + 1;
		}
	});
}
