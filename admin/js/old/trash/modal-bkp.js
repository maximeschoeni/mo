KarmaFieldsAlpha.fields.modal = class extends KarmaFieldsAlpha.fields.field {

	constructor(resource, domain) {
		super(resource, domain);

		this.handle = new KarmaFieldsAlpha.fields.field(resource.handle);
		this.content = new KarmaFieldsAlpha.fields.group(resource.content);

    // this.filters.events.change = function(target) {
    //   return field.query().then(function() {
    //     field.filters.triggerEvent("render");
    //   });
    // }
		this.addChild(this.handle);
		this.addChild(this.content);


	}


	buildModal() {
		const field = this;

		return {
			class: "karma-modal",
			update: function(container) {

				console.log(field.content);
				this.child = {
					class: "karma-modal-content",
					child: field.content.build()
				};
			}
		};

	}

	build() {
		const field = this;

		return {
			tag: "a",
			class: "text karma-field",
			init: function(input) {
				this.element.type = field.resource.input_type || "text"; // compat

				this.element.setAttribute('tabindex', '-1');

				field.handle.fetchValue().then(function(value) {
					field.handle.triggerEvent("set");
					field.handle.triggerEvent("modify");
				});
				field.handle.init(this.element);
			},
			update: function(input) {

				this.element.onclick = function() {
					field.triggerEvent("openmodal", true);
				}
				field.handle.events.modify = function() {
					input.element.classList.toggle("modified", field.handle.isModified());
				}
				field.handle.events.load = function() {
					input.element.classList.toggle("loading", field.handle.loading > 0);
				}
				field.handle.events.set = function() {
					input.element.textContent = field.handle.getValue();
				}

				field.handle.triggerEvent("load");
				field.handle.triggerEvent("set");
				field.handle.triggerEvent("modify");

				// this.element.classList.toggle("loading", field.loading > 0);
				// this.element.classList.toggle("modified", field.isModified());
			}
		};
	}




}
