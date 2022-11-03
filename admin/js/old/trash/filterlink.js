KarmaFieldsAlpha.fields.filterlink = function(field) {
	var isSelected;
	return KarmaFieldsAlpha.build({
		class: "filterlink",
		init: function(element, render) {
			field.onUpdate = function(value) { // -> historic change
				render();
			}
			field.fetch().then(field.onUpdate);
			field.onSelect = function() {
				isSelected = true;
				render();
			}
			field.onUnselect = function() {
				isSelected = false;
				render();
			}
		},
		child: function() {
			return KarmaFieldsAlpha.build({
				tag: "a",
				init: function(element) {
					var value = field.get();
					if (value && field.resource.key) {
						var params = {};
						params[field.resource.key] = value;
						field.fetchOptions(params).then(function(results) {
							element.innerText = results.items[0].name;
						});
					}
					if (isSelected) {
						element.classList.add("active");
						element.addEventListener("click", function() {
							var filters = {};
							filters[field.resource.key] = field.get();
							Object.freeze(filters);
							field.filter(filters);
						});
					}
				}
			});
		}
	});

}
