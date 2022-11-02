// https://github.com/tinymce/tinymce-dist/blob/master/tinymce.js

// /Applications/MAMP/htdocs/wordpress/wp-includes/js/tinymce/plugins/link/plugin.min.js

KarmaFieldsAlpha.field.tinymce = class extends KarmaFieldsAlpha.field {

	constructor(resource) {
		super(resource);

		// this.image = this.createChild({
		// 	id: "image",
		// 	key: "image",
		// 	type: "file",
		// 	mimetypes: ["image"]
		// });
		//
		// this.file = this.createChild({
		// 	id: "file",
		// 	key: "file",
		// 	type: "file",
		// 	mimetypes: [],
		// 	multiple: false
		// });


		this.buffer = new KarmaFieldsAlpha.Buffer("tinymce");

	}

	async createEditor(element, ...path) {
		// if (this.editor) {
		// 	this.editor.destroy();
		// 	this.editor = null;
		// }

		// -> check if editor.element match

		let editor = this.buffer.get(...path);


		if (editor && editor.bodyElement !== element) {
			editor.destroy();
			editor = null;
		}

		if (!editor) {
			const editors = await tinyMCE.init({
				target: element,
				hidden_input: false,
				inline: true,
				menubar: false,
				contextmenu: false,
				toolbar: false,
				skin: false,
				// theme_url: "tinymce/themes/modern/theme.js",

		    // paste_as_text: true,

				paste_word_valid_elements: 'b,strong,i,em,ul,ol',

				// plugins: "link lists table paste",
				plugins: "link lists paste",
				convert_urls: false,

				// entity_encoding: "named",
				// image_caption: true,

				// paste_preprocess: (plugin, args) => {
			  //   console.log(args.content);
			  // }


				// paste_postprocess: (pl, o) => {
				// 	function unwrap(node) {
				// 		let container = document.createElement("div");
				// 		for (let child of node.childNodes) {
				// 			if (child.nodeType === Node.ELEMENT_NODE && child.matches("div,span")) {
				// 				container.append(...unwrap(child).childNodes);
				// 			} else {
				// 				container.append(child);
				// 			}
				// 		}
				// 		return container;
				// 	}
				// 	o.node = unwrap(o.node);
				// 	o.node.innerHTML = o.node.innerHTML.normalize();
			  // }
			});

			editor = editors.pop();

			// unactivate history
			editor.on("BeforeAddUndo", event => {
				event.preventDefault();
			});

			editor.on("input", event => {
				this.saveContent();
			});
			editor.on("paste", event => {
				this.saveContent();
			});
			editor.on("cut", event => {
				this.saveContent();
			});

			// -> input event does not seem to capture line break (single or double) or delete line break !
			editor.on("keyup", event => {
				if (event.key === "Backspace" || event.key === "Enter") {
					this.saveContent();
				}
			});


			editor.on("NodeChange", event => {
				if (event.selectionChange) {
					if (this.activeModal && event.element !== this.activeNode) {
						this.activeNode = null;
						this.activeModal = null;
						this.renderPopover();
					}
				}
				this.renderToolbar();
			});

			editor.on("focusout", event => {
				if (this.activeModal && (!event.relatedTarget || !this.popoverContainer.contains(event.relatedTarget))) {
					this.activeNode = null;
					this.activeModal = null;
					this.renderPopover();
				}
				this.renderToolbar();
			});

			editor.on("click", event => {

				const node = editor.selection.getNode();

				if (node.matches("a")) {
					this.activeNode = node;
					// this.request("link");
					this.activeModal = "linkForm";
					this.renderPopover();
				}

				if (node.matches("img")) {
					this.activeNode = node;
					// this.trigger("editmedia");
					this.request("editmedia");
				}

			});

			editor.on("dblclick", event => {
				const node = editor.selection.getNode();
				if (node.matches("img")) {
					this.request("addmedia");
				}
			});

			editor.on("ObjectResized", async event => {
				// await this.trigger("resizemedia");
				await this.request("resizemedia");
				await this.renderPopover();
			});

			this.buffer.set(editor, ...path);

		}

		return editor;
	}


	async request(subject, content, ...path) {


		switch (subject) {

			case "state": {
				const [key] = path;

				switch (key) {

					case "format": {
						const matches = this.editor && this.editor.queryCommandValue("FormatBlock").match(/h[1-6]/);
						return {value: matches && matches[0] || ""};
					}

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
						return {value: this.editor && this.editor.queryCommandState(key)};

					case "link":
						return {value: this.activeNode && this.activeNode.matches("a")};

					case "ul":
						return {value: this.editor && this.editor.queryCommandValue("InsertUnorderedList") === "true"};

					case "ol":
						return {value: this.editor && this.editor.queryCommandValue("InsertOrderedList") === "true"};

				}

				break;
			}

			case "get": {
				const [key, ...subpath] = path;

				switch (key) {

					case "format": {
						const matches = this.editor && this.editor.queryCommandValue("FormatBlock").match(/h[1-6]/);
						return matches && matches[0] || "";
					}

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

					case "link-form": {
						const linkObject = this.getLink() || {};
						return KarmaFieldsAlpha.DeepObject.get(linkObject, ...subpath);
					}

					case "link":
						return this.activeNode && this.activeNode.matches("a");

					case "ul":
						return this.editor && this.editor.queryCommandValue("InsertUnorderedList") === "true";

					case "ol":
						return this.editor && this.editor.queryCommandValue("InsertOrderedList") === "true";

				}

				break;
			}

			case "set": {

				const [key] = path;

				switch (key) {

					case "format":
						this.editor && this.editor.execCommand("FormatBlock", false, content.data);
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
						this.editor && this.editor.execCommand(key);
						break;

					case "link-form": {
						this.setLink(content);
						await this.saveContent();
						this.activeNode = null;
						this.activeModal = null;
						await this.renderPopover();
					}

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

				}
				break;
			}

			case "edit": {
				await this.saveContent();
				break;
			}


			case "command": {

				switch (content.command) {

					// case "unlink":
					// case "bold":
					// case "italic":
					// case "strikethrough":
					// case "superscript":
					// case "subscript":
					// case "JustifyLeft":
					// case "JustifyCenter":
					// case "JustifyRight":
					// case "JustifyFull":
					// case "JustifyNone":
					// 	this.editor.execCommand(content.command);
					// 	await this.saveContent();
					// 	break;

					// case "ul":
					// 	if (this.editor.queryCommandValue("InsertUnorderedList") !== "true") {
					// 		this.editor.execCommand('InsertUnorderedList', false, {
					// 		  'list-style-type': 'disc'
					// 		});
					// 	} else {
					// 		this.editor.execCommand("RemoveList");
					// 	}
					// 	await this.saveContent();
					// 	break;
					//
					// case "ol":
					// 	if (this.editor.queryCommandValue("InsertOrderedList") !== "true") {
					// 		this.editor.execCommand('InsertOrderedList', false, {
					// 			'list-style-type': 'decimal'
					// 		});
					// 	} else {
					// 		this.editor.execCommand("RemoveList");
					// 	}
					// 	await this.saveContent();
					// 	break;

					case "table":
						this.editor.execCommand('mceInsertTable', false, { rows: 2, columns: 2 });
						// this.editor.execCommand('mceTableInsertColAfter', false);
						await this.saveContent();
						break;



					case "attachfile":
						// -> open media
						// this.file.uploader.open(this.activeNode && this.activeNode.getAttribute("data-attachment-id"));
						break;

					case "addmedia":
						// -> open media
						// this.image.uploader.open(this.activeNode && this.activeNode.getAttribute("data-id"));
						break;

					case "editmedia":
						// this.activeModal = this.createChild(this.parseResource("media")).getModal();
						this.activeModal = "media";
						await this.renderPopover();
						break;

					case "resizemedia": {
						var node = this.editor.selection.getNode();
						var width = this.editor.selection.getNode().getAttribute("width");
						node.sizes = `(min-width: ${width}px) ${width}px, 100vw`;
						await this.saveContent();
						break;
					}

					case "alignnone":
					case "alignleft":
					case "alignright":
					case "aligncenter": {
						if (this.activeNode && this.editor) {
							this.activeNode.classList.remove("alignright");
							this.activeNode.classList.remove("alignleft");
							this.activeNode.classList.remove("aligncenter");
							if (content.command !== "alignnone") {
								this.activeNode.classList.add(content.command);
							}
							this.editor.nodeChanged();
							await this.renderPopover();
							await this.saveContent();
						}

						break;
					}


				}

			}

			case "link":
				// -> open popup
				// this.activeModal = this.createChild(this.parseResource("link")).getModal();
				this.activeModal = "linkForm";
				await this.renderPopover();
				break;




			// case "format":
			// 	return this.getFormat();

			// case "link":
			// 	return KarmaFieldsAlpha.DeepObject.get(this.getLink(), ...path);

			case "align": {
				if (this.activeNode) {
					if (this.activeNode.classList.contains("alignleft")) {
						return "left";
					} else if (this.activeNode.classList.contains("aligncenter")) {
						return "center";
					} else if (this.activeNode.classList.contains("alignright")) {
						return "right";
					}
				}
				return "none";
			}

			case "alignleft":
			case "aligncenter":
			case "alignright":
				return this.activeNode && this.activeNode.classList.contains(subject);

			case "alignnone":
				return this.activeNode
					&& !this.activeNode.classList.contains("alignleft")
					&& !this.activeNode.classList.contains("aligncenter")
					&& !this.activeNode.classList.contains("alignright");



			// case "ul":
			// 	return this.editor && this.editor.queryCommandValue("InsertUnorderedList") === "true";
			//
			// case "ol":
			// 	return this.editor && this.editor.queryCommandValue("InsertOrderedList") === "true";

			// case "bold":
			// case "italic":
			// case "strikethrough":
			// case "superscript":
			// case "subscript":
			// case "JustifyLeft":
			// case "JustifyCenter":
			// case "JustifyRight":
			// case "JustifyFull":
			// case "JustifyNone":
			// 	return this.editor && this.editor.queryCommandState(subject);

			case "selected":
				return this.editor && this.editor.selection.getContent().length > 0;

			case "close":
				this.activeNode = null;
				this.activeModal = null;
				await this.renderPopover();
				break;


			// set

			case "setFormat": {
				this.setFormat(content);
				await this.saveContent();
				break;
			}

			case "setImage": {
				// const images = await this.image.fetchIds(value, {sources: 1});
				// this.setImages(images);
				await this.saveContent();
				// this.activeModal = this.createChild(this.parseResource("media")).getModal();
				this.activeModal = "media";
				await this.renderPopover();
				break;
			}

			case "setFile": {
				// this.activeModal = this.createChild(this.parseResource("link")).getModal();
				this.activeModal = "link";
				await this.renderPopover();
				// const files = await this.file.fetchIds(value);
				// for (let file of files) {
				// 	await this.activeModal.buffer.set([file.original_src], "href");
				// 	await this.activeModal.buffer.set(value, "attachment_id");
				// 	break;
				// }
				await this.activeModal.render();
				break;
			}

			case "setLink": {
				this.setLink(content);
				await this.saveContent();
				this.activeNode = null;
				this.activeModal = null;
				await this.renderPopover();
				break;
			}

			default:
				return this.parent.request(subject, content, ...path);

		}

	}


	// async trigger(action) {
	//
	// 	switch (action) {
	//
	// 		case "link":
	// 			this.activeModal = this.createChild(this.parseResource("link")).getModal();
	// 			await this.renderPopover();
	// 			break;
	//
	// 		case "attachfile":
	// 			this.file.uploader.open(this.activeNode && this.activeNode.getAttribute("data-attachment-id"));
	// 			break;
	//
	// 		case "unlink":
	// 		case "bold":
	// 		case "italic":
	// 		case "strikethrough":
	// 		case "superscript":
	// 		case "subscript":
	// 		case "JustifyLeft":
	// 		case "JustifyCenter":
	// 		case "JustifyRight":
	// 		case "JustifyFull":
	// 		case "JustifyNone":
	// 			this.editor.execCommand(action);
	// 			await this.saveContent();
	// 			break;
	//
	// 		case "ul":
	// 			if (this.editor.queryCommandValue("InsertUnorderedList") !== "true") {
	// 				this.editor.execCommand('InsertUnorderedList', false, {
	// 				  'list-style-type': 'disc'
	// 				});
	// 			} else {
	// 				this.editor.execCommand("RemoveList");
	// 			}
	// 			await this.saveContent();
	// 			break;
	//
	// 		case "ol":
	// 			if (this.editor.queryCommandValue("InsertOrderedList") !== "true") {
	// 				this.editor.execCommand('InsertOrderedList', false, {
	// 					'list-style-type': 'decimal'
	// 				});
	// 			} else {
	// 				this.editor.execCommand("RemoveList");
	// 			}
	// 			await this.saveContent();
	// 			break;
	//
	// 		case "table":
	// 			this.editor.execCommand('mceInsertTable', false, { rows: 2, columns: 2 });
	// 			// this.editor.execCommand('mceTableInsertColAfter', false);
	// 			await this.saveContent();
	// 			break;
	//
	// 		case "close":
	// 			this.activeNode = null;
	// 			this.activeModal = null;
	// 			await this.renderPopover();
	// 			break;
	//
	// 		case "addmedia":
	// 			this.image.uploader.open(this.activeNode && this.activeNode.getAttribute("data-id"));
	// 			break;
	//
	// 		case "editmedia":
	// 			this.activeModal = this.createChild(this.parseResource("media")).getModal();
	// 			await this.renderPopover();
	// 			break;
	//
	// 		case "resizemedia":
	// 			var node = this.editor.selection.getNode();
	// 			var width = this.editor.selection.getNode().getAttribute("width");
	// 			node.sizes = `(min-width: ${width}px) ${width}px, 100vw`;
	// 			await this.saveContent();
	// 			break;
	//
	// 		case "alignnone":
	// 		case "alignleft":
	// 		case "alignright":
	// 		case "aligncenter":
	// 			this.activeNode.classList.remove("alignright");
	// 			this.activeNode.classList.remove("alignleft");
	// 			this.activeNode.classList.remove("aligncenter");
	// 			if (action !== "alignnone") {
	// 				this.activeNode.classList.add(action);
	// 			}
	// 			this.editor.nodeChanged();
	// 			await this.renderPopover();
	// 			await this.saveContent();
	// 			break;
	//
	// 	}
	//
	// }


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

		// const key = this.getKey();
		// const value = this.editor.getContent();
		// const current = await this.parent.request("get", {}, key);
		//
		// if (value !== KarmaFieldsAlpha.Type.toString(current)) {
		//
		// 	KarmaFieldsAlpha.History.save();
		// 	await this.parent.request("set", {data: value}, key);
		// 	await this.parent.request("edit");
		//
		// }


		this.throttle(async () => {

			const key = this.getKey();
			let value = this.editor.getContent();

			value = value.replace("&amp;nbsp;", "&nbsp;"); // -> tinymce convert &nbsp; into &amp;nbsp;

			const current = await this.parent.request("get", {}, key);

			if (value !== KarmaFieldsAlpha.Type.toString(current)) {

				KarmaFieldsAlpha.History.save();
				await this.parent.request("set", {data: value}, key);
				await this.parent.request("edit");

			}

		}, 500);


	}

	// async getValue() {
	//
	// 	const key = this.getKey();
	// 	const response = await this.parent.request("get", {}, key);
	//
	// 	return KarmaFieldsAlpha.Type.toString(response);
	//
	// }
	//
	//
	// async setValue(value) {
	//
	// 	await this.parent.request("set", {data: value}, key);
	// 	await this.parent.request("edit");
	//
	// }

	// -> like input
	async getDefault() {
		const defaults = {};

		const key = this.getKey();

		if (key && this.resource.default !== null) {

			defaults[key] = await this.parse(this.resource.default || "");

		}

		return defaults;
	}

	// -> like input
	throttle(callback, interval = 500, delay = 3000) {
		// if (!this.throttleDelayTimer) {
			if (this.throttleTimer) {
				clearTimeout(this.throttleTimer);
			}
			this.throttleTimer = setTimeout(callback, interval);
			// this.throttleDelayTimer = setTimeout(() => {
			// 	clearTimeout(this.throttleDelayTimer);
			// }, delay);
		// }

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
							update: toolbar => {
								this.renderToolbar = toolbar.render;
							},
							// child: this.createChild({
							// 	type: "group",
							// 	id: "editor-buttons",
							// 	display: "flex",
							// 	children: (this.resource.buttons || ["format", "bold", "italic", "link", "ul", "ol"]).map(child => this.parseResource(child))
							// }).build()
							child: this.createChild({
								type: "buttons",
								...this.resource.buttons
							}).build()
						}
					]
				},
				{
					class: "tinymce editor-body",
					update: async node => {
						node.element.editable = true;
						const key = this.getKey();
						const state = await this.parent.request("state", {}, key);

						if (!state.multi) {
							const state = await this.parent.request("state", {}, key);
							const value = KarmaFieldsAlpha.Type.toString(state.value);
							const path = await this.parent.request("path", {}, key);
							node.element.id = path.join("-");
							this.editor = await this.createEditor(node.element, ...path);
							this.editor.setContent(value);
						}




						// 	this.editor.setContent(value);
					}
					// update: async node => {
					// 	// const event = this.createEvent();
					// 	// event.action = "get";
					// 	// event.type = "string";
					// 	// event.default = this.getDefault(); // -> no care if promise
					// 	// await this.dispatch(event);
					// 	// this.editor.setContent(event.getString());
					// 	// debugger;
					// 	const value = await this.getValue();
					// 	this.editor.setContent(value);
					// }
				},
				{
					class: "karma-popover-container",
					update: container => {
						this.renderPopover = container.render;
						this.popoverContainer = container.element;
					// },
					// update: container => {
						container.element.onfocusout = event => {
							if (this.activeModal && (!event.relatedTarget || !container.element.contains(event.relatedTarget) && !this.editor.getBody().contains(event.relatedTarget))) {
								// this.activePopover = null;
								this.activeNode = null;
								this.activeModal = null;
								container.render();
							}
						};

						container.children = ["linkForm"].map(child => {
							return {
								class: "karma-tinymce-popover",
								init: popover => {
									popover.element.tabIndex = -1;
								},
								update: async popover => {
									popover.element.classList.toggle("hidden", this.activeModal !== child);
									popover.element.classList.toggle("active", this.activeModal === child);
									if (this.activeModal === child) {
										popover.children = [this.createChild({
											type: child,
											...this.resource.linkForm
										}).build()];
										if (this.editor) {
											const containerBox = container.element.parentNode.getBoundingClientRect();
											const nodeBox = this.activeNode ? this.activeNode.getBoundingClientRect() : this.editor.selection.getRng().getBoundingClientRect();
											popover.element.style.left = (nodeBox.left - containerBox.x).toFixed()+"px";
											popover.element.style.top = (nodeBox.bottom - containerBox.y + 5).toFixed()+"px";
										}
									}
								}
							};
						});



						// container.children = this.children.filter(child => child.resource.modal).map(child => {
						// 	return {
						// 		class: "karma-tinymce-popover",
						// 		init: popover => {
						// 			popover.element.tabIndex = -1;
						// 		},
						// 		update: async popover => {
						// 			const modal = child.getModal();
						//
						// 			popover.element.classList.toggle("active", this.activeModal === modal);
						// 			if (this.editor && this.activeModal === modal) {
						//
						// 				const containerBox = container.element.parentNode.getBoundingClientRect();
						// 				let nodeBox;
						//
						// 				if (this.activeNode) {
						// 					nodeBox = this.activeNode.getBoundingClientRect();
						// 				} else {
						// 					nodeBox = this.editor.selection.getRng().getBoundingClientRect()
						// 				}
						//
						// 				popover.element.style.left = (nodeBox.left - containerBox.x).toFixed()+"px";
						// 				popover.element.style.top = (nodeBox.bottom - containerBox.y + 5).toFixed()+"px";
						//
						// 				if (modal.buffer) {
						// 					modal.buffer.empty();
						// 				}
						//
						// 				popover.children = [modal.build()];
						// 			}
						//
						// 		}
						// 	};
						// });
					}
				}
			]
		}
	}

	// parseResource(resource) {
	// 	if (typeof resource === "string") {
	// 		resource = KarmaFieldsAlpha.field.tinymce.defaults[resource];
	// 	}
	// 	return resource;
	// }

	static buttons = class extends KarmaFieldsAlpha.field.container {

		constructor(resource) {

			super({
				display: "flex",
				// children: ["format", "bold", "italic", "link", "ul", "ol"],
				children: ["format", "bold", "italic", "link", "ul", "ol"],
				...resource
			});

		}

		static format = class extends KarmaFieldsAlpha.field.dropdown {
			constructor(resource) {
				super({
					type: "dropdown",
					key: "format",
					options: [
						{id: "", name: "Format"},
						{id: "h1", name: "H1"},
						{id: "h2", name: "H2"},
						{id: "h3", name: "H3"},
						{id: "h4", name: "H4"},
						{id: "h5", name: "H5"},
						{id: "h6", name: "H6"},
						{id: "p", name: "P"}
					],
					...resource
				});
			}
		}

		static bold = class extends KarmaFieldsAlpha.field.button {
			constructor(resource) {
				super({
					dashicon: "editor-bold",
					title: "Bold",
					action: "set",
					path: ["bold"],
					active: ["get", "boolean", "bold"],
					...resource
				});
			}
		}

		static italic = class extends KarmaFieldsAlpha.field.button {
			constructor(resource) {
				super({
					dashicon: "editor-italic",
					title: "Italic",
					action: "set",
					path: ["italic"],
					active: ["get", "boolean", "italic"],
					...resource
				});
			}
		}

		static link = class extends KarmaFieldsAlpha.field.button {
			constructor(resource) {
				super({
					dashicon: "admin-links",
					title: "Link",
					action: "link",
					// path: ["link"],
					active: ["get", "boolean", "link"],
					disabled: ["!", ["selected"]],
					...resource
				});
			}
		}

		static ul = class extends KarmaFieldsAlpha.field.button {
			constructor(resource) {
				super({
					dashicon: "editor-ul",
					title: "Unordered list",
					action: "set",
					path: ["ul"],
					active: ["get", "boolean", "ul"],
					...resource
				});
			}
		}

		static ol = class extends KarmaFieldsAlpha.field.button {
			constructor(resource) {
				super({
					dashicon: "editor-ol",
					title: "Ordered list",
					action: "set",
					path: ["ol"],
					active: ["get", "boolean", "ol"],
					...resource
				});
			}
		}

	}

	static form = class extends KarmaFieldsAlpha.field.container {

		constructor(resource) {
			super(resource);
			this.buffer = null;
		}

		async request(subject, content, ...path) {

			switch (subject) {

				case "state": {
					const value = KarmaFieldsAlpha.DeepObject.get(this.buffer || {}, ...path) || await this.parent.request("get", {}, this.resource.key, ...path);
					return {
						value: value
					};
				}

				case "get":
					return KarmaFieldsAlpha.DeepObject.get(this.buffer || {}, ...path) || await this.parent.request("get", {}, this.resource.key, ...path);

				case "set":
					this.buffer ||= {};
					KarmaFieldsAlpha.DeepObject.assign(this.buffer, [content.data], ...path);
					break;

				case "modified":
					return Boolean(this.buffer);

				case "submit":
					await this.parent.request("set", this.buffer, this.resource.key);
					this.buffer = null;
					break;

				case "edit":
					await this.render();
					break;

				case "unlink":
					await this.parent.request("set", {}, "unlink");
					await this.parent.request("edit");
					break;

			}

		}

	}

	static linkForm = class extends this.form {
		constructor(resource) {
			super({
				key: "link-form",
				children: [
					{
						type: "group",
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
								children: [
									{
										type: "button",
										title: "Cancel",
										action: "close"
									},
									{
										type: "button",
										title: "Unlink",
										action: "unlink",
										disabled: ["!", ["get", "boolean", "href"]]
									},
									{
										type: "separator"
									},
									{
										type: "submit",
										title: "Apply"
									}
								]
							}
						]
					}
				],
				...resource
			});
		}
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
