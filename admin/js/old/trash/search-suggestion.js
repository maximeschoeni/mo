KarmaFieldsAlpha.fields.search = function(fieldManager) {
	return {
		class: "search-form",
		init: function(container) {
			container.data.suggestions = [];
			// var value;
			this.element.addEventListener("focusout", function() {
				// container.data.suggestions = [];
				fieldManager.history.write("static", ["searchsuggestions", fieldManager.resource.key], undefined);
				container.render();
			});
			this.element.addEventListener("focusin", function() {
				container.render();
			});
			this.children = [
				{
					class: "search",
					tag: "input",
					init: function(input) {
						this.element.type = "search";
						this.element.placeholder = fieldManager.resource.title || "Search";

						this.element.addEventListener("input", function(event) {
							container.data.currentIndex = -1;
							if (this.value.length > 1) {
								fieldManager.fetchOptions({
									search: this.value
								}).then(function(results) {
									var items = results.items || results; // compat !
									container.data.suggestions = items || [];
									// fieldManager.history.write("static", ["searchsuggestions", fieldManager.resource.key], results.items || undefined);
									container.render();
								});
							} else if (this.value === "") {
								container.data.suggestions = [];
								fieldManager.setValue("");
							}
						});
						this.element.addEventListener("keyup", function(event) {
							if (container.data.currentIndex === undefined) {
								container.data.currentIndex = -1;
							}
							if (event.key === "ArrowDown" && container.data.suggestions && container.data.currentIndex+1 < container.data.suggestions.length) {
								container.data.currentIndex++;
								container.render();
							} else if (event.key === "ArrowUp" && container.data.currentIndex > -1) {
								container.data.currentIndex--;
								container.render();
							}
							// else if (event.key === "Enter") {
							// 	// var suggestion = container.data.suggestions[container.data.currentIndex];
							// 	// // console.log(container.data.suggestions, container.data.currentIndex);
							// 	// if (suggestion) {
							// 	// 	fieldManager.setValue(suggestion);
							// 	// 	input.element.value = suggestion;
							// 	// 	container.render();
							// 	// }
							// 	// event.stopImmediatePropagation();
							// 	// event.preventDefault();
							// }
							// console.log(event.key);
						});
						this.element.addEventListener("search", function() {
							var suggestion = container.data.suggestions[container.data.currentIndex];
							// console.log(container.data.suggestions, container.data.currentIndex);
							if (suggestion) {
								this.value = suggestion;
							}

							fieldManager.setValue(this.value);
							// fieldManager.history.write("static", ["searchsuggestions", fieldManager.resource.key], undefined);
							container.data.suggestions = [];

							container.render();

							// fieldManager.tableManager.request();
						});

						if (fieldManager.resource.style) {
							this.element.style = fieldManager.resource.style;
						}
					},
					update: function() {
						// var value = fieldManager.getValue();
						if (container.data.value) {
							this.element.value = container.data.value;
							container.data.value = null;
						}
						// else {
						// 	this.element.value = fieldManager.getValue() || "";
						// }
					}
				},
				{
					tag: "ul",
					init: function() {

					},
					update: function() {
						// container.data.suggestions = fieldManager.history.read("static", ["searchsuggestions", fieldManager.resource.key]) || [];
						this.children = container.data.suggestions.map(function(word, index) {
							return {
								tag: "li",
								init: function(item) {
									this.element.addEventListener("mousedown", function(event) {
										event.preventDefault();
									});
									this.element.addEventListener("click", function(event) {
										fieldManager.setValue(this.innerHTML);
										container.data.suggestions = [];
										container.data.value = this.innerHTML;
										container.render();
									});
								},
								update: function() {
									this.element.innerHTML = word;
									this.element.classList.toggle("active", index === container.data.currentIndex);
								}
							}
						});
						this.element.style.display = container.data.suggestions.length ? "block" : "none";
					}
				}
			];
		}
	};



}
