// https://github.com/tinymce/tinymce-dist/blob/master/tinymce.js

// /Applications/MAMP/htdocs/wordpress/wp-includes/js/tinymce/plugins/link/plugin.min.js


// var block = {
// 	blocks: [
// 		{
// 			columns: [
// 				{
// 					blocks: [
// 						{
// 							content: "text <a>xxx</a>",
// 							classes: "yyy"
// 						},
// 						{
// 							content: "<img>",
// 							classes: "xxx"
// 						},
// 						{
// 							columns: [
// 								{
// 									blocks: [
//
// 									]
// 								}
// 							]
// 						}
// 					]
// 				},
// 				{
//
// 				}
// 			]
// 		}
// 	]
// };


KarmaFieldsAlpha.field.tinymce = class extends KarmaFieldsAlpha.field {

	constructor(...args) {
		super(...args);

		this.image = this.createChild({
			id: "image",
			key: "image",
			type: "file",
			mimetypes: ["image"]
		});

		this.file = this.createChild({
			id: "file",
			key: "file",
			type: "file",
			mimetypes: [],
			multiple: false
		});

	}

	async createEditor(element) {
		if (this.editor) {
			this.editor.destroy();
			this.editor = null;
		}

		if (!this.editor) {
			const editors = await tinyMCE.init({
				target: element,
				hidden_input: false,
				inline: true,
				menubar: false,
				contextmenu: false,
				toolbar: false,
				skin: false,
				// plugins: "link lists table paste",
				plugins: "link lists paste",
				convert_urls: false,
				// image_caption: true,
				paste_postprocess: (pl, o) => {
					function unwrap(node) {
						let container = document.createElement("div");
						for (let child of node.childNodes) {
							if (child.nodeType === Node.ELEMENT_NODE && child.matches("div,span")) {
								container.append(...unwrap(child).childNodes);
							} else {
								container.append(child);
							}
						}
						return container;
					}
					o.node = unwrap(o.node);
					o.node.innerHTML = o.node.innerHTML.normalize();
			  }
			});

			this.editor = editors.pop();



			if (!this.editor) {
				return;
			}


			// unactivate history
			this.editor.on("BeforeAddUndo", event => {
				event.preventDefault();
				// this.backup();
				// this.nextup();
			});

			this.editor.on("input", event => {
				this.saveContent();
			});

			this.editor.on("NodeChange", event => {
				if (event.selectionChange) {
					if (this.activeModal && event.element !== this.activeNode) {
						this.activeNode = null;
						this.activeModal = null;
						this.renderPopover();
					}
				}
				this.renderToolbar();
			});

			this.editor.on("focusout", event => {
				if (this.activeModal && (!event.relatedTarget || !this.popoverContainer.contains(event.relatedTarget))) {
					this.activeNode = null;
					this.activeModal = null;
					this.renderPopover();
				}
				this.renderToolbar();
			});

			this.editor.on("click", event => {

				const node = this.editor.selection.getNode();

				if (node.matches("a")) {
					this.activeNode = node;
					// this.trigger("link");
					this.dispatch({action: "link"});
				}

				if (node.matches("img")) {
					this.activeNode = node;
					// this.trigger("editmedia");
					this.dispatch({action: "editmedia"});
				}

			});

			this.editor.on("dblclick", event => {
				const node = this.editor.selection.getNode();
				if (node.matches("img")) {
					this.dispatch({action: "addmedia"});
				}
			});

			this.editor.on("ObjectResized", async event => {
				// await this.trigger("resizemedia");
				await this.dispatch({action: "resizemedia"});
				await this.renderPopover();
			});

		}

		return this.editor;
	}


	async dispatch(event) {


		switch (event.action) {

			case "get":
				event.setValue(this.get(...event.path));
				break;

			case "set":
			case "send":
				await this.set(event.getValue(), ...event.path);
				break;



			// case "trigger":
			// 	await this.trigger(event.action);
			// 	break;

			case "link":
				this.activeModal = this.createChild(this.parseResource("link")).getModal();
				await this.renderPopover();
				break;

			case "attachfile":
				this.file.uploader.open(this.activeNode && this.activeNode.getAttribute("data-attachment-id"));
				break;

			case "unlink":
			case "bold":
			case "italic":
			case "strikethrough":
			case "superscript":
			case "subscript":
			case "JustifyLeft":
			case "JustifyCenter":
			case "JustifyRight":
			case "JustifyFull":
			case "JustifyNone":
				this.editor.execCommand(event.action);
				await this.saveContent();
				break;

			case "ul":
				if (this.editor.queryCommandValue("InsertUnorderedList") !== "true") {
					this.editor.execCommand('InsertUnorderedList', false, {
					  'list-style-type': 'disc'
					});
				} else {
					this.editor.execCommand("RemoveList");
				}
				await this.saveContent();
				break;

			case "ol":
				if (this.editor.queryCommandValue("InsertOrderedList") !== "true") {
					this.editor.execCommand('InsertOrderedList', false, {
						'list-style-type': 'decimal'
					});
				} else {
					this.editor.execCommand("RemoveList");
				}
				await this.saveContent();
				break;

			case "table":
				this.editor.execCommand('mceInsertTable', false, { rows: 2, columns: 2 });
				// this.editor.execCommand('mceTableInsertColAfter', false);
				await this.saveContent();
				break;

			case "close":
				this.activeNode = null;
				this.activeModal = null;
				await this.renderPopover();
				break;

			case "addmedia":
				this.image.uploader.open(this.activeNode && this.activeNode.getAttribute("data-id"));
				break;

			case "editmedia":
				this.activeModal = this.createChild(this.parseResource("media")).getModal();
				await this.renderPopover();
				break;

			case "resizemedia":
				var node = this.editor.selection.getNode();
				var width = this.editor.selection.getNode().getAttribute("width");
				node.sizes = `(min-width: ${width}px) ${width}px, 100vw`;
				await this.saveContent();
				break;

			case "alignnone":
			case "alignleft":
			case "alignright":
			case "aligncenter":
				this.activeNode.classList.remove("alignright");
				this.activeNode.classList.remove("alignleft");
				this.activeNode.classList.remove("aligncenter");
				if (event.action !== "alignnone") {
					this.activeNode.classList.add(event.action);
				}
				this.editor.nodeChanged();
				await this.renderPopover();
				await this.saveContent();
				break;

			default:
				await super.dispatch(event);
				break;

		}

		return event;

	}

	get(key, ...path) {

		switch (key) {

			case "format":
				return this.getFormat();

			case "link":
				return KarmaFieldsAlpha.DeepObject.get(this.getLink(), ...path);

			case "align":
				return this.activeNode && this.activeNode.classList.contains("alignleft") && "left"
					|| this.activeNode && this.activeNode.classList.contains("aligncenter") && "center"
					|| this.activeNode && this.activeNode.classList.contains("alignright") && "right"
					|| "none";

			case "alignleft":
			case "aligncenter":
			case "alignright":
				return this.activeNode && this.activeNode.classList.contains(key);

			case "alignnone":
				return this.activeNode && !this.activeNode.classList.contains("alignleft") && !this.activeNode.classList.contains("aligncenter") && !this.activeNode.classList.contains("alignright");

			case "islink":
				return this.activeNode && this.activeNode.matches("a");

			case "ul":
				return this.editor && this.editor.queryCommandValue("InsertUnorderedList") === "true";

			case "ol":
				return this.editor && this.editor.queryCommandValue("InsertOrderedList") === "true";

			case "bold":
			case "italic":
			case "strikethrough":
			case "superscript":
			case "subscript":
			case "JustifyLeft":
			case "JustifyCenter":
			case "JustifyRight":
			case "JustifyFull":
			case "JustifyNone":
				return this.editor && this.editor.queryCommandState(key);

			case "selected":
				return this.editor && this.editor.selection.getContent().length > 0;


		}

	}

	async set(value, key, ...path) {

		switch (key) {

			case "format":
				this.setFormat(value);
				await this.saveContent();
				break;

			case "image": {
				const images = await this.image.fetchIds(value, {sources: 1});
				this.setImages(images);
				await this.saveContent();
				this.activeModal = this.createChild(this.parseResource("media")).getModal();
				await this.renderPopover();
				break;
			}

			case "file": {
				this.activeModal = this.createChild(this.parseResource("link")).getModal();
				await this.renderPopover();
				const files = await this.file.fetchIds(value);
				for (let file of files) {
					await this.activeModal.buffer.set([file.original_src], "href");
					await this.activeModal.buffer.set(value, "attachment_id");
					break;
				}
				await this.activeModal.render();
				break;
			}

			case "link": {
				this.setLink(value);
				await this.saveContent();
				this.activeNode = null;
				this.activeModal = null;
				await this.renderPopover();
				break;
			}

		}

	}

	async trigger(action) {

		switch (action) {

			case "link":
				this.activeModal = this.createChild(this.parseResource("link")).getModal();
				await this.renderPopover();
				break;

			case "attachfile":
				this.file.uploader.open(this.activeNode && this.activeNode.getAttribute("data-attachment-id"));
				break;

			case "unlink":
			case "bold":
			case "italic":
			case "strikethrough":
			case "superscript":
			case "subscript":
			case "JustifyLeft":
			case "JustifyCenter":
			case "JustifyRight":
			case "JustifyFull":
			case "JustifyNone":
				this.editor.execCommand(action);
				await this.saveContent();
				break;

			case "ul":
				if (this.editor.queryCommandValue("InsertUnorderedList") !== "true") {
					this.editor.execCommand('InsertUnorderedList', false, {
					  'list-style-type': 'disc'
					});
				} else {
					this.editor.execCommand("RemoveList");
				}
				await this.saveContent();
				break;

			case "ol":
				if (this.editor.queryCommandValue("InsertOrderedList") !== "true") {
					this.editor.execCommand('InsertOrderedList', false, {
						'list-style-type': 'decimal'
					});
				} else {
					this.editor.execCommand("RemoveList");
				}
				await this.saveContent();
				break;

			case "table":
				this.editor.execCommand('mceInsertTable', false, { rows: 2, columns: 2 });
				// this.editor.execCommand('mceTableInsertColAfter', false);
				await this.saveContent();
				break;

			case "close":
				this.activeNode = null;
				this.activeModal = null;
				await this.renderPopover();
				break;

			case "addmedia":
				this.image.uploader.open(this.activeNode && this.activeNode.getAttribute("data-id"));
				break;

			case "editmedia":
				this.activeModal = this.createChild(this.parseResource("media")).getModal();
				await this.renderPopover();
				break;

			case "resizemedia":
				var node = this.editor.selection.getNode();
				var width = this.editor.selection.getNode().getAttribute("width");
				node.sizes = `(min-width: ${width}px) ${width}px, 100vw`;
				await this.saveContent();
				break;

			case "alignnone":
			case "alignleft":
			case "alignright":
			case "aligncenter":
				this.activeNode.classList.remove("alignright");
				this.activeNode.classList.remove("alignleft");
				this.activeNode.classList.remove("aligncenter");
				if (action !== "alignnone") {
					this.activeNode.classList.add(action);
				}
				this.editor.nodeChanged();
				await this.renderPopover();
				await this.saveContent();
				break;

		}

	}


	getFormat() {
		const matches = this.editor && this.editor.queryCommandValue("FormatBlock").match(/h[1-6]/);
		return matches && matches[0] || "";
	}

	setFormat(value) {
		if (this.editor) {
			this.editor.execCommand("FormatBlock", false, value);
		}
	}

	setImages(images) {

		for (let image of images) {

			const node = this.editor.selection.getNode();

			let width = image.sources[0].width;
			let height = image.sources[0].height;

			if (node && node.matches("img")) {
				width = node.getAttribute("width") || width;
				height = node.getAttribute("height") || height;
			}

			this.editor.execCommand(
				'mceInsertContent',
				false,
				`<img
					src="${image.sources[0].src}"
					width="${width}"
					height="${height}"
					data-id="${image.id}"
					srcset="${image.sources.map(source => source.src+" "+source.width+"w").join(", ")}"
					sizes="(min-width: ${width}px) ${width}px, 100vw"
				>`
			);

		}
	}

	getLink() {
		const node = this.editor && this.editor.selection.getNode();
		const value = {};

		if (node) {
			value.href = node.getAttribute("href") || "";
			value.target = node.target === "_blank" ? "1" : "";
			if (node.hasAttribute("data-attachment-id")) {
				value.attachment_id = [node.getAttribute("data-attachment-id")];
			}
		}

		return value;
	}

	setLink(value) {
		let link = this.getLink();
		KarmaFieldsAlpha.DeepObject.merge(link, value);
		if (link.href) {
			this.editor.execCommand("mceInsertLink", false, {
				"href": link.href[0],
				"target": link.target[0] ? "_blank" : null,
				"data-attachment-id": link.attachment_id && link.attachment_id[0] || null
			});
		} else {
			this.editor.execCommand("Unlink");
		}
	}


	async saveContent() {

		// const event = this.createEvent({
		// 	action: "set",
		// 	type: "string",
		// 	autosave: this.resource.autosave
		// });

		// const event = this.createEvent();
		// event.action = "set";
		// event.type = "string";
		// event.autosave = this.resource.autosave;
		//
		// event.setValue(this.editor.getContent());
		//
		//
		// await super.dispatch(event);

		await this.setValue(this.editor.getContent());

	}

	async getValue() {

		const event = this.createEvent();
		event.action = "get";
		event.type = "string";
		event.default = this.getDefault(); // -> no care if promise

		await super.dispatch(event);

		return event.getValue();
	}


	async setValue(value) {

		const event = this.createEvent();
		event.action = "set";
		event.type = "string";
		// event.backup = "once";
		event.autosave = this.resource.autosave;
		event.setValue(value);

		await super.dispatch(event);
	}

	async getDefault() {
		return this.resource.default || "";
	}

	build() {
		return {
			class: "editor karma-tinymce",
			init: editor => {
				if (this.resource.theme) {
					editor.element.classList.add("theme-"+this.resource.theme);
				}
			},
			children: [
				{
					class: "editor-header",
					children: [
						{
							class: "toolbar",
							init: toolbar => {
								this.renderToolbar = toolbar.render;
							},
							child: this.createChild({
								type: "group",
								id: "editor-buttons",
								display: "flex",
								children: (this.resource.buttons || ["format", "bold", "italic", "link", "ul", "ol"]).map(child => this.parseResource(child))
							}).build()
						}
					]
				},
				{
					class: "tinymce editor-body",
					init: async node => {
						node.element.id = this.getId();
						node.element.editable = true;
						await this.createEditor(node.element);
					},
					update: async node => {
						// const event = this.createEvent();
						// event.action = "get";
						// event.type = "string";
						// event.default = this.getDefault(); // -> no care if promise
						// await this.dispatch(event);
						// this.editor.setContent(event.getString());
						// debugger;
						const value = await this.getValue();
						this.editor.setContent(value);
					}
				},
				{
					class: "karma-popover-container",
					init: container => {
						this.renderPopover = container.render;
						this.popoverContainer = container.element;
					},
					update: container => {
						container.element.onfocusout = event => {
							if (this.activeModal && (!event.relatedTarget || !container.element.contains(event.relatedTarget) && !this.editor.getBody().contains(event.relatedTarget))) {
								// this.activePopover = null;
								this.activeNode = null;
								this.activeModal = null;
								container.render();
							}
						};
						container.children = this.children.filter(child => child.resource.modal).map(child => {
							return {
								class: "karma-tinymce-popover",
								init: popover => {
									popover.element.tabIndex = -1;
								},
								update: async popover => {
									const modal = child.getModal();

									popover.element.classList.toggle("active", this.activeModal === modal);
									if (this.editor && this.activeModal === modal) {

										const containerBox = container.element.parentNode.getBoundingClientRect();
										let nodeBox;

										if (this.activeNode) {
											nodeBox = this.activeNode.getBoundingClientRect();
										} else {
											nodeBox = this.editor.selection.getRng().getBoundingClientRect()
										}

										popover.element.style.left = (nodeBox.left - containerBox.x).toFixed()+"px";
										popover.element.style.top = (nodeBox.bottom - containerBox.y + 5).toFixed()+"px";

										if (modal.buffer) {
											modal.buffer.empty();
										}

										popover.children = [modal.build()];
									}

								}
							};
						});
					}
				}
			]
		}
	}

	parseResource(resource) {
		if (typeof resource === "string") {
			resource = KarmaFieldsAlpha.field.tinymce.defaults[resource];
		}
		return resource;

	// 	if (typeof resource === "string") {
	//
	// 		switch (resource) {
	//
	// 			case "format":
	// 				resource = {
	// 					id: "format",
	// 					type: "dropdown",
	// 					key: "format",
	// 					options: [
	// 						{key: "", name: "Format"},
	// 						{key: "h1", name: "H1"},
	// 						{key: "h2", name: "H2"},
	// 						{key: "h3", name: "H3"},
	// 						{key: "h4", name: "H4"},
	// 						{key: "h5", name: "H5"},
	// 						{key: "h6", name: "H6"},
	// 						{key: "p", name: "P"}
	// 					]
	// 				};
	// 				break;
	//
	// 			case "italic":
	// 				resource = {
	// 					id: "italic",
	// 					type: "button",
	// 					dashicon: "editor-italic",
	// 					title: "italic",
	// 					value: "italic",
	// 					active: "italic"
	// 				};
	// 				break;
	//
	// 			case "bold":
	// 				resource = {
	// 					id: "bold",
	// 					type: "button",
	// 					dashicon: "editor-bold",
	// 					title: "bold",
	// 					value: "bold",
	// 					active: "bold"
	// 				};
	// 				break;
	//
	// 			case "link":
	// 				resource = {
	// 					id: "link",
	// 					type: "button",
	// 					dashicon: "admin-links",
	// 					title: "link",
	// 					value: "createlink",
	// 					active: "link",
	// 					disabled: "!selected",
	// 					modal: {
	// 						type: "form",
	// 						states: {
	// 							href: "href",
	// 						},
	// 						key: "link",
	// 						id: "link",
	// 						children: [
	// 							{
	// 								type: "group",
	// 								// id: "link-popover",
	// 								children: [
	// 									{
	// 										type: "group",
	// 										display: "flex",
	// 										children: [
	// 											{
	// 												type: "input",
	// 												key: "href",
	// 												focus: true,
	// 												style: "flex-grow:1"
	// 											},
	// 											{
	// 												type: "button",
	// 												dashicon: "paperclip",
	// 											}
	// 										]
	// 									},
	// 									{
	// 										type: "checkbox",
	// 										key: "target",
	// 										text: "Open in new tab"
	// 									},
	// 									{
	// 										type: "group",
	// 										display: "flex",
	// 										// container: {style: "justify-content: space-between"},
	// 										children: [
	// 											{
	// 												type: "group",
	// 												display: "flex",
	// 												children: [
	// 													{
	// 														type: "button",
	// 														title: "Cancel",
	// 														value: "close"
	// 													},
	// 													{
	// 														type: "button",
	// 														title: "Unlink",
	// 														// dashicon: "editor-unlink"
	// 														value: "unlink",
	// 														disabled: "!href"
	// 													}
	// 												]
	// 											},
	// 											{
	// 												type: "submit",
	// 												title: "Apply"
	// 											}
	// 										]
	// 									}
	// 								]
	// 							}
	// 						]
	// 					}
	// 				};
	// 				break;
	//
	// 			case "ul":
	// 				resource = {
	// 					id: "ul",
	// 					type: "button",
	// 					dashicon: "editor-ul",
	// 					title: "Unordered list",
	// 					value: "ul",
	// 					active: "ul"
	// 				};
	// 				break;
	//
	// 			case "ol":
	// 				resource = {
	// 					id: "ol",
	// 					type: "button",
	// 					dashicon: "editor-ol",
	// 					title: "Ordered list",
	// 					value: "ol",
	// 					active: "ol"
	// 				};
	// 				break;
	//
	// 			case "table":
	// 				resource = {
	// 					id: "table",
	// 					type: "button",
	// 					dashicon: "editor-table",
	// 					title: "Table",
	// 					value: "table"
	// 				};
	// 				break;
	//
	//
	// 			case "justifyleft":
	// 				resource = {
	// 					id: "justifyleft",
	// 					type: "button",
	// 					dashicon: "editor-alignleft",
	// 					title: "Justify Left",
	// 					value: "JustifyLeft",
	// 					active: "JustifyLeft"
	// 				};
	// 				break;
	//
	// 			case "justifycenter":
	// 				resource = {
	// 					id: "justifycenter",
	// 					type: "button",
	// 					dashicon: "editor-aligncenter",
	// 					title: "Justify Center",
	// 					value: "JustifyCenter",
	// 					active: "JustifyCenter"
	// 				};
	// 				break;
	//
	// 			case "justifyright":
	// 				resource = {
	// 					id: "justifyright",
	// 					type: "button",
	// 					dashicon: "editor-alignright",
	// 					title: "Justify Right",
	// 					value: "JustifyRight",
	// 					active: "JustifyRight"
	// 				};
	// 				break;
	//
	// 			case "justifyfull":
	// 				resource = {
	// 					id: "justifyfull",
	// 					type: "button",
	// 					dashicon: "editor-justify",
	// 					title: "Justify Full",
	// 					value: "JustifyFull",
	// 					active: "JustifyFull"
	// 				};
	// 				break;
	//
	//
	// 			case "image":
	// 				resource = {
	// 					id: "image",
	// 					type: "button",
	// 					dashicon: "format-image",
	// 					title: "Image",
	// 					value: "image"
	// 				};
	// 				break;
	//
	// 			case "file":
	// 				resource = {
	// 					id: "file",
	// 					key: "file",
	// 					type: "file",
	// 					mimetypes: ["image"]
	// 				};
	// 				break;
	//
	// 		}
	//
	// 	}
	//
	// 	return resource; //super.createChild(resource);
	}
}

KarmaFieldsAlpha.field.tinymce.defaults = {
	format: {
		id: "format",
		type: "dropdown",
		key: "format",
		options: [
			{key: "", name: "Format"},
			{key: "h1", name: "H1"},
			{key: "h2", name: "H2"},
			{key: "h3", name: "H3"},
			{key: "h4", name: "H4"},
			{key: "h5", name: "H5"},
			{key: "h6", name: "H6"},
			{key: "p", name: "P"}
		]
	},
	italic: {
		id: "italic",
		type: "button",
		dashicon: "editor-italic",
		title: "italic",
		action: "italic",
		active: "italic"
	},
	bold: {
		id: "bold",
		type: "button",
		dashicon: "editor-bold",
		title: "bold",
		action: "bold",
		active: "bold"
	},
	link: {
		id: "link",
		type: "button",
		dashicon: "admin-links",
		title: "link",
		// key: "createlink",
		action: "link",
		active: "islink",
		disabled: "!selected",
		modal: {
			type: "form",
			key: "link",
			id: "popover",
			children: [
				{
					type: "group",
					// id: "link-popover",
					children: [
						{
							type: "group",
							display: "flex",
							children: [
								{
									type: "input",
									key: "href",
									style: "flex-grow:1"
								},
								{
									type: "button",
									dashicon: "paperclip",
									action: "attachfile"
								}
							]
						},
						{
							type: "checkbox",
							key: "target",
							text: "Open in new tab"
						},
						{
							type: "group",
							display: "flex",
							// container: {style: "justify-content: space-between"},
							children: [
								{
									type: "group",
									display: "flex",
									children: [
										{
											type: "button",
											title: "Cancel",
											action: "close"
										},
										{
											type: "button",
											title: "Unlink",
											// dashicon: "editor-unlink"
											action: "unlink",
											disabled: "!href"
										}
									]
								},
								{
									type: "submit",
									title: "Apply"
								}
							]
						}
					]
				}
			]
		}
	},
	ul: {
		id: "ul",
		type: "button",
		dashicon: "editor-ul",
		title: "Unordered list",
		action: "ul",
		active: "ul"
	},
	ol: {
		id: "ol",
		type: "button",
		dashicon: "editor-ol",
		title: "Ordered list",
		action: "ol",
		active: "ol"
	},
	table: {
		id: "table",
		type: "button",
		dashicon: "editor-table",
		title: "Table",
		action: "table"
	},
	justifyleft: {
		id: "justifyleft",
		type: "button",
		dashicon: "editor-alignleft",
		title: "Justify Left",
		action: "JustifyLeft",
		active: "JustifyLeft"
	},
	justifycenter: {
		id: "justifycenter",
		type: "button",
		dashicon: "editor-aligncenter",
		title: "Justify Center",
		action: "JustifyCenter",
		active: "JustifyCenter"
	},
	justifyright: {
		id: "justifyright",
		type: "button",
		dashicon: "editor-alignright",
		title: "Justify Right",
		action: "JustifyRight",
		active: "JustifyRight"
	},
	justifyfull: {
		id: "justifyfull",
		type: "button",
		dashicon: "editor-justify",
		title: "Justify Full",
		action: "JustifyFull",
		active: "JustifyFull"
	},
	media: {
		id: "media",
		type: "button",
		dashicon: "format-image",
		title: "Media",
		action: "addmedia",
		modal: {
			type: "form",
			id: "media",
			display:"flex",
			children: [
				{
					type: "button",
					dashicon: "align-none",
					action: "alignnone",
					active: "alignnone"
				},
				{
					type: "button",
					dashicon: "align-left",
					action: "alignleft",
					active: "alignleft"
				},
				{
					type: "button",
					dashicon: "align-center",
					action: "aligncenter",
					active: "aligncenter"
				},
				{
					type: "button",
					dashicon: "align-right",
					action: "alignright",
					active: "alignright"
				},
				{
					type: "button",
					dashicon: "edit",
					title: "Replace Image",
					action: "addmedia"
				}
			]
			// children: [
			// 	{
			// 		type: "group",
			// 		display:"flex",
			// 		children: [
			// 			{
			// 				type: "button",
			// 				dashicon: "align-none",
			// 				state: "alignnone",
			// 				active: "alignnone"
			// 			},
			// 			{
			// 				type: "button",
			// 				dashicon: "align-left",
			// 				state: "alignleft",
			// 				active: "alignleft"
			// 			},
			// 			{
			// 				type: "button",
			// 				dashicon: "align-center",
			// 				state: "aligncenter",
			// 				active: "aligncenter"
			// 			},
			// 			{
			// 				type: "button",
			// 				dashicon: "align-right",
			// 				state: "alignright",
			// 				active: "alignright"
			// 			},
			// 			{
			// 				type: "button",
			// 				dashicon: "edit",
			// 				title: "Replace Image",
			// 				state: "addmedia"
			// 			}
			// 		]
			// 	}
			// ]
		}
	}
}
