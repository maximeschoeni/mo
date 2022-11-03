KarmaFieldsAlpha.fields.text = class extends KarmaFieldsAlpha.fields.field {

	// async update() {
	// 	const value = await super.update();
	// 	if (this.resource.driver) {
	// 		const queryString = KarmaFieldsAlpha.Form.encodeParams({
	// 			key: this.resource.key
	// 		}, "?"); //this.getParamString("?"); // "?"+key+"="+field.resource.key
	// 		const results = await this.getRemoteOptions(queryString, this.resource.driver);
	// 		const options = results.items || results || [];
	// 		const option = options.find(option => option.key === value);
	// 		if (option) {
	// 			return option[this.resource.option_property || "name"];
	// 		}
	// 	}
	// 	return value;
	// }

	// async getText() {
	// 	const value = this.resource.value || await this.fetchValue();
	// 	if (this.resource.driver) {
	// 		const options = await this.fetchOptions();
	// 		const option = options.find(option => option.key === value);
	// 		if (option) {
	// 			return option[this.resource.option_property || "name"];
	// 		}
	// 	}
	// 	return value;
	// }

	initField() {

		// -> compat
		if (!this.resource.value && this.resource.key && this.resource.driver) {
			console.warn("DEPRECATED");
			this.resource.value = "%"+this.resource.key+":"+this.resource.driver+"%";
		} else if (!this.resource.value && this.resource.key) {
			console.warn("DEPRECATED");
			this.resource.value = "%"+this.resource.key+"%";
		}

		if (!this.resource.value) {
			console.error("Resource missing value attribute");
		}
		
		if (this.resource.multiple) {
			this.registerType("json");
		}
	}

	async getTexts() {
		const text = this.resource.value || await this.fetchValue();
		if (text) {
			const texts = this.resource.multiple && text.split(",") || [text];
			if (this.resource.driver) {
				const options = await this.fetchOptions();
				return texts.map(text => {
					const option = options.find(option => option.key === text);
					return option && option.name;
				});
			}
			return texts;
		}
		return [];
	}

	async getLinks() {
		const link = await this.parent.fetchValue(null, this.resource.link.key);
		if (link) {
			return this.resource.multiple && link.split(",") || [link];
		}
		return [];
	}

	async fetchText(key, driver) {
		const value = await this.parent.fetchValue(null, key);
		if (driver) {
			const options = await this.fetchOptions(driver);
			const option = options.find(option => option.key === value);
			return option && option.name || "";
		}
		return value;
	}

	async parseTemplate(value) {
		const matches = value.match(/%([^%]+)%/g);
		if (matches) {
			const values = await Promise.all(matches.map(match => this.fetchText.call(null, match.slice(1, -1).split(":"))));
			matches.forEach((match, index) => {
				value = value.replace(match, values[i] || "");
			});
		}
		return value;
	}



	// async parseValue(value, text) {
	// 	const match = value.match(/%value%/);
	// 	if (match) {
	// 		text = text.replace("%value%", value);
	// 	}
	// 	const matchDriver = value.match(/%value:([^%]+)%/);
	// 	if (matchDriver) {
	// 		const driver = matchDriver[1];
	// 		const options = await this.fetchOptions(driver);
	// 		const option = options.find(option => option.key === value);
	// 		text = text.replace("%value%", option && option.name || "");
	// 	}
	// 	return text;
	// }
	//
	// async parseTemplateBy(key, value, text) {
	// 	const reg = new RegExp("%("+key+")(:([^%]*))?%");
	// 	const matches = value.match(reg);
	// 	if (matches) {
	// 		const replacement = await this.fetchText(matches[1], matches[3]);
	// 		value = value.replace("%"+key+"%", replacement);
	// 	}
	// 	return text;
	// }

	// async parseTemplateByKeys(keys, text) {
	// 	Object.entries(keys).map(entry => {
	// 		const [key, item] = entry;
	// 		const values = await this.parent.fetchValue(null, key);
	//
	// 		values.map(value => {
	//
	// 			const reg = new RegExp("%("+key+")(:([^%]*))?%");
	// 			const matches = value.match(reg);
	// 			if (matches) {
	// 				const replacement = await this.fetchText(matches[1], matches[3]);
	// 				value = value.replace("%"+key+"%", replacement);
	// 			}
	//
	//
	//
	// 			this.parseTemplateBy(item, value);
	//
	// 		})
	//
	// 		text = this.parseTemplateBy(item, value);
	//
	// 	});
	//
	// 	const matches = value.match(reg);
	// 	if (matches) {
	// 		const replacement = await this.fetchText(matches[1], matches[3]);
	// 		value = value.replace("%"+key+"%", replacement);
	// 	}
	// 	return value;
	// }
	//
	// async parseValue(value) {
	// 	if (this.resource.multiple) {
	// 		return Promise.all(value.map(template => this.parseTemplate(template)));
	// 	} else {
	// 		return this.parseTemplate(value);
	// 	}
	// }

	async parseText(text, key, value) {
		if (key && value !== undefined) {
			text = text.replace("%"+key+"%", value);
		}
		if (key) {
			text = text.replace(/%value:([^%]+)%/, (match, driver) => "%"+key+":"+driver+"%");
		}
		return this.parseTemplate(text);
	}






	buildLink(text, link) {
		return {
			tag: "a",
			init: span => {
				if (this.resource.a) {
					Object.assign(span.element, this.resource.a);
				}
			},
			update: async node => {
				node.element.href = link;

				// if (resource.href) {
				// 	node.element.href = resource.href.replace("%value%", link);
				// } else {
				// 	node.element.onclick = async event => {
				// 		event.preventDefault();
				//
				// 		KarmaFieldsAlpha.History.backup();
				// 		KarmaFieldsAlpha.History.setParam(resource.target || resource.key, link);
				//
				// 		if (resource.params) {
				// 			KarmaFieldsAlpha.History.setParams(resource.params);
				// 		}
				//
				// 		node.element.classList.add("editing");
				// 		await this.editParam(true);
				// 		node.element.classList.remove("editing");
				// 	}
				// }
				node.element.innerHTML = text;
			}
		};
	}

	buildText(text) {
		return {
			tag: resource.tag || "div",
			class: "text-item",
			init: span => {
				if (this.resource.element) {
					Object.assign(span.element, this.resource.element);
				}
			},
			update: async node => {
				node.element.innerHTML = text;
			}
		};
	}

	build() {
		return {
			class: "text karma-field",
			init: span => {
				span.element.setAttribute('tabindex', '-1');
			},
			update: async node => {
				this.render = node.render;
				node.element.classList.add("loading");
				// const text = await this.getText() || "";
				// const texts = this.resource.multiple && text.split(",") || [text];

				const texts = await this.getTexts() || [];


				if (this.resource.link) {
					// const link = await this.parent.fetchValue(null, this.resource.link.key);
					// const links = this.resource.multiple && link.split(",") || [link];

					// const links = await this.getLinks();
					//
					// node.children = links.map((link, index) => this.buildLink(texts[index], link, this.resource.link));

					if (this.resource.key && this.resource.multiple) {
						const values = await this.fetchValue();
						const texts = await Promise.all(value.map(value => this.parseText(this.resource.value, "value", value)));
						const links = await Promise.all(value.map(value => this.parseText(this.resource.href, "value", value)));
						node.children = texts.map((text, index) => this.buildLink(text, links[index]));
					} else {
						const text = await this.parseText(this.resource.value, this.resource.key);
						node.children = [this.buildText(text)];
					}

				} else {



					// if (this.resource.key) {
					// 	const value = await this.fetchValue();
					// 	if (this.resource.multiple) {
					// 		const texts = await Promise.all(value.map(value => this.parseText("value", value)));
					// 		node.children = texts.map(text => this.buildText(text));
					// 	} else {
					// 		node.children = [this.buildText()];
					// 	}
					// } else {
					// 	node.children = [this.buildText()];
					// }

					if (this.resource.key && this.resource.multiple) {
						const values = await this.fetchValue();
						const texts = await Promise.all(value.map(value => this.parseText(this.resource.value, "value", value)));
						node.children = texts.map(text => this.buildText(text));
					} else {
						const text = await this.parseText(this.resource.value, this.resource.key);
						node.children = [this.buildText(text)];
					}






					// if (this.resource.multiple) {
					// 	const texts = await Promise.all(value.map(template => this.parseTemplate(template)));
					// 	node.children = texts.map(text => this.buildText(text, this.resource));
					// } else {
					// 	return this.parseTemplate(value);
					// }
					//
					// const texts = this.
					// node.children = texts.map(text => this.buildText(text, this.resource));
				}

				// node.element.innerHTML = value;
				// node.element.classList.remove("loading");
			},
			complete: node => {
				node.element.classList.remove("loading");
			}
		};
	}




	// build() {
	// 	return {
	// 		tag: this.resource.tag || (this.resource.link ? "a" : "span"),
	// 		class: "text karma-field",
	// 		init: span => {
	// 			span.element.setAttribute('tabindex', '-1');
	// 			if (this.resource.element) {
	// 				Object.assign(span.element, this.resource.element);
	// 			}
	// 		},
	// 		update: async node => {
	// 			this.render = node.render;
	// 			node.element.classList.add("loading");
	// 			const value = await this.getText() || "";
	//
	// 			if (this.resource.link) {
	// 				const linkValue = await this.parent.fetchValue(null, this.resource.link.key);
	// 				if (this.resource.link.href) {
	// 					node.element.href = this.resource.link.href.replace("%value%", value);
	// 				} else {
	// 					node.element.onclick = async event => {
	// 						event.preventDefault();
	//
	// 						KarmaFieldsAlpha.History.backup();
	// 						KarmaFieldsAlpha.History.setParam(this.resource.link.target || this.resource.link.key, linkValue);
	//
	// 						if (this.resource.link.params) {
	// 							KarmaFieldsAlpha.History.setParams(this.resource.link.params);
	// 						}
	//
	// 						node.element.classList.add("editing");
	// 						await this.editParam(true);
	// 						node.element.classList.remove("editing");
	// 					}
	// 				}
	// 			}
	//
	// 			node.element.innerHTML = value;
	// 			node.element.classList.remove("loading");
	// 		}
	// 	};
	// }


}
