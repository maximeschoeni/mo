KarmaFieldsAlpha.fields.autocompletetextinput = function(field) {
	var manager = {};
	return {
		class: "autocomplete-input",
		init: function(element, render) {
			manager.render = render;
		},
		children: [
			{
				tag: "input",
				class: "text",
				init: function(input, render, args) {
					input.type = field.resource.type || "text";
					input.id = field.id;
					if (field.resource.readonly) {
						input.readOnly = true;
					} else {
						input.addEventListener("input", function(event) {
							manager.value = input.value;
							field.setValue(input.value);
							field.fetchOptions({
								search: input.value
							}).then(function(results) {
								var items = results.items || results; // compat !
								manager.options = items;
								manager.render();
							});
						});
					}
					field.fetchValue().then(function(value) { // -> maybe undefined
						manager.value = value || "";
						args.update = function(input) {
							input.value = manager.value;
						};
					});
					if (field.resource.width) {
						input.style.width = field.resource.width;
					}
				}
			},
			{
				tag: "ul",
				update: function(element, render, args) {
					args.children = manager.options && manager.options.map(function(item) {
						return {
							tag: "li",
							init: function(element) {
								element.addEventListener("click", function() {
									field.setValue(item.key);
									manager.value = item.name;
									manager.key = item.key;
									manager.options = null;
									manager.render();
								});
							},
							update: function(element) {
								element.innerHTML = item.name;
							}
						};
					});
				}
			}
		]
	};
}
