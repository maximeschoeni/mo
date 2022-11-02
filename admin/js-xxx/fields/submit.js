KarmaFieldsAlpha.field.submit = class extends KarmaFieldsAlpha.field.button {

	constructor(resource) {
		super({
			primary: true,
			title: "Submit",
			action: "submit",
			disabled: ["!", ["modified"]],
			...resource
		});


	}

}
