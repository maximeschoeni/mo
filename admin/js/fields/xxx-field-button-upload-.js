KarmaFieldsAlpha.field.upload = class extends KarmaFieldsAlpha.field.button {

	constructor(resource) {
		super({
			action: "upload",
			...resource
		});
	}

	build() {

		return {
			class: "karma-upload karma-field",
			init: button => {
				button.element.id = "upload-button";
			},
			children: [
				{
					tag: "input",
					init: input => {
						input.element.type = "file",
						input.element.id = this.getId();
						input.element.multiple = true;
						input.element.hidden = true;
					},
					update: input => {
						input.element.onchange = async event => {
							const files = input.element.files;
							if (files.length) {
								input.element.classList.add("editing");
								// requestIdleCallback(async () => {
								setTimeout(async () => {
									// this.dispatch({
									//   action: "upload",
									//   files: files,
									//   params: {
									//     parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
									//   }
									// }).then(async request => {
									//   input.element.classList.remove("editing");
									//   input.element.blur();
									// });
									await this.parent.request(this.resource.action, {
										files: files,
										params: {
											parent: KarmaFieldsAlpha.Nav.get("parent") || "0"
										}
									});
									input.element.classList.remove("editing");
									input.element.blur();
								}, 50);
							}
						}
					}
				},
				{
					tag: "label",
					init: input => {
						input.element.htmlFor = this.getId();
						input.element.textContent = this.resource.title || "Add File";
					}
				}
			]

		};
	}

}
