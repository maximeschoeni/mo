KarmaFieldsAlpha.fields.group = class extends KarmaFieldsAlpha.fields.field {

	// updateState(state) {
	// 	super.updateState(state);
  //   this.try("onState", state);
	// }

	constructor(...args) {
    super(...args);

    if (this.resource.children) {
  		for (let i = 0; i < this.resource.children.length; i++) {
  			this.createChild(this.resource.children[i]);
  		}
  	}

  }

	update() {
    for (let child of this.children) {
      child.update();
    }
  }



	// async match(condition) {
	// 	// const value = await this.getRelatedValue(condition.key);
	//
	// 	const val = await this.parent.fetchValue(null, condition.key);
	// 	switch (condition.comparison) {
	// 		case "<": return val < condition.value;
	// 		case ">": return val > condition.value;
	// 		case "<=": return val <= condition.value;
	// 		case ">=": return val >= condition.value;
	// 		case "!=": return val != condition.value;
	// 		case "!==": return val !== condition.value;
	// 		case "==": return val == condition.value;
	// 		case "includes": return val.includes(condition.value);
	// 		case "startsWith": return val.startsWith(condition.value);
	// 		case "endsWidth": return val.endsWidth(condition.value);
	// 		case "!": return !val;
	// 		case "between": return val >= condition.value && val <= condition.value2;
	// 		// case "null": return val === null || var === undefined;
	// 		// case "notNull": return val === null || var === undefined;
	// 		default: return val === condition.value;
	// 	}
	// }
	buildLabel(field) {
		return {
			tag: "label",
			init: label => {
				if (field.resource.label) {
					label.element.htmlFor = field.getId();
					label.element.textContent = field.resource.label;
				}
			}
		};
	}

	// buildFrame(field) {
	//
	// 	return {
	// 		class: "karma-field-frame karma-field-"+field.resource.type,
	// 		init: (container) => {
	// 			if (field.resource.style) {
	// 				container.element.style = field.resource.style;
	// 			}
	// 			if (field.resource.class) {
	// 				container.element.classList.add(field.resource.class);
	// 			}
	// 			if (field.resource.flex) {
	// 				container.element.style.flex = field.resource.flex;
	// 			}
	// 		},
	// 		update: async (container) => {
	// 			container.children = [];
	//
	// 			if (!field.resource.condition || await this.match(field.resource.condition)) {
	//
	// 				if (field.resource.label) {
	// 					container.children.push(this.buildLabel(field));
	// 				}
	//
	// 				container.children.push(field.build());
	//
	// 			}
	//
	// 			container.element.classList.toggle("final", field.resource.final || !field.resource.children || !field.resource.children.some(child => child.type && child.type === "group"));
	// 		}
	// 		// update: async (container) => {
	// 		// 	if (field.resource.condition) {
	// 		// 		const match = await this.match(field.resource.condition);
	// 		// 		// console.log(match, field.resource, container.element);
	// 		// 		container.element.classList.toggle("hidden", !match);
	// 		//
	// 		//
	// 		// 	}
	// 		//
	// 		// 	container.element.classList.toggle("final", field.resource.final || !field.resource.children || !field.resource.children.some(child => child.type && child.type === "group"));
	// 		//
	// 		// 	container.children = [];
	// 		// 	if (field.resource.label) {
	// 		// 		container.children.push({
	// 		// 			tag: "label",
	// 		// 			init: (label) => {
	// 		// 				if (field.resource.label) {
	// 		// 					label.element.htmlFor = field.getId();
	// 		// 					label.element.textContent = field.resource.label;
	// 		// 				}
	// 		// 			}
	// 		// 		});
	// 		// 	}
	// 		// 	container.children.push(field.build());
	// 		// 	// container.children.push({
	// 		// 	// 	class: "karma-field-spinner"
	// 		// 	// });
	// 		// }
	// 	};
	// }

	build() {
		return {
			class: "karma-field karma-field-container display-"+(this.resource.display || "block"),
			// init: group => {
			// 	// this.render = group.render;
			// 	// this.render = () => {
			// 	// 	group.render()
			// 	// };
			// 	// if (this.resource.style) {
			// 	// 	group.element.style = this.resource.style;
			// 	// }
			// },
			update: group => {
				this.render = group.render;

				group.element.classList.toggle("disabled", this.getState() === "disabled");

				// group.children = this.children.map(child => {
				// 	if (child instanceof KarmaFieldsAlpha.fields.separator) {
				// 		return child.build();
				// 	} else {
				// 		return this.buildFrame(child);
				// 	}
				// });

				// group.children = this.children.map(child => this.buildFrame(child));
			},
			children: this.children.map(field => {

				if (!KarmaFieldsAlpha.fields[field.resource.type || "group"]) {
					console.error("Field does not exist", field.resource.type);
				}

				if (field.resource.type === "hidden") {
					return field.build();
				}

				return {
					class: "karma-field-frame karma-field-"+field.resource.type,
					init: (container) => {
						if (field.resource.style) {
							container.element.style = field.resource.style;
						}
						if (field.resource.class) {
							container.element.classList.add(field.resource.class);
						}
						if (field.resource.flex) {
							container.element.style.flex = field.resource.flex;
						}
					},
					update: async (container) => {
						container.children = [];

						if (!field.resource.condition || await this.match(field.resource.condition)) {

							if (field.resource.label) {
								container.children.push(this.buildLabel(field));
							}

							container.children.push(field.build());
							container.element.classList.remove("hidden");

						} else {

							container.element.classList.add("hidden");

						}

						container.element.classList.toggle("final", field.resource.final || !field.resource.children || !field.resource.children.some(child => child.type && child.type === "group"));
					}
				}
			})
		};
	}

}
